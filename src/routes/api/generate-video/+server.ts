import { json } from '@sveltejs/kit';
import { generateFullVideo } from '$lib/services/videoGeneration';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { topic } = await request.json();
        
        if (!topic) {
            return json({ error: 'Topic is required' }, { status: 400 });
        }

        const videoUri = await generateFullVideo(topic);
        
        return json({ videoUri });
    } catch (error) {
        console.error('Error generating video:', error);
        return json({ error: 'Failed to generate video' }, { status: 500 });
    }
}; 