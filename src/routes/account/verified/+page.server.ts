import { firebaseAdmin } from '$lib/Firebase/firebase.server';

export async function load({ url }) {
    const uid = url.searchParams.get("uid");

    if(uid == null) return;

    const auth = firebaseAdmin.getAuth();

    const user = await auth.getUser(uid);

    if(user.emailVerified) {
        const db = firebaseAdmin.getFirestore();

        const ref = db.collection('users').doc(user.uid);

        await ref.set({
            verified: true,
        })
    }
}