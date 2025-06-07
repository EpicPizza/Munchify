import { fail, redirect } from '@sveltejs/kit';
import { firebaseAdmin } from "$lib/Firebase/firebase.server.js";
import { error } from "@sveltejs/kit";
import { getVideosFromOwner } from '$lib/Videos/helpers.server.js';

export async function load({ locals, url }) {
    await locals.getUser();

    if(!locals.user) {
        throw redirect(307, "/signin");
    }

    if(!locals.valid) {
        throw redirect(307, "/account/email");
    }

    const videos = await getVideosFromOwner(locals.rawUser?.uid ?? "---");

    return {
        videos: videos,
        pinned: url.searchParams.get('id') ?? false,
    };
}