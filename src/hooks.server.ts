import { firebaseAdmin, getToken, getUser } from "$lib/Firebase/firebase.server";
import type { Handle } from "@sveltejs/kit";

export const handle =(async ({ event, resolve }) => {
  const token = await getToken(event.cookies.get("__session") ?? "");

  console.log("token", token);

  const valid = token != undefined;

  if(valid) {
    event.locals.user = undefined;
    event.locals.rawUser = undefined;
    event.locals.valid = true;

    const secure = async () => {
      const user = await getUser(event.cookies.get("__session") ?? "");

      if(user == undefined) {
        return false;
      }

      const db = firebaseAdmin.getFirestore();
      const ref = db.collection('users').doc(user.uid);
      const data = (await ref.get()).data();

      event.locals.rawUser = user;

      if(data) {
        event.locals.user = {
          ...{
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
            providerData: user.providerData.map(provider => ({ providerId: provider.providerId, email: provider.email, uid: provider.uid })),
            uid: user.uid,
          },
          ...data,
          preload: true,
        }
      } else {
        event.locals.user = {
          ...{
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
            providerData: user.providerData.map(provider => ({ providerId: provider.providerId, email: provider.email, uid: provider.uid })),
            uid: user.uid,
          },
          verified: false,
          preload: true,
        }
      }

      return true;
    }

    let promise: undefined | ReturnType<typeof secure> = undefined;

    event.locals.getUser = () => {
      if(promise == undefined) {
        promise = secure();
      }

      return promise;
    };
  } else {
    event.locals.user = undefined;
    event.locals.rawUser = undefined;
    event.locals.getUser = () => { return Promise.resolve(false) };
    event.locals.valid = false;
  }
    

  const response = await resolve(event);

  /*response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "same-origin");
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "uploader-chunk-number,uploader-chunks-total,uploader-file-id",
  );
  response.headers.set("Cache-Control", "no-cache, private");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");*/

  return response;
}) satisfies Handle;