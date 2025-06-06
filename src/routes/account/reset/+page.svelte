<script lang=ts>
    import { invalidate, invalidateAll } from "$app/navigation";
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Input from "$lib/Input.svelte";
    import Icon from "@iconify/svelte";
    import { getContext, onMount } from "svelte";
    import { slide } from "svelte/transition";

    const { data } = $props();

    let email = $state("");

    let loading = $state(false);

    const client = getContext('client') as Client;

    let error: true | string = $state(true);

    let clicked = $state(false);
</script>

<div class="h-[calc(100dvh)] pattern w-full overflow-scroll absolute font-[Nunito]">
    <div class="my-8 w-[28rem] h-fit ml-auto mr-auto bg-yellow-200 rounded-lg shadow-2xl p-6 z-10">
        <p class="text-lg font-semibold tracking-wide mb-3">Account Management</p>
        <h1 class="text-4xl font-extrabold tracking-wide mb-8 font-[Nunito]">Reset Password</h1>
        <p class="opacity-75 text-base mb-7">Enter your email below, an email will be sent if an account is found:</p>
 
        <Input name=email bind:value={email} label=Email></Input>

        {#if typeof error == 'string'}
            <p transition:slide class="mt-6 text-red-800 font-bold">{error}</p>
        {/if}

        <button onclick={async () => { loading = true; error = await client.sendPasswordReset(email); if(typeof error == 'string') { loading = false; } else { loading = false; clicked = true; }  }} class="mt-6 h-13 hover:opacity-90 disabled:opacity-75 transition-all cursor-pointer flex items-center justify-around w-full rounded-lg bg-black font-bold text-white text-lg">
            {#if loading}
                <div class="border-3 rounded-full border-l-white border-t-white border-transparent animate-spin w-5 h-5"></div>
            {:else}
                {#if clicked}
                    Resend Email
                {:else}
                    Send Email
                {/if}
            {/if}
        </button>

        {#if clicked}
            <a transition:slide href="/signin" class="mt-5 h-13 hover:opacity-90 disabled:opacity-75 transition-all cursor-pointer flex items-center justify-around w-full rounded-lg bg-black font-bold text-white text-lg">
                {#if loading}
                    <div class="border-3 rounded-full border-l-white border-t-white border-transparent animate-spin w-5 h-5"></div>
                {:else}
                    Back to Sign in
                {/if}
            </a>
        {/if}
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