import { VIMEO_TOKEN } from "$env/static/private";
import { firebaseAdmin } from "$lib/Firebase/firebase.server.js";
import { finish, getQueueById } from "$lib/Upload/helpers.server";
import { error, json, redirect } from "@sveltejs/kit";
import { getDownloadURL } from "firebase-admin/storage";
import { collection } from "firebase/firestore";
import { z } from "zod";

const Finished = z.object({
    file: z.object({
        uniqueIdentifier: z.string(),
        fileName: z.string(),
    }),
    name: z.string(),
    description: z.string(),
    topic: z.string(),
});

export async function POST({ request, locals }) {
    const check = await locals.getUser();

    if (!check) throw error(400, "Not Authorized");

    const body = await request.json();
    const upload = Finished.parse(body);

    const db = firebaseAdmin.getFirestore();

    const quene = await getQueueById(upload.file.uniqueIdentifier);

    if (quene == false) {
        throw error(400, "Not Found");
    }

    if (quene.chunks != quene.progress.length) {
        throw error(400, "Not done uploading.");
    }

    await finish(quene);

    const ref = db.collection("videos").doc();

    const bucket = firebaseAdmin.getBucket();

    const file = bucket.file(`uploads/${quene.location}/complete`);

    const [metadata] = await file.getMetadata();

    const fileSize = metadata.size;

    const url = await getDownloadURL(file);

    const result = await fetch("https://api.vimeo.com/me/videos", {
        method: "POST",
        headers: {
            Authorization: "bearer " + VIMEO_TOKEN,
            "Content-Type": "application/json",
            Accept: "application/vnd.vimeo.*+json;version=3.4"
        },
        body: JSON.stringify({
            "upload": {
                "approach": "pull",
                "size": fileSize,
                "link": url,
            }
        })
    });

    const vimeoResponse = await result.json();

    await ref.set({
        name: upload.file,
        title: upload.name,
        file: quene.location,
        owner: locals.user.uid,
        created: new Date().valueOf(),
        description: upload.description,
        topic: upload.topic,
        hearts: 0,
        vimeoLink: vimeoResponse.link,
        vimeoURI: vimeoResponse.uri,
        processed: true,
        comments: [],
        views: 0,
    });

    return json({ video: ref.id });
};