import { firebaseAdmin } from "$lib/Firebase/firebase.server.js";
import { error } from "@sveltejs/kit";

export const actions = {
    default: async function ({ locals }) {
        await locals.getUser();

        if (locals.user == undefined) throw error(401, "Not Signed In");
    
        const db = firebaseAdmin.getFirestore();

        const ref = db.collection("users").doc(locals.user.uid);
        const doc = await ref.get();
    
        if (doc.exists) {
            await ref.delete();
        }
    
        try {
            await firebaseAdmin.getAuth().deleteUser(locals.user.uid);
        } catch (e) {
            console.log(e);
    
            throw error(
                501,
                "An unexpected error occurred, please contact us for further help.",
            );
        }
    
        return { success: true };
    },
};
  