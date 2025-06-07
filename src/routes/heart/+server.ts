import { firebaseAdmin } from '$lib/Firebase/firebase.server';
import { getVideo } from '$lib/Videos/helpers.server';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

export const POST = async ({ request, url, locals }) => {
    await locals.getUser();

    if(!locals.user || !locals.valid) {
        throw redirect(307, "/signin");
    }

    const user = locals.rawUser;

    if(user == undefined) throw error(500);
    
    const type = url.searchParams.get("type") ?? "add";
    const id = url.searchParams.get("id") ?? "---";

    console.log("PARAMS", type, id);

    const video = await getVideo(id);

    if(video == false) throw error(404);

    const db = firebaseAdmin.getFirestore();

    const query = db.collection('hearts').where('user', '==', locals.rawUser?.uid ?? "").where('id', '==', video.id);

    const docs = (await query.get()).docs;

    const data = docs.length == 0 ? false : docs[0].data() ?? false;

    console.log(docs);

    if(data == false && type == 'add') {
        db.collection('hearts').add({
            id: video.id,
            user: user.uid,
        });

        db.collection('videos').doc(video.id).update({
            hearts: FieldValue.increment(1)
        });
    } else if(data && type == 'remove') {
        await docs[0].ref.delete();

        db.collection('videos').doc(video.id).update({
            hearts: FieldValue.increment(-1)
        });
    }

    return new Response(null, { status: 200 });
}