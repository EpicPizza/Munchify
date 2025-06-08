import axios from 'axios';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const execAsync = promisify(exec);

interface AudioInterval {
    script: string;
    order: number;  // To maintain the correct order of intervals
}

interface GenerationProgress {
    stage: 'generating' | 'processing' | 'concatenating';
    currentInterval?: number;
    totalIntervals: number;
    message: string;
}

export class AudioGenerationService {
    private readonly apiKey: string;
    private readonly voiceId: string;
    private readonly modelId: string;
    private readonly tempDir: string;

    constructor(
        voiceId: string = 'pNInz6obpgDQGcFmaJgB',
        modelId: string = 'eleven_monolingual_v1',
        tempDir: string = './temp_audio'
    ) {
        const apiKey = process.env.ELEVEN_LABS_API_KEY;
        if (!apiKey) {
            throw new Error('ELEVEN_LABS_API_KEY environment variable is not set');
        }
        this.apiKey = apiKey;
        this.voiceId = voiceId;
        this.modelId = modelId;
        this.tempDir = tempDir;
    }

    private async generateSingleAudio(script: string, outputPath: string): Promise<void> {
        try {
            const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;
            
            const response = await axios({
                method: 'POST',
                url,
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                data: {
                    text: script,
                    model_id: this.modelId,
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                },
                responseType: 'stream'
            });

            const writer = createWriteStream(outputPath);
            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', (error: Error) => {
                    writer.close();
                    reject(new Error(`Failed to write audio file: ${error.message}`));
                });
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`ElevenLabs API error: ${error.message}`);
            }
            throw error;
        }
    }

    private async applyFadeEffect(inputPath: string, outputPath: string, fadeIn: boolean, fadeOut: boolean): Promise<void> {
        try {
            // First, verify the input file exists and has content
            const stats = await fs.stat(inputPath);
            if (stats.size === 0) {
                throw new Error(`Input file ${inputPath} is empty`);
            }

            let filterComplex = '';
            if (fadeIn && fadeOut) {
                filterComplex = 'afade=t=in:st=0:d=0.5,afade=t=out:st=-0.5:d=0.5';
            } else if (fadeIn) {
                filterComplex = 'afade=t=in:st=0:d=0.5';
            } else if (fadeOut) {
                filterComplex = 'afade=t=out:st=-0.5:d=0.5';
            }

            if (filterComplex) {
                // Add -loglevel debug for more information
                const command = `ffmpeg -y -loglevel debug -i "${inputPath}" -af "${filterComplex}" "${outputPath}"`;
                console.log(`Executing FFmpeg command: ${command}`);
                
                const { stdout, stderr } = await execAsync(command);
                if (stderr) {
                    console.error('FFmpeg stderr:', stderr);
                }
                if (stdout) {
                    console.log('FFmpeg stdout:', stdout);
                }

                // Verify the output file was created and has content
                const outStats = await fs.stat(outputPath);
                if (outStats.size === 0) {
                    throw new Error(`FFmpeg produced an empty output file: ${outputPath}`);
                }
            } else {
                await fs.copyFile(inputPath, outputPath);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`FFmpeg processing error: ${error.message}`);
            }
            throw error;
        }
    }

    async generateAudioForIntervals(
        intervals: AudioInterval[],
        progressCallback?: (progress: GenerationProgress) => void
    ): Promise<string> {
        if (intervals.length !== 5) {
            throw new Error('Exactly 5 intervals must be provided');
        }

        // Sort intervals by order to ensure correct sequence
        intervals.sort((a, b) => a.order - b.order);

        // Create temp directory with absolute path
        const absoluteTempDir = path.resolve(this.tempDir);
        await fs.mkdir(absoluteTempDir, { recursive: true });
        console.log(`Using temporary directory: ${absoluteTempDir}`);

        try {
            // Generate individual audio files
            const audioFiles: string[] = [];
            for (let i = 0; i < intervals.length; i++) {
                const rawAudioPath = path.join(absoluteTempDir, `raw_${i}.mp3`);
                const processedAudioPath = path.join(absoluteTempDir, `processed_${i}.mp3`);
                
                console.log(`\nProcessing interval ${i + 1}/5:`);
                console.log(`Generating audio for script: "${intervals[i].script.substring(0, 50)}..."`);
                await this.generateSingleAudio(intervals[i].script, rawAudioPath);
                
                // Verify raw audio file
                const rawStats = await fs.stat(rawAudioPath);
                console.log(`Raw audio file size: ${rawStats.size} bytes`);
                
                progressCallback?.({
                    stage: 'processing',
                    currentInterval: i + 1,
                    totalIntervals: intervals.length,
                    message: `Applying fade effects to interval ${i + 1}/5`
                });

                // Apply fade effects
                const isFirst = i === 0;
                const isLast = i === intervals.length - 1;
                console.log(`Applying fade effects (fadeIn: ${!isFirst}, fadeOut: ${!isLast})`);
                await this.applyFadeEffect(
                    rawAudioPath,
                    processedAudioPath,
                    !isFirst, // fade in for all except first
                    !isLast  // fade out for all except last
                );
                
                audioFiles.push(processedAudioPath);
                await fs.unlink(rawAudioPath); // Clean up raw file immediately
            }

            // Concatenate all audio files
            console.log('\nConcatenating audio files...');
            const finalOutputPath = path.join(absoluteTempDir, 'final_output.mp3');
            const fileList = audioFiles.map(file => `file '${file}'`).join('\n');
            const listFilePath = path.join(absoluteTempDir, 'files.txt');
            
            await fs.writeFile(listFilePath, fileList);
            console.log('Created file list:', fileList);

            const concatCommand = `ffmpeg -y -f concat -safe 0 -i "${listFilePath}" -c copy "${finalOutputPath}"`;
            console.log('Executing concat command:', concatCommand);
            const { stdout, stderr } = await execAsync(concatCommand);
            
            if (stderr) {
                console.error('FFmpeg concat stderr:', stderr);
            }
            if (stdout) {
                console.log('FFmpeg concat stdout:', stdout);
            }

            // Clean up temporary files
            for (const file of audioFiles) {
                await fs.unlink(file);
            }
            await fs.unlink(listFilePath);

            // Verify final output
            const finalStats = await fs.stat(finalOutputPath);
            console.log(`Final output file size: ${finalStats.size} bytes`);

            return finalOutputPath;
        } catch (error) {
            // Clean up any remaining temporary files in case of error
            try {
                const files = await fs.readdir(absoluteTempDir);
                await Promise.all(
                    files.map(file => fs.unlink(path.join(absoluteTempDir, file)).catch(() => {}))
                );
            } catch (cleanupError) {
                console.error('Failed to clean up temporary files:', cleanupError instanceof Error ? cleanupError.message : String(cleanupError));
            }

            throw new Error(`Audio generation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
} 