import { fail, redirect } from '@sveltejs/kit';
import { firebaseAdmin } from "$lib/Firebase/firebase.server.js";
import { error } from "@sveltejs/kit";
import { getVideo, getVideoRandom } from '$lib/Videos/helpers.server.js';
import { FieldValue } from 'firebase-admin/firestore';

export async function load({ locals, url }) {
    await locals.getUser();

    if(!locals.user) {
        throw redirect(307, "/signin");
    }

    if(!locals.valid) {
        throw redirect(307, "/account/email");
    }

    const id = url.searchParams.get("id") ?? "---";

    const videoOne = await getVideoRandom(2);

    let heartedOne = false;

    const videoTwo = await getVideoRandom(0);

    let heartedTwo = false;

    if(videoOne != false) {
        const db = firebaseAdmin.getFirestore();

        const query = db.collection('hearts').where('user', '==', locals.rawUser?.uid ?? "---").where('id', '==', videoOne.id);

        const docs = (await query.get()).docs;

        const data = docs.length == 0 ? false : docs[0].data() ?? false;

        if(data) heartedOne = true;

        db.collection('videos').doc(videoOne.id).update({
            views: FieldValue.increment(1),
        });
    }

     if(videoTwo != false) {
        const db = firebaseAdmin.getFirestore();

        const query = db.collection('hearts').where('user', '==', locals.rawUser?.uid ?? "---").where('id', '==', videoTwo.id);

        const docs = (await query.get()).docs;

        const data = docs.length == 0 ? false : docs[0].data() ?? false;

        if(data) heartedTwo = true;

        db.collection('videos').doc(videoTwo.id).update({
            views: FieldValue.increment(1),
        });
    }

    return {
        videoOne: videoOne,
        heartedOne: heartedOne,
        videoTwo: videoTwo,
        heartedTwo: heartedTwo
    }
}