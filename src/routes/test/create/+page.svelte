<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Input from "$lib/Input.svelte";
    import Sidebar from "$lib/Sidebar.svelte";
    import Icon from "@iconify/svelte";
    import { getContext } from "svelte";
    import Resumable from "resumablejs";
    import { Tween, type Tweened } from "svelte/motion";
    import { goto } from "$app/navigation";

    const client = getContext('client') as Client;

    let name = $state("");
    let description = $state("");
    let topic = $state("");

    let draggingover = $state(false);

    let filepicker: HTMLButtonElement;
    let filedrop: HTMLDivElement;

    const files = $state([]) as {
        fileName: Resumable.ResumableFile["fileName"],
        cancel: Resumable.ResumableFile["cancel"],
        abort: Resumable.ResumableFile["abort"],
        retry: Resumable.ResumableFile["retry"],
        size: Resumable.ResumableFile["size"],
        uniqueIdentifier: Resumable.ResumableFile["uniqueIdentifier"],
        error: boolean | string,
        complete: boolean,
        uploading: boolean,
        progress: Tween<number>,
    }[];

    const r = new Resumable({
        target: "/upload",
        chunkSize: 1 * 1024 * 1024 * 10,
        method: 'octet',
        maxFiles: 1,
        generateUniqueIdentifier: () => {
            console.log("Generating unique identifier");

            return crypto.randomUUID();
        }
    });

    $effect(() => {
        r.assignBrowse(filepicker, false);
        r.assignDrop(filedrop);

        r.on("fileAdded", (file) => {
            files.push({
                fileName: file.fileName,
                cancel: file.cancel,
                abort: file.abort,
                retry: file.retry,
                size: file.size,
                uniqueIdentifier: file.uniqueIdentifier,
                error: false,
                complete: false,
                uploading: true,
                progress: new Tween(0, {
                    duration: 200,
                    easing: (t) => t,
                }),
            });

            draggingover = false;

            r.upload();
        });

        r.on('complete', async () => {
            const result = await fetch('/test/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file: {
                        fileName: files[0].fileName,
                        uniqueIdentifier: files[0].uniqueIdentifier,
                    },
                    name: name,
                    description: description,
                    topic: topic,
                }),
            });

            const json = await result.json();

            goto(`/videos?id=${json.video}`);
        });

        r.on("fileSuccess", async (file) => {
            const index = files.findIndex((f) => f.uniqueIdentifier === file.uniqueIdentifier);
            if (index !== -1) {
                files[index].complete = true;
                files[index].uploading = false;
                files[index].progress.set(1);
            }
        });

        r.on("fileProgress", (file) => {
            const index = files.findIndex((f) => f.uniqueIdentifier === file.uniqueIdentifier);
            if (index !== -1) {
                files[index].progress.set(file.progress(false));
            }
        });

        r.on("fileError", (file, message) => {
            const index = files.findIndex((f) => f.uniqueIdentifier === file.uniqueIdentifier);
            if (index !== -1) {
                files[index].uploading = false;
                files[index].progress.set(0);
                files[index].error = message;
            }
        });

        r.on("fileRetry", (file) => {
            const index = files.findIndex((f) => f.uniqueIdentifier === file.uniqueIdentifier);
            if (index !== -1) {
                files[index].uploading = true;
                files[index].progress.set(0);
            }
        });
    });
</script>

<h1 class="text-3xl font-bold mb-4">Create Video</h1>

<p class="mb-10 text-lg">This is a test meant create test videos on the platform by directly uploading video files.</p>

<Input bind:value={name} label=Name name=test-name />

<Input bind:value={description} label=Description name=test-description />

<Input bind:value={topic} label=Topic name=test-topic />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={filedrop} class="border-slate-700 py-4 pb-8 border-2 rounded-lg px-4 w-full {draggingover ? "outline-blue-800 outline-3 -outline-offset-2 bg-blue-500/20" : ""} transition-all flex flex-col items-center"
        ondragenter={(e) => {
            if (e.target === e.currentTarget) {
                draggingover = true;
            }
        }}
        ondragleave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as unknown as Node)) {
                draggingover = false;
            }
        }}
    >

    <div class="p-[1rem] w-fit rounded-full">
        <Icon class="text-slate-900" width=2rem icon=material-symbols:upload></Icon>
    </div>

    {#if files.length > 0}
        <div class="mt-4 mb-8 w-full flex-col flex gap-8">
            {#each files as upload}
                <div class="w-full">
                    <div class="bg-zinc-200 rounded-full h-1.5 w-full"></div>
                    <div style="width: {upload.progress.current * 100}%; margin-right: {upload.progress.current * 100}%;" class="{upload.complete ? "" : "animate-pulse"} h-1.5 bg-zinc-700 -mt-1.5 rounded-full">
                
                    </div>
                    {#if typeof upload.error == 'string'}
                        <div class="w-full h-1.5 bg-red-500 -mt-1.5 rounded-full">
                    
                        </div>

                        <div class="bg-red-500 px-3 text-sm py-2 my-4 rounded-lg font-bold text-white">
                            <p>{upload.error}</p>
                        </div>
                    {/if}
                    <div class="flex mt-2 items-center max-w-full overflow-hidden gap-2 justify-between text-sm">
                        <p class="overflow-hidden overflow-ellipsis">{upload.fileName}</p>
                        {#if upload.uploading == true}
                                <p>{(upload.progress.current * 100).toFixed(0)}%</p>
                        {:else}
                            <p class="whitespace-nowrap">{(upload.size / 1024 / 1024).toFixed(2)} MB</p>
                        {/if}
                    </div>
                </div>
            {/each} 
        </div>
    {/if}
    
    <div class="text-center">
        <p class="text-base">Drag and drop a file</p>
        <p class="text-base">or <button class="hover:cursor-pointer underline" bind:this={filepicker}>choose a file</button>.</p>
    </div>
</div>

<p class="text-sm opacity-75 mt-4 italic">Fill out information first and then upload.</p>