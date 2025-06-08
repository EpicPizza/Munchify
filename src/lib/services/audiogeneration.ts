import axios, { AxiosError } from 'axios';
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
            const errorMessage = error instanceof AxiosError 
                ? `ElevenLabs API error: ${error.response?.data?.message || error.message}`
                : `Unexpected error: ${(error as Error).message}`;
            throw new Error(errorMessage);
        }
    }

    private async applyFadeEffect(inputPath: string, outputPath: string, fadeIn: boolean, fadeOut: boolean): Promise<void> {
        try {
            let filterComplex = '';
            if (fadeIn && fadeOut) {
                filterComplex = 'afade=t=in:st=0:d=0.5,afade=t=out:st=-0.5:d=0.5';
            } else if (fadeIn) {
                filterComplex = 'afade=t=in:st=0:d=0.5';
            } else if (fadeOut) {
                filterComplex = 'afade=t=out:st=-0.5:d=0.5';
            }

            if (filterComplex) {
                await execAsync(`ffmpeg -y -i "${inputPath}" -af "${filterComplex}" "${outputPath}"`);
            } else {
                await fs.copyFile(inputPath, outputPath);
            }
        } catch (error) {
            throw new Error(`FFmpeg processing error: ${(error as Error).message}`);
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

        // Ensure temp directory exists
        await fs.mkdir(this.tempDir, { recursive: true });

        try {
            // Generate individual audio files
            const audioFiles: string[] = [];
            for (let i = 0; i < intervals.length; i++) {
                const rawAudioPath = path.join(this.tempDir, `raw_${i}.mp3`);
                const processedAudioPath = path.join(this.tempDir, `processed_${i}.mp3`);
                
                progressCallback?.({
                    stage: 'generating',
                    currentInterval: i + 1,
                    totalIntervals: intervals.length,
                    message: `Generating audio for interval ${i + 1}/5: "${intervals[i].script.substring(0, 50)}..."`
                });

                await this.generateSingleAudio(intervals[i].script, rawAudioPath);
                
                progressCallback?.({
                    stage: 'processing',
                    currentInterval: i + 1,
                    totalIntervals: intervals.length,
                    message: `Applying fade effects to interval ${i + 1}/5`
                });

                // Apply fade effects
                const isFirst = i === 0;
                const isLast = i === intervals.length - 1;
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
            progressCallback?.({
                stage: 'concatenating',
                totalIntervals: intervals.length,
                message: 'Concatenating all audio segments'
            });

            const finalOutputPath = path.join(this.tempDir, 'final_output.mp3');
            const fileList = audioFiles.map(file => `file '${file}'`).join('\n');
            const listFilePath = path.join(this.tempDir, 'files.txt');
            
            await fs.writeFile(listFilePath, fileList);
            await execAsync(`ffmpeg -y -f concat -safe 0 -i "${listFilePath}" -c copy "${finalOutputPath}"`);

            // Clean up temporary files
            for (const file of audioFiles) {
                await fs.unlink(file);
            }
            await fs.unlink(listFilePath);

            return finalOutputPath;
        } catch (error) {
            // Clean up any remaining temporary files in case of error
            try {
                const files = await fs.readdir(this.tempDir);
                await Promise.all(
                    files.map(file => fs.unlink(path.join(this.tempDir, file)).catch(() => {}))
                );
            } catch (cleanupError) {
                console.error('Failed to clean up temporary files:', cleanupError instanceof Error ? cleanupError.message : String(cleanupError));
            }

            throw new Error(`Audio generation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
} 