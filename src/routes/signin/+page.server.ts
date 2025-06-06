import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
    const reauth = url.searchParams.get("reauth");
    const redir = url.searchParams.get("redir");

    await locals.getUser();

    if(locals.user && !locals.user.verified) {
        throw redirect(307, "/account/email");
    }

    if(locals.user && reauth != "true") {
        throw redirect(307, redir ?? "/");
    }

    return {
        reauth: false,
    }
}