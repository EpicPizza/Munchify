<script lang=ts>
    import { goto, invalidate, invalidateAll } from "$app/navigation";
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Icon from "@iconify/svelte";
    import { getContext, onMount } from "svelte";
    import { slide } from "svelte/transition";

    const { form } = $props();

    let loading = $state(false);

    const client = getContext('client') as Client;

    $effect(() => {
        if(form?.success == true) {
            goto("/signin");
        }
    })
</script>

<div class="h-[calc(100dvh)] pattern w-full overflow-scroll absolute font-[Nunito]">
    <div class="my-8 w-[28rem] h-fit ml-auto mr-auto bg-yellow-200 rounded-lg shadow-2xl p-6 z-10">
        <p class="text-lg font-semibold tracking-wide mb-3">Account Management</p>
        <h1 class="text-4xl font-extrabold tracking-wide mb-8 font-[Nunito]">Delete Account</h1>
    
        <p class="text-base opacity-75">Your account cannot be recovered when it is deleted.</p>

        <form onsubmit={() => { loading = true; }} method="POST">
            <button class="hover:opacity-90 disabled:opacity-75 transition-opacity mt-7 h-13 flex items-center justify-around w-full rounded-lg bg-red-700 text-white text-lg font-bold">
                {#if loading}
                    <div class="border-3 rounded-full border-l-white border-t-white border-transparent animate-spin w-5 h-5"></div>
                {:else}
                    Delete Account
                {/if}
            </button>
        </form>

        <a href="/account/settings" class="flex w-fit items-center h-10 px-3 bg-white bg-opacity-10 text-sm rounded-lg mt-8 gap-1">
            <Icon width="1.2rem" icon=mdi:arrow-back></Icon>
            Back
        </a>
    </div>
</div>

<style>
    .pattern {
        background-color: #e5e5f7;
        opacity: 0.8;
        background-image:  linear-gradient(#a5a9e8 2px, transparent 2px), linear-gradient(90deg, #a5a9e8 2px, transparent 2px), linear-gradient(#a5a9e8 1px, transparent 1px), linear-gradient(90deg, #bfc2f1 1px, #e5e5f7 1px);
        background-size: 50px 50px, 50px 50px, 10px 10px, 10px 10px;
        background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;
    }
</style>