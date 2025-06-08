import { GEMINI, VIMEO_TOKEN } from "$env/static/private";
import { firebaseAdmin } from "$lib/Firebase/firebase.server.js";
import { finish, getQueueById } from "$lib/Upload/helpers.server";
import { GoogleGenAI, Type } from "@google/genai";
import { error, json, redirect } from "@sveltejs/kit";
import { getDownloadURL } from "firebase-admin/storage";
import { collection } from "firebase/firestore";
import { Readable, Writable, PassThrough } from "node:stream";
import { z } from "zod";
import ffmpeg from 'fluent-ffmpeg';
import importedScript from './script.json';
import { AudioGenerationService } from "$lib/services/audioGeneration.server";

const Interval = z.object({
    interval: z.string(),
    script_8s: z.string(),
    storyboard: z.object({
        visual: z.string(),
        text_overlay: z.string(),
        camera: z.string(),
        animation_style_notes: z.string(),
        audio_cue: z.string(),
        narration: z.string(),
    })
});

type Interval = z.infer<typeof Interval>;

const Script = z.object({
    intervals: Interval.array(),
});

type Script = z.infer<typeof Script>;


export async function POST({ request, locals }) {
    const check = await locals.getUser();

    if (!check) throw error(400, "Not Authorized");

    const prompt = (await request.json()).prompt as string;

    const ai = new GoogleGenAI({ apiKey: GEMINI });
   
   const config = { 
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            required: ["intervals"],
            properties: {
                intervals: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        required: ["interval", "script_8s", "storyboard"],
                        properties: {
                            interval: {
                                type: Type.STRING,
                            },
                            script_8s: {
                                type: Type.STRING,
                            },
                            storyboard: {
                                type: Type.OBJECT,
                                required: ["visual", "text_overlay", "camera", "animation_style_notes", "audio_cue", "narration"],
                                properties: {
                                    visual: {
                                        type: Type.STRING,
                                    },
                                    text_overlay: {
                                        type: Type.STRING,
                                    },
                                    camera: {
                                        type: Type.STRING,
                                    },
                                    animation_style_notes: {
                                        type: Type.STRING,
                                    },
                                    audio_cue: {
                                        type: Type.STRING,
                                    },
                                    narration: {
                                        type: Type.STRING,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };
    const model = 'gemini-2.5-pro-preview-06-05';
    
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: `You are an expert short-form educational content creator and storyboard director. Your goal is to translate any topic and summary I provide into a 40-second, fully AI-generated video, broken into 5 consecutive 8-second intervals. The first interval will be an introduction with an engaging hook. The last interval, number 5, will have an outro for the video. Follow these rules exactly:

1. **Overall Structure**
   - Total length: **40 seconds** (5 × 8s segments + 5).  
   - Output only the five intervals (no bullet lists, no extra text).
   - Interval one is a hook/introduction to the topic. Interval five, last interval, is an outro/conclusion.

2. **Per-Interval Requirements**  
   For each interval (e.g., Interval 1: 00:00–00:08), output two sections:
   1. **Script (8s)**  
      - Write a cohesive, spoken narrative of approximately 30-45 words that fills exactly 8 seconds when read at ~150 words/minute.
      - Include natural pauses, emphases, and callouts (e.g., “Discover…,” “Now watch…,” “Surprise fact:…”).  
      - Embed timing cues in brackets if needed (e.g., \`[2s pause]\`, \`[fast-paced]\`).
   2. **Storyboard Directions**  
      - **Visuals**: Precisely describe every animated element, camera movement, and text overlay. You are to quarterback the entire eight second scene. This description should be at least 250 words long with descriptive language that highlights the motions and actions that are occurring. These directions should also include text overlays, numbers, and points that are important to be highlighted. These visuals should align with the overall animation style description provided below. IMPORTANT NOTE: “Follow the directions in this section exactly as stated when generating the video. Every interval should begin with a fading in animation and a fading out animation.” Include IMPORTANT NOTE in every single generation as one of the many visuals you will describe. Proposed generation format [IMPORTANT NOTE] + Generated visual guidelines.
      - **Text Overlays**: Follow the directions and quote the exact on-screen text and its timing. These text overlays can include: key dates, facts, statistics, or for emphasis. Spell out exactly what you want to be overlaid and the specific spelling of the words and the time it will be displayed. This section should be at least 100 words long. IMPORTANT NOTE: “Make sure this text is written in proper English and is spelled exactly as stated and spelled in the directions. No errors should be generated” Proposed generation format [IMPORTANT NOTE] + Generated Text Overlay Guidelines.
      - **Animation Style**: Reference the provided style prompt (below) and specify color blocks, character silhouettes, parallax layers, transitions (push-in, pan, crossfade), and frame rate (24 fps). Be as specific as possible for when describing the type of animation elements you wished to be used here
      - **Audio Cues**: Note sound effects or musical stings tied to key moments. Be descriptive for the type of music, instrument, or special effect that is needed.

3. **Animation Style Reference**  
   Use this style consistently in all storyboard directions:  
> “A flat-style 2D animation in muted, earthy tones (deep olive greens, warm browns, slate grays) with subtle grain and hand-drawn texture. Characters are simple, silhouette-forward figures with minimal facial detail in solid color blocks with thin dark outlines. Backgrounds are layered geometric shapes with slight parallax movement. Lighting is soft and directional. Camera framing is cinematic (16:9), using slow push-ins, pans, and crossfades. Animate at a smooth 24 fps cadence. No photo-realism—everything reads as a stylish, editorial infographic animation.”

4. **Formatting**  
   - Use this exact template for each interval:
     
     **Interval X (MM:SS–MM:SS)**  
     **Script (8s):** “...”  
     **Storyboard:**  
     - Visual: …  
     - Text Overlay: …  
     - Camera: …  
     - Animation Style Notes: …  
     - Audio Cue: …
    
   - Do not add any extra sections or commentary.

When I provide a topic and summary, produce the four fully-detailed intervals in the format above.`,
                        },
                    ],
                },
            {
            role: 'model',
            parts: [
                {
                    text: `**Revising the Approach**

I've been examining the user's request, focusing on their role as a short-form educational content creator. The goal is clear: to translate a summary into a 45-second video script and storyboard. I'm structuring the script in 4 x 10-second segments, aiming for concise and engaging content.


**Clarifying the Structure**

The user's role is critical. My strategy involves strict adherence to the 4 x 10-second segments. I'm prioritizing concise scriptwriting at 45-55 words per segment, aiming for a 150 wpm pace. I'll include precise pauses and emphasis markers within the script. Visual descriptions will be extremely detailed, quarterbacking the action with descriptions of animation.


**Refining the Output**

I've streamlined the output to adhere strictly to the provided template, addressing the user's explicit structural requirements. The goal now is to consistently provide the necessary details for a concise, 45-second video, staying focused on the 4 segments and the provided animation style. I'll meticulously include precise pauses and emphasis within the script, ensuring each scene is perfectly timed and visually descriptive.


**Defining the Output**

I've carefully analyzed the user's instructions and the provided animation style reference, focusing on every detail for a 45-second video storyboard. My strategy centers on the four 10-second segments, each with a precisely formatted script and detailed storyboard. I aim to adhere strictly to the template, including all the elements for a coherent video. I'm ready to begin creating the required script and storyboard for a succinct, informative educational video.


**Formulating a Response**

I've crafted a concise and professional response, designed to indicate my complete comprehension of the intricate instructions. It ensures I'm ready to receive the topic and summary. I'm focusing on providing a quick and clear reply. `,
                },
                {
                    text: `I am ready. I have reviewed the rules for creating the 45-second educational video storyboard and will adhere to the specified structure, per-interval requirements, animation style, and formatting. Please provide the topic and summary.`,
                },
            ],
            },
        {
            role: 'user',
            parts: [
                {
                    text: prompt,
                },
            ],
        },
    ];

    const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
    });

    let output = "";

    for await (const chunk of response) {
        console.log(chunk.text);

        output += chunk.text;
    }

    const script = Script.parse(JSON.parse(output));/*

    //const script = importedScript;

    console.log(script);
    
    const id = crypto.randomUUID();

    const result = await Promise.all(script.intervals.slice(0, 2).map((interval, i) => {
        return generateVeo2Video(id, i, interval, ai);
    }));

    console.log("RESULTS", result);*/

    /*const id = "b6510703-c6f0-4170-8cc3-4d677f5966a8";

    const result = [
  'generated/b6510703-c6f0-4170-8cc3-4d677f5966a8/0',
  'generated/b6510703-c6f0-4170-8cc3-4d677f5966a8/1'
];

    await concatenateVideos(result, id);

    const script = importedScript;

    const audio = new AudioGenerationService();

    audio.generateAudioForIntervals(script.intervals.map((interval, i) => ({ script: interval.script_8s, order: i})), (progress) => {
        console.log(progress);
    })*/

    return json({
        output: script,
    });
};


/*async function concatenateVideos(videoFiles: string[], id: string) {
  try {
    const bucket = firebaseAdmin.getBucket();

    console.log('Starting video concatenation...');

    let command = ffmpeg();

    // Create and add each video as a converted TS stream input
    for (const fileName of videoFiles) {
        (async () => {
            // Assuming `fileName` is in scope from the loop `for (const fileName of videoFiles)`
            // Assuming `bucket` is in scope from `firebaseAdmin.getBucket()`
            // Assuming `videoFiles` is the array parameter of `concatenateVideos`
            const index = videoFiles.indexOf(fileName); // Get index for unique filename
            const localPath = `temp_video_segment_${index}.mp4`; // Define a local path for the temporary file
            await bucket.file(fileName).download({ destination: localPath }); // Download the file from Firebase Storage
            return localPath; // Return the local path
        })()

      command = command.addInput();
    }

    // Create a writable stream to Google Cloud Storage for the output
    const outputFile = firebaseAdmin.getBucket().file(`generated/${id}/complete`);
    const outputStream = outputFile.createWriteStream({
      resumable: false, // Use a simple upload for this example
      contentType: 'video/mp4',
    });

    command.complexFilter([
        // Define the concat filter to merge video and audio streams
        // n=number of input files, v=number of video streams, a=number of audio streams
        `concat=n=${videoFiles.length}:v=1:a=1`
    ]).outputOptions([
        '-f', 'mp4', // Set output format (important for streaming)
        '-movflags', 'frag_keyframe+empty_moov' // Optional: for fragmented MP4
    ]).on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('Error during concatenation:', err.message);
        console.error('ffmpeg stderr:', stderr);
      })
      .on('end', () => {
        console.log('Concatenation finished successfully.');
      })
      .mergeToFile('example.mp4', './');

        await new Promise((resolve, reject) => {
                outputStream.on("finish", async () => {
                await firebaseAdmin.getBucket().file(`generated/${id}/complete`).setMetadata({ contentType: 'video/mp4' });
                resolve(0);
            });
            outputStream.on("error", reject);
        });



  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

async function generateVeo2Video(id: string, index: number, interval: Interval, ai: GoogleGenAI): Promise<string> {
    // Since Veo2 shares the same API key as Gemini, we'll use the same key
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: `${interval.interval}
Script (8s): \"${interval.script_8s}\"
Storyboard:
    Visual \"${interval.storyboard.visual}\"
    Text Overlay \"${interval.storyboard.text_overlay}\"
    Camera \"${interval.storyboard.camera}\"
    Animation Style Notes \"${interval.storyboard.animation_style_notes}\"
    Audio Cue \"${interval.storyboard.animation_style_notes}\"
    Narration \"${interval.storyboard.narration}\"`,
        config: {
            numberOfVideos: 1,
            aspectRatio: '9:16',
            personGeneration: 'allow_adult',
            durationSeconds: 8,
        },
    });

    while (!operation.done) {
        console.log(`Video ${index} has not been generated yet. Check again in 3 seconds...`);
        
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        operation = await ai.operations.getVideosOperation({
            operation: operation,
        });
    }

    console.log(operation);

    console.log(operation.response?.generatedVideos);

    let returning = "";

    const videos = operation.response?.generatedVideos;

    if(videos == undefined) throw error(500);
    
    for(let i = 0; i < videos.length; i++) {
        const generatedVideo = videos[i];
        
        console.log(`Video has been generated: ${generatedVideo?.video?.uri}`);
        const response = await fetch(`${generatedVideo?.video?.uri}&key=${GEMINI}`);

        const fileLocation = `generated/${id}/${index}`;

        const bucket = firebaseAdmin.getBucket();

        const file = bucket.file(fileLocation);

        const stream = file.createWriteStream();

        if(response.body == null) throw error(500);

        try {
            Readable.fromWeb(response.body as any).pipe(stream);

            await new Promise((resolve, reject) => {
                stream.on("finish", async () => {
                    await file.setMetadata({ contentType: 'video/mp4' });
                    resolve(0);
                });

                stream.on("error", reject);
            });

            returning = fileLocation;

            
        } catch (e) {
            console.log(e);

            throw { message: "Upload failed.", type: "display" };
        }
    };

    return returning;
}*/