<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Icon from "@iconify/svelte";
    import { collection, onSnapshot, query, where } from "firebase/firestore";
    import { getContext } from "svelte";

    const { data } = $props();

    let videos = $state(data.videos) as (typeof data)["videos"];

    const client = getContext('client') as Client;

    $effect(() => {
        if(client.loaded == true) {
            const db = client.getFirestore();
            const ref = query(collection(db, "videos"), where("owner", '==', client.user?.uid));

            const unsubscribe = onSnapshot(ref, async (snapshot) => {
                const updates = new Array();
                
                for(let i = 0; i < snapshot.docs.length; i++) {
                    const data = snapshot.docs[i].data();

                    if(data == undefined) continue;

                    updates.push({... data as unknown as any, id: snapshot.docs[i].id});
                }

                console.log(updates);

                videos = updates;
            });

            return () => {
                unsubscribe();
            }
        }
    })
</script>

<h1 class="text-3xl font-bold mb-10">Videos</h1>

{#if typeof data.pinned == 'string'}
    {@const video = videos.find(video => video.id == data.pinned) as (typeof data)["videos"][0]}

    <div class="flex items-center gap-1.5">
        <Icon width=1.5rem icon=mdi:pin-outline></Icon>
        <p class="text-lg font-bold">Pinned</p>
    </div>

    <div class="mt-4 bg-zinc-300 rounded-lg p-4 relative">
        {#if video.processed == true}
            <p class="text-base font-bold mb-4 bg-black text-white w-fit p-2 py-1 rounded-sm animate-pulse">Processing</p>
        {:else if video.processed === false}
            <p class="text-base font-bold mb-4 text-white bg-red-600 w-fit p-2 py-1 rounded-sm">Error Processing, Please Try Again</p>
        {:else}
            <p class="text-base font-bold mb-4 bg-green-800 text-white w-fit p-2 py-1 rounded-sm">Live</p>
        {/if}
        
        <p class="text-2xl mb-2 font-bold font-[Edu_SA_Hand]">{video.title}</p>
        <p>{video.description == "a" ? "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempore, culpa. Pariatur illo exercitationem suscipit, voluptas consequuntur nihil laudantium rerum, eius reprehenderit nisi adipisci eos laboriosam quam modi dignissimos molestiae. Culpa!" : video.description}</p>
        <div class="flex gap-8 items-center mt-4">
            <div class="flex gap-1 items-center">
                <Icon width=1.5rem icon=mdi:heart-outline></Icon>
                <p class="text-lg">{video.hearts}</p>
            </div>
             <div class="flex gap-2 items-center">
                <Icon width=1.5rem icon=material-symbols:analytics-outline></Icon>
                <p class="text-lg">{video.views}</p>
            </div>
        </div>

        <div class="absolute top-4 right-4 flex gap-1.5">
            <div class="bg-black/20 w-9 h-9 flex items-center justify-around rounded-full">
                <Icon width=1.3rem icon=mdi:trashcan-outline></Icon>
            </div>
            <a href="/?id={video.id}" class="bg-black/20 w-9 h-9 flex items-center justify-around rounded-full">
                <Icon width=1.3rem icon=material-symbols:north-east></Icon>
            </a>
        </div>
    </div>
{/if}

 <div class="flex items-center gap-1.5 mt-16">
        <Icon width=1.5rem icon=mdi:sparkles></Icon>
        <p class="text-lg font-bold">All Videos</p>
    </div>

{#each videos.filter(video => video.id != data.pinned) as video}
    <div class="mt-4 bg-zinc-300 rounded-lg p-4 relative">
        {#if video.processed == true}
            <p class="text-base font-bold mb-4 bg-black text-white w-fit p-2 py-1 rounded-sm animate-pulse">Processing</p>
        {:else if video.processed === false}
            <p class="text-base font-bold mb-4 text-white bg-red-600 w-fit p-2 py-1 rounded-sm">Error Processing, Please Try Again</p>
        {:else}
            <p class="text-base font-bold mb-4 bg-green-800 text-white w-fit p-2 py-1 rounded-sm">Live</p>
        {/if}
        
        <p class="text-2xl mb-2 font-bold font-[Edu_SA_Hand]">{video.title}</p>
        <p>{video.description.length == 1 ? "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempore, culpa. Pariatur illo exercitationem suscipit, voluptas consequuntur nihil laudantium rerum, eius reprehenderit nisi adipisci eos laboriosam quam modi dignissimos molestiae. Culpa!" : video.description}</p>
        <div class="flex gap-8 items-center mt-4">
            <div class="flex gap-1 items-center">
                <Icon width=1.5rem icon=mdi:heart-outline></Icon>
                <p class="text-lg">{video.hearts}</p>
            </div>
             <div class="flex gap-2 items-center">
                <Icon width=1.5rem icon=material-symbols:analytics-outline></Icon>
                <p class="text-lg">{video.views}</p>
            </div>
        </div>

        <div class="absolute top-4 right-4 flex gap-1.5">
            <div class="bg-black/20 w-9 h-9 flex items-center justify-around rounded-full">
                <Icon width=1.3rem icon=mdi:trashcan-outline></Icon>
            </div>
            <a href="/?id={video.id}" class="bg-black/20 w-9 h-9 flex items-center justify-around rounded-full">
                <Icon width=1.3rem icon=material-symbols:north-east></Icon>
            </a>
        </div>
    </div>
{:else}
    <div class="mt-4 bg-zinc-300 rounded-lg p-4 relative">
        No videos
    </div>
{/each}