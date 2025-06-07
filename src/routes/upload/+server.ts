import { addChunk, checkQuene } from "$lib/Upload/helpers.server.js";
import { error, json, text } from "@sveltejs/kit";
import { z } from "zod";
import { Readable, Writable } from "node:stream";

export async function GET({ request, locals, url }) {
  const check = await locals.getUser();

  if (!check) throw error(400, "Not Authorized");

  console.log(request.body);
  console.log(url.searchParams);

  //return new Response("ok", { status: 200});

  const params = {
    chunkNumber: parseInt(url.searchParams.get("resumableChunkNumber") || throwError()),
    chunkSize: parseInt(url.searchParams.get("resumableChunkSize") || throwError()),
    currentChunkSize: parseInt(url.searchParams.get("resumableCurrentChunkSize") || throwError()),
    totalSize: parseInt(url.searchParams.get("resumableTotalSize") || throwError()),
    type: url.searchParams.get("resumableType") || throwError(),
    identifier: url.searchParams.get("resumableIdentifier") || throwError(),
    filename: url.searchParams.get("resumableFilename") || throwError(),
    relativePath: url.searchParams.get("resumableRelativePath") || throwError(),
    totalChunks: parseInt(url.searchParams.get("resumableTotalChunks") || throwError()),
  }

  const finished = await checkQuene(
    { chunks: params.totalChunks, id: params.identifier, name: params.filename, type: params.type },
    params.chunkNumber,
  );

  if(finished) {
    return new Response("ok", { status: 200 });
  } else {
    return new Response("not finished", { status: 400 });
  }
}

export async function POST({ request, locals, url }) {
  const check = await locals.getUser();

  if (!check || locals.user.access == false) throw error(400, "Not Authorized");

  console.log(request.body);
  console.log(url.searchParams);

  //return new Response("ok", { status: 200});

  const params = {
    chunkNumber: parseInt(url.searchParams.get("resumableChunkNumber") || throwError()),
    chunkSize: parseInt(url.searchParams.get("resumableChunkSize") || throwError()),
    currentChunkSize: parseInt(url.searchParams.get("resumableCurrentChunkSize") || throwError()),
    totalSize: parseInt(url.searchParams.get("resumableTotalSize") || throwError()),
    type: url.searchParams.get("resumableType") || throwError(),
    identifier: url.searchParams.get("resumableIdentifier") || throwError(),
    filename: url.searchParams.get("resumableFilename") || throwError(),
    relativePath: url.searchParams.get("resumableRelativePath") || throwError(),
    totalChunks: parseInt(url.searchParams.get("resumableTotalChunks") || throwError()),
  }

  const chunk = Readable.fromWeb(request.body as any);

  let finished = false;

  try {
    finished = await addChunk(
      { chunks: params.totalChunks, id: params.identifier, name: params.filename, type: params.type },
      { number: params.chunkNumber, content: chunk },
    );
  } catch (e: any) {
    if ("type" in e && e.type == "display") {
      console.log(e);

      throw error(400, e.message);
    } else {
      console.log(e);

      throw error(400);
    }
  }

  if (finished) {
    return new Response(params.identifier, { status: 200 });
  } else {
    return new Response(undefined, { status: 200 });
  }
}

function throwError() {
  throw error(400, "Undefined");

  return "";
}