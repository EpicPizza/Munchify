<script lang=ts>
    import { invalidate, invalidateAll } from "$app/navigation";
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Input from "$lib/Input.svelte";
    import Icon from "@iconify/svelte";
    import { getContext, onMount } from "svelte";
    import { slide } from "svelte/transition";

    const { data } = $props();

    let email = $state("");
    let password = $state("");

    let loadingEmailAndPassword = $state(false);
    let loadingGoogle = $state(false);

    const client = getContext('client') as Client;

    $effect(() => {
        if(!client.user) {
            const url = new URL(window.location.href);

            loadingGoogle = url.searchParams.get("login") == "in-progress";

            if(loadingGoogle) {
                setTimeout(() => {
                    loadingGoogle = false;

                    error = "Google sign in failed.";
                }, 10000)
            }
        }
    }) 

    let error: true | string = $state(true);
</script>

<div class="h-[calc(100dvh)] pattern w-full overflow-scroll absolute font-[Nunito]">
    <div class="my-8 w-[28rem] h-fit ml-auto mr-auto bg-yellow-200 rounded-lg shadow-2xl p-6 z-10">
        <p class="text-lg font-semibold tracking-wide mb-3">Welcome to</p>
        <h1 class="text-4xl font-extrabold tracking-wide mb-8 font-[Edu_SA_Hand]">MUNCHABLES</h1>
        <p class="opacity-75 text-base mb-7">Please sign in below or <a href="/account/create" class="underline">create a new account</a>:</p>

        <Input name=email bind:value={email} label=Email></Input>
        <Input name=password bind:value={password} label=Password></Input>

        {#if typeof error == 'string'}
            <p transition:slide class="mt-6 text-red-800 font-bold">{error}</p>
        {/if}

        <button onclick={async () => {
            loadingEmailAndPassword = true;

            error = await client.signInWithPassword(email, password);

            invalidateAll();

            if(typeof error == 'string') {
                loadingEmailAndPassword = false;
            }
        }} class="mt-6 h-13 hover:opacity-90 disabled:opacity-75 cursor-pointer transition-all flex items-center justify-around w-full rounded-lg bg-black font-bold text-white text-lg">
            {#if loadingEmailAndPassword}
                <div class="border-3 rounded-full border-l-white border-t-white border-transparent animate-spin w-5 h-5"></div>
            {:else}
                Sign in
            {/if}
        </button>

        <a href="/account/reset" class="block mt-4 italic text-base opacity-75 underline">Forgot password?</a>

        <button
            onclick={async () => {
                loadingGoogle = true;

                const url = new URL(window.location.href);

                url.searchParams.set("login", "in-progress");

                window.history.replaceState(window.history.state, "", url.toString());

                client.signIn();
            }}
            class="w-full h-13 hover:opacity-90 disabled:opacity-75 cursor-pointer transition-all rounded-lg mt-8 flex flex-row items-center justify-around dark:bg-white dark:border-zinc-700"
            >
            <div class="flex flex-row items-center select-none">
                {#if loadingGoogle}
                    <div class="border-3 rounded-full border-l-black border-t-black border-transparent animate-spin w-5 h-5"></div>
                {:else}
                    <img class="h-9" alt="google logo" src="/google.svg" />
                    <p class="dark:text-zinc-700 text-lg font-semibold ml-1.5">Sign in with Google</p>
                {/if}
            </div>
        </button>
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