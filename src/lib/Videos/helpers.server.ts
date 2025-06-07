import { firebaseAdmin } from "$lib/Firebase/firebase.server";

export interface Video {
    title: string,
    description: string,
    topic: string,
    file: string,
    hearts: number,
    views: number,
    name: {
        fileName: string,
        uniqueIdentifier: string,
    },
    owner: string,
    processed: boolean | number,
    vimeoLink: string,
    vimeoURI: string,
    id: string,
};

export const getVideoRandom = async (index: number): Promise<false | Video> => {
    const db = firebaseAdmin.getFirestore();

    const references = (await db.collection('videos').listDocuments());

    //const index = getRandomArbitrary(0,
    //  references.length);

    console.log("INDEX", index);

    const ref = db.collection('videos').doc(references[index].id);

    const data = (await ref.get()).data();

    if(data == undefined) return false;

    return {... data as Video, id: references[index].id };
}


export const getVideo = async (id: string): Promise<false | Video> => {
    const db = firebaseAdmin.getFirestore();

    const ref = db.collection('videos').doc(id);

    const data = (await ref.get()).data();

    if(data == undefined) return false;

    return {... data as Video, id: id };
}

export const getVideosFromOwner = async (id: string) => {
    const db = firebaseAdmin.getFirestore();

    const query = db.collection('videos').where('owner', '==', id);

    const docs = (await query.get()).docs;

    const videos = new Array() as Video[];

    for(let i = 0; i < docs.length; i++) {
        const data = docs[i].data();

        if(data == undefined) continue;

        videos.push({... data as unknown as any, id: docs[i].id});
    }

    return videos;
}