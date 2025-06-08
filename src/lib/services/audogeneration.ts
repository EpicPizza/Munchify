import axios from 'axios';
import { Readable } from 'stream';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

interface AudioInterval {
    script: string;
}

export class AudioGenerationService {
    private readonly apiKey: string;
    private readonly voiceId: string;
    private readonly modelId: string;

    constructor(apiKey: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB', modelId: string = 'eleven_monolingual_v1') {
        this.apiKey = apiKey;
        this.voiceId = voiceId;
        this.modelId = modelId;
    }

    private async generateSingleAudio(script: string, outputPath: string): Promise<void> {
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
            writer.on('error', reject);
        });
    }

    private async applyFadeEffect(inputPath: string, outputPath: string, fadeIn: boolean, fadeOut: boolean): Promise<void> {
        let filterComplex = '';
        if (fadeIn && fadeOut) {
            filterComplex = 'afade=t=in:st=0:d=0.5,afade=t=out:st=-0.5:d=0.5';
        } else if (fadeIn) {
            filterComplex = 'afade=t=in:st=0:d=0.5';
        } else if (fadeOut) {
            filterComplex = 'afade=t=out:st=-0.5:d=0.5';
        }

        if (filterComplex) {
            await execAsync(`ffmpeg -i ${inputPath} -af "${filterComplex}" ${outputPath}`);
        } else {
            await fs.copyFile(inputPath, outputPath);
        }
    }

    async generateAudioForIntervals(intervals: AudioInterval[]): Promise<string> {
        const tempDir = './temp_audio';
        await fs.mkdir(tempDir, { recursive: true });

        // Generate individual audio files
        const audioFiles: string[] = [];
        for (let i = 0; i < intervals.length; i++) {
            const rawAudioPath = `${tempDir}/raw_${i}.mp3`;
            const processedAudioPath = `${tempDir}/processed_${i}.mp3`;
            
            await this.generateSingleAudio(intervals[i].script, rawAudioPath);
            
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
        }

        // Concatenate all audio files
        const finalOutputPath = `${tempDir}/final_output.mp3`;
        const fileList = audioFiles.map(file => `file '${file}'`).join('\n');
        const listFilePath = `${tempDir}/files.txt`;
        await fs.writeFile(listFilePath, fileList);

        await execAsync(`ffmpeg -f concat -safe 0 -i ${listFilePath} -c copy ${finalOutputPath}`);

        // Clean up temporary files
        for (const file of audioFiles) {
            await fs.unlink(file);
        }
        await fs.unlink(listFilePath);

        return finalOutputPath;
    }
} 