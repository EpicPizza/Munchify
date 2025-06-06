import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
    await locals.getUser();

    if(locals.user && locals.user.verified) {
        throw redirect(307, "/");
    }

    if(locals.user && !locals.user.verified) {
        throw redirect(307, "/account/email");
    }
}