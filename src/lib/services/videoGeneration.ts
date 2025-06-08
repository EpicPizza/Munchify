import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI('AIzaSyB1g5w9MLL0-SDb8iSYnYNPblVNYApsKek');

interface VideoSegment {
    description: string;
    duration: number;
}

export async function generateVideoPrompts(topic: string): Promise<VideoSegment[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Create 5 detailed scene descriptions for a video about "${topic}". 
    Each scene should be 8 seconds long and should flow naturally into the next scene.
    Make the descriptions cinematic and highly detailed, perfect for an AI video generation model.
    Include specific details about:
    - Visual style and atmosphere
    - Camera movements and angles
    - Key elements and their placement
    - Transitions between scenes
    - Any text overlays or captions
    - Color schemes and lighting
    
    Format the output as a JSON array of objects with 'description' and 'duration' (always 8) properties.
    Make each description around 100 words to ensure sufficient detail for the video generation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
}

async function generateVeo2Video(description: string): Promise<string> {
    // Since Veo2 shares the same API key as Gemini, we'll use the same key
    const model = genAI.getGenerativeModel({ model: 'veo2' });
    
    try {
        // Format the prompt as a string with JSON-like structure that Veo2 can understand
        const prompt = `
Generate a video with the following description and parameters:
Description: ${description}
Parameters:
- Duration: 8 seconds
- Quality: High definition
- Style: Cinematic
- Format: Video
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

export async function generateFullVideo(topic: string): Promise<string> {
    try {
        // 1. Generate prompts using Gemini
        const videoSegments = await generateVideoPrompts(topic);
        
        // 2. Generate individual video segments using Veo2
        const videoUrls = await Promise.all(
            videoSegments.map(segment => generateVeo2Video(segment.description))
        );
        
        // 3. Concatenate videos (this would need to be implemented based on how Veo2 returns videos)
        // For now, we'll return the first video URL as a placeholder
        return videoUrls[0];
        
    } catch (error) {
        console.error('Error in full video generation process:', error);
        throw error;
    }
} 