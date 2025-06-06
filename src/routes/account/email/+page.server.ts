import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    await locals.getUser();

    if(locals.user && locals.user.verified) {
        throw redirect(307, "/");
    }
}