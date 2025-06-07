import { fail, redirect } from '@sveltejs/kit';
import { firebaseAdmin } from "$lib/Firebase/firebase.server.js";
import { error } from "@sveltejs/kit";
import { Vimeo } from 'vimeo';
import { VIMEO_ID, VIMEO_SECRET, VIMEO_TOKEN } from '$env/static/private';

export async function load({ locals }) {
    await locals.getUser();

    if(!locals.user) {
        throw redirect(307, "/signin");
    }

    if(!locals.valid) {
        throw redirect(307, "/account/email");
    }
}