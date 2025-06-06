import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    if(!locals.valid) throw redirect(307, "/signin");
}