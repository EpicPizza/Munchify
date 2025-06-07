import { firebaseAdmin } from "$lib/Firebase/firebase.server";
import { Vimeo } from 'vimeo';
import { VIMEO_ID, VIMEO_SECRET, VIMEO_TOKEN } from '$env/static/private';
import { text } from "@sveltejs/kit";

export const GET = async () => {
    const db = firebaseAdmin.getFirestore();

    const query = db.collection('videos').where('processed', '==', true);

    const docs = (await query.get()).docs;

    for(let i = 0; i < docs.length; i++) {
        const video = docs[i].data();
        const ref = docs[i].ref;

        if(video == undefined) continue;

        const link = video.vimeoURI as string;

        const vimeo = new Vimeo(VIMEO_ID, VIMEO_SECRET, VIMEO_TOKEN);

        const status = await new Promise((resolve) => {
            vimeo.request(link + '?fields=transcode.status', function (error, body, status_code, headers) {
                console.log(body);

                if (body.transcode.status === 'complete') {
                    resolve('complete');
                } else if (body.transcode.status === 'in_progress') {
                    resolve('in_progress');
                } else {
                    resolve('error');
                }
            });
        }) as string;

        console.log(status);

        if(status == 'complete') {
            await ref.update({
                processed: new Date().valueOf(),
            });
        } else if(status == 'error') {
            await ref.update({
                processed: false,
            });
        }
    }

    return text("success");
};