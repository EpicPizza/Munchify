import { GoogleGenerativeAI } from '@google/generative-ai';
import { Vimeo } from 'vimeo';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import type { FileData } from '@ffmpeg/ffmpeg';

// Initialize Gemini
const genAI = new GoogleGenerativeAI('');

// Initialize FFmpeg lazily
let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
    if (!ffmpegInstance) {
        ffmpegInstance = new FFmpeg();
        await ffmpegInstance.load();
    }
    return ffmpegInstance;
}

interface VideoSegment {
    interval: string;
    script: string;
    storyboard: {
        visual: string;
        textOverlay: string;
        camera: string;
        animationStyle: string;
        audioCue: string;
        narration: string;
    };
    duration: number;
}

export async function generateVideoPrompts(topic: string): Promise<VideoSegment[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Create a detailed video script divided into 5 intervals of 8 seconds each for a video about "${topic}".
    For each interval, provide the following structure exactly:

    Interval X (MM:SS-MM:SS)
    Script (8s): [Concise script for this segment]
    Storyboard:
    Visual: [Detailed description of visual elements and their animation]
    Text Overlay: [Any text that appears on screen with timing]
    Camera: [Description of camera movements]
    Animation Style Notes: [Specific style guidelines, always mention 24 fps]
    Audio Cue: [Description of music and sound effects]
    Narration: [The exact narration text]

    Make each interval flow naturally into the next. Focus on creating a cohesive narrative that can be split into 5 distinct but connected segments.
    Each visual description should be highly detailed and specific, perfect for AI video generation.
    Use the exact same format as this example:

    Interval 1 (00:00-00:08)
    Script (8s): [Your script here]
    Storyboard:
    Visual: [Your visual description]
    Text Overlay: [Your text overlay details]
    Camera: [Your camera movements]
    Animation Style Notes: [Your style notes]
    Audio Cue: [Your audio description]
    Narration: [Your narration text]

    Continue this exact format for all 5 intervals.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response text into segments
    const segments = text.split(/Interval \d+/).filter(Boolean).map(segment => {
        const intervalMatch = segment.match(/\((\d{2}:\d{2}-\d{2}:\d{2})\)/);
        const scriptMatch = segment.match(/Script \(8s\):([\s\S]*?)Storyboard:/);
        const visualMatch = segment.match(/Visual:([\s\S]*?)Text Overlay:/);
        const textOverlayMatch = segment.match(/Text Overlay:([\s\S]*?)Camera:/);
        const cameraMatch = segment.match(/Camera:([\s\S]*?)Animation Style Notes:/);
        const styleMatch = segment.match(/Animation Style Notes:([\s\S]*?)Audio Cue:/);
        const audioMatch = segment.match(/Audio Cue:([\s\S]*?)Narration:/);
        const narrationMatch = segment.match(/Narration:([\s\S]*?)(?:$|Interval)/);

        return {
            interval: intervalMatch ? intervalMatch[1] : '',
            script: scriptMatch ? scriptMatch[1].trim() : '',
            storyboard: {
                visual: visualMatch ? visualMatch[1].trim() : '',
                textOverlay: textOverlayMatch ? textOverlayMatch[1].trim() : '',
                camera: cameraMatch ? cameraMatch[1].trim() : '',
                animationStyle: styleMatch ? styleMatch[1].trim() : '',
                audioCue: audioMatch ? audioMatch[1].trim() : '',
                narration: narrationMatch ? narrationMatch[1].trim() : ''
            },
            duration: 8
        };
    });

    return segments;
}

async function generateVeo2Video(segment: VideoSegment): Promise<string> {
    // Since Veo2 shares the same API key as Gemini, we'll use the same key
    const model = genAI.getGenerativeModel({ model: 'veo2' });
    
    try {
        // Format the prompt as a string with JSON-like structure that Veo2 can understand
        const prompt = `
Generate a video with the following specifications:
Timing: ${segment.interval}
Script: ${segment.script}

Visual Details:
${segment.storyboard.visual}

Camera Movement:
${segment.storyboard.camera}

Animation Style:
${segment.storyboard.animationStyle}

Text Overlays:
${segment.storyboard.textOverlay}

Audio:
${segment.storyboard.audioCue}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // Veo2 should return a video URL or data
        const generatedContent = response.text();
        
        if (!generatedContent) {
            throw new Error('No video content generated');
        }
        
        return generatedContent;
    } catch (error) {
        console.error('Error generating video with Veo2:', error);
        throw error;
    }
}

async function downloadVideo(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
}

// Constants for error handling
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

interface GenerationError {
    segmentIndex: number;
    attempt: number;
    error: Error;
    timestamp: Date;
}

interface GenerationResult {
    success: boolean;
    url?: string;
    error?: GenerationError;
}

// Helper function to delay between retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry failed operations
async function withRetry<T>(
    operation: () => Promise<T>,
    segmentIndex: number,
    maxRetries: number = MAX_RETRIES
): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            console.error(`Attempt ${attempt} failed for segment ${segmentIndex}:`, error);
            
            if (attempt < maxRetries) {
                await delay(RETRY_DELAY * attempt); // Exponential backoff
                console.log(`Retrying segment ${segmentIndex}, attempt ${attempt + 1}...`);
            }
        }
    }
    
    throw new Error(`All ${maxRetries} attempts failed for segment ${segmentIndex}. Last error: ${lastError?.message}`);
}

async function generateVeo2VideoWithRetry(
    segment: VideoSegment,
    index: number
): Promise<GenerationResult> {
    try {
        const url = await withRetry(
            () => generateVeo2Video(segment),
            index
        );
        
        return {
            success: true,
            url
        };
    } catch (error) {
        return {
            success: false,
            error: {
                segmentIndex: index,
                attempt: MAX_RETRIES,
                error: error as Error,
                timestamp: new Date()
            }
        };
    }
}

async function downloadVideoWithRetry(url: string, index: number): Promise<Uint8Array> {
    return withRetry(
        () => downloadVideo(url),
        index
    );
}

export async function generateFullVideo(topic: string): Promise<string> {
    const errors: GenerationError[] = [];
    const successfulSegments: { url: string; index: number }[] = [];

    try {
        // 1. Generate prompts using Gemini
        const videoSegments = await generateVideoPrompts(topic);
        
        // 2. Generate individual video segments using Veo2 with error handling
        const results = await Promise.all(
            videoSegments.map((segment, index) => 
                generateVeo2VideoWithRetry(segment, index)
            )
        );

        // Process results and collect errors
        results.forEach((result, index) => {
            if (result.success && result.url) {
                successfulSegments.push({ url: result.url, index });
            } else if (result.error) {
                errors.push(result.error);
            }
        });

        // If we have no successful segments, throw error
        if (successfulSegments.length === 0) {
            throw new Error('All video segments failed to generate. Check errors array for details.');
        }

        // If we have some successful segments but not all, log warning
        if (successfulSegments.length < videoSegments.length) {
            console.warn(`Only ${successfulSegments.length} out of ${videoSegments.length} segments generated successfully.`);
        }

        // Sort segments by original index to maintain order
        const sortedUrls = successfulSegments
            .sort((a, b) => a.index - b.index)
            .map(segment => segment.url);

        // 3. Concatenate successful videos
        try {
            const finalVideoUrl = await concatenateVideos(sortedUrls);
            return finalVideoUrl;
        } catch (err) {
            // If concatenation fails, but we have at least one successful segment,
            // return the first successful segment as fallback
            const error = err instanceof Error ? err : new Error(String(err));
            console.error('Video concatenation failed:', error);
            if (sortedUrls.length > 0) {
                console.log('Falling back to single segment video');
                return sortedUrls[0];
            }
            throw error;
        }
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Error in full video generation process:', error);
        console.error('Detailed errors:', errors);
        throw new Error(`Video generation failed: ${error.message}. ${errors.length} segment errors occurred.`);
    }
}

// Update concatenateVideos to handle errors for each segment
async function concatenateVideos(videoUrls: string[]): Promise<string> {
    try {
        const ffmpeg = await getFFmpeg();
        
        // Download all videos with retry logic
        const downloads = await Promise.all(
            videoUrls.map(async (url, index) => {
                try {
                    const videoData = await downloadVideoWithRetry(url, index);
                    const filename = `segment_${index}.mp4`;
                    await ffmpeg.writeFile(filename, videoData);
                    return { success: true as const, filename };
                } catch (err) {
                    const error = err instanceof Error ? err : new Error(String(err));
                    console.error(`Failed to download segment ${index}:`, error);
                    return { success: false as const, error };
                }
            })
        );

        // Filter out failed downloads
        const successfulDownloads = downloads
            .filter((result): result is { success: true; filename: string } => result.success)
            .map(result => result.filename);

        if (successfulDownloads.length === 0) {
            throw new Error('All segment downloads failed');
        }

        // Create a file containing the list of successful videos
        const fileList = successfulDownloads.map(file => `file '${file}'`).join('\n');
        await ffmpeg.writeFile('list.txt', fileList);

        // Rest of the concatenation process...
        await ffmpeg.exec([
            '-f', 'concat',
            '-safe', '0',
            '-i', 'list.txt',
            '-c', 'copy',
            'output.mp4'
        ]);

        const outputData = await ffmpeg.readFile('output.mp4');
        const videoBlob = new Blob([outputData], { type: 'video/mp4' });
        const videoFile = new File([videoBlob], 'output.mp4', { type: 'video/mp4' });

        // Clean up files
        for (const file of successfulDownloads) {
            await ffmpeg.deleteFile(file);
        }
        await ffmpeg.deleteFile('list.txt');
        await ffmpeg.deleteFile('output.mp4');

        // Upload to Vimeo with error handling
        return new Promise<string>((resolve, reject) => {
            const vimeoClient = new Vimeo(
                process.env.VIMEO_ID || '',
                process.env.VIMEO_SECRET || '',
                process.env.VIMEO_TOKEN || ''
            );

            vimeoClient.upload(
                videoFile,
                {
                    name: 'Generated Video',
                    description: `AI-generated video using Veo2 (${successfulDownloads.length} segments)`,
                    privacy: { view: 'disable' }
                },
                function (uri: string) {
                    resolve(`https://vimeo.com${uri}`);
                },
                function (bytesUploaded: number, bytesTotal: number) {
                    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                    console.log(`Uploading: ${percentage}%`);
                },
                function (err: string) {
                    reject(new Error(`Vimeo upload failed: ${err}`));
                }
            );
        });
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Error in video concatenation:', error);
        throw error;
    }
} 