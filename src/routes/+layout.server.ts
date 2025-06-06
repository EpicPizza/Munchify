import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    await locals.getUser();

    return {
        preload: locals.user,
    }
}