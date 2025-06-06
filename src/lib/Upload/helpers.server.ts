import { firebaseAdmin } from "$lib/Firebase/firebase.server";
import { Readable, Transform, Duplex, PassThrough, pipeline, Writable } from "stream";
import { FieldValue } from "firebase-admin/firestore";

interface NewQueue {
  id: string;
  chunks: number;
  name: string;
  type: string;
}

export interface Queue extends NewQueue {
  progress: number[];
  type: string;
  location: string;
  finished: false;
  timestamp: Date;
}

interface Chunk {
  number: number;
  content: Readable;
}

export async function newQuene(queue: NewQueue) {
  const db = firebaseAdmin.getFirestore();

  const ref = db.collection("uploads").doc(queue.id);

  await ref.set({
    id: queue.id,
    chunks: queue.chunks,
    progress: [],
    type: queue.type,
    location: queue.id,
    finished: false,
    timestamp: new Date(),
    name: queue.name,
  } satisfies Queue);

  return {
    ...queue,
    progress: [],
    type: queue.type,
    location: queue.id,
    finished: false,
    timestamp: new Date(),
  } satisfies Queue;
}

export async function finish(queue: Queue) {
  const bucket = firebaseAdmin.getBucket();

  const files = Array<string>();

  for (let i = 0; i < queue.chunks; i++) {
    files.push(`uploads/${queue.location}/${i + 1}`);
  }

  await bucket.combine(files, `uploads/${queue.location}/complete`);

  await bucket.file(`uploads/${queue.location}/complete`).setMetadata({
    contentType: queue.type,
  })

  const db = firebaseAdmin.getFirestore();

  const docRef = db.collection("uploads").doc(queue.id);

  await docRef.update({
    finished: true,
  });

  await Promise.all(files.map(file => bucket.file(file).delete()));
}

export async function checkQuene(marker: NewQueue, chunk: number) {
  const db = firebaseAdmin.getFirestore();

  const ref = db.collection("uploads").doc(marker.id);

  const data = (await ref.get()).data();

  if (data != undefined) {
    return (data as Queue).progress.includes(chunk);
  } else {
    return false;
  }
}

export async function getQueue(marker: NewQueue) {
  if (marker.name.length > 100)
    throw { message: "File name too long.", type: "display" };

  const db = firebaseAdmin.getFirestore();

  const ref = db.collection("uploads").doc(marker.id);

  const data = (await ref.get()).data();

  if (data == undefined) {
    return await newQuene(marker);
  }

  return data as Queue;
}

export async function getQueueById(id: string) {
  const db = firebaseAdmin.getFirestore();

  const ref = db.collection("uploads").doc(id);

  const data = (await ref.get()).data();

  if (data == undefined) {
    return false;
  }

  return data as Queue;
}

export async function addChunk(marker: NewQueue, chunk: Chunk) {
  const queue = await getQueue(marker);

  console.log("Chunk", chunk);
  console.log("quene", queue);

  if (chunk.number > queue.chunks) {
    throw { message: "Queue mismatch. Try uploading again.", type: "display" };
  }

  const bucket = firebaseAdmin.getBucket();

  const file = `uploads/${queue.location}/${chunk.number}`;

  try {
    const stream = bucket.file(file).createWriteStream();

    const limit = new PassThrough();

    chunk.content.pipe(limit).pipe(stream);

    let count = 0;

    await new Promise((resolve, reject) => {
      stream.on("finish", () => {
        resolve(0);

        console.log(count);
      });
    });
  } catch (e) {
    console.log(e);

    throw { message: "Upload failed.", type: "display" };
  }

  const db = firebaseAdmin.getFirestore();

  const ref = db.collection("uploads").doc(queue.id);

  await ref.update({
    progress: FieldValue.arrayUnion(chunk.number),
  });

  const progress = queue.progress.includes(chunk.number) ? queue.progress : [...queue.progress, chunk.number];

  if(progress.length == queue.chunks) {
    await finish(queue);

    return true;
  } 

  return false;
}

/*

const type = await fileTypeFromBlob(attachments[i] as File);

console.log(type);

if(!type || !attachmentHelpers.checkType(type.mime)) {
    if(type != undefined) {
        return message(form, "Invalid attachment file type.");
    } else {
        const mime = lookup((attachments[i] as File).name);

        if(!mime) {
            return message(form, "Invalid attachment file type.");
        }

        console.log(extension(mime));

        if(attachmentHelpers.checkType(mime) && attachmentHelpers.isSecure(mime)) {
            files.push({file: attachments[i] as File, ext: extension(mime) ? extension(mime) as string : "text/plain", mime: mime})
        } else {
            return message(form, "Invalid attachment file type.");
        }
    }
} else {
    files.push({file: attachments[i] as File, ext: type.ext, mime: type.mime});
}

*/
