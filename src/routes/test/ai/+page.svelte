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

    let prompt = $state("");

    let loading = $state(false);

    let output = $state(null) as null | string;

    async function generate(prompt: string) {
        const response = await fetch("/test/ai", {
            method: 'POST',
            body: JSON.stringify({
                prompt: prompt,
            })
        });

        output = (await response.json()).output as string;
    }
</script>

<h1 class="text-3xl font-bold mb-4">Create AI Video</h1>

<p class="mb-10 text-lg">This is a test meant to create test videos on the platform by providing a single prompt.</p>

<Input bind:value={prompt} label=Prompt name=test-prompt />

<button onclick={async () => { loading = true; await generate(prompt); loading = false; }} class="mt-6 hover:opacity-90 disabled:opacity-75 transition-opacity cursor-pointer h-13 flex items-center justify-around w-full rounded-lg bg-black text-white text-lg font-bold">
   {#if loading}
        <div class="border-3 rounded-full border-l-white border-t-white border-transparent animate-spin w-5 h-5"></div>
    {:else}
        Generate
    {/if}
</button>

{#if output != null}
    <p class="mt-12 mb-4 bg-black px-2 py-1 rounded-sm w-fit text-white">OUTPUT</p>

    <p class="whitespace-pre-wrap">{JSON.stringify(output, null, "\t")}</p>
{/if}