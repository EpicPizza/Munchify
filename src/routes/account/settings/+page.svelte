<script lang=ts>
    import { goto, replaceState } from "$app/navigation";
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Icon from "@iconify/svelte";
    import type { UserInfo } from "firebase/auth";
    import { getContext, onMount } from "svelte";
    import { slide } from "svelte/transition";

    const client = getContext('client') as Client;

    let emailUpdated = $state(false);
    let useBack: string | undefined = $state(undefined);

    onMount(() => {
        const url = new URL(window.location.href);

        if(url.searchParams.get("b") != null) {
            useBack = url.searchParams.get("b") as string;
        }

        if(url.searchParams.get("password") == "updated") {
            emailUpdated = true;

            url.searchParams.delete("password");

            replaceState(url.toString(), {});
        }
    })
</script>


<div class="h-[calc(100dvh)] pattern w-full overflow-scroll absolute font-[Nunito]">
    <div class="my-8 w-[28rem] h-fit ml-auto mr-auto bg-yellow-200 rounded-lg shadow-2xl p-6 z-10">
        {#if emailUpdated}
            <div class="flex items-center gap-2 mb-6">
                <div class="w-6 h-6 rounded-full flex bg-black items-center justify-around">
                    <Icon class="text-white font-bold" width="1rem" icon=mdi:check></Icon>
                </div>
                <p class="text-base">Password change successful.</p>
            </div>
        {/if}

        <p class="text-lg font-semibold tracking-wide mb-3">Account Management</p>
        <h1 class="text-4xl font-extrabold tracking-wide mb-8 font-[Nunito]">Account Settings</h1>

        <p class="opacity-50 mb-3 uppercase text-lg">Information</p>
        <p class="mb-2 text-lg"><span class="font-bold">Name:</span> {client.user?.displayName}</p>
        <p class="mb-2 text-lg"><span class="font-bold">Primary Email:</span> {client.user?.email}</p>
        <p class="mb-8 text-lg"><span class="font-bold">Providers:</span> {client.user?.providerData.reduce((previous, current) => { return previous += current.providerId + " " }, "")}</p>

        <!--<p class="opacity-50 mb-4 uppercase text-sm">Google</p>
        {#if client.user?.providerData.some(provider => provider.providerId == 'google.com')}
            {@const provider = client.user?.providerData.find(provider => provider.providerId == 'google.com')}

            <p class="mb-4"><span class="font-bold">Email:</span> {provider?.email}</p>

            <button disabled={client.user?.providerData.length == 1} onclick={() => {}} class="hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-75 transition-opacity h-11 flex items-center justify-around w-full rounded-lg bg-slate-700 mb-8 font-bold">
                Delink Google Account
            </button>
        {:else}
            <button class="hover:opacity-90 mb-8 disabled:opacity-75 transition-opacity h-11 flex items-center justify-around w-full rounded-lg bg-slate-700 font-bold">
                Link Google Account
            </button>
        {/if}   

        <p class="opacity-50 mb-4 uppercase text-sm">Email</p>
        {#if client.user?.providerData.some(provider => provider.providerId == 'password')}
            {@const provider = client.user?.providerData.find(provider => provider.providerId == 'password')}

            <p class="mb-4"><span class="font-bold">Email:</span> {provider?.email}</p>

            <button disabled={client.user?.providerData.length == 1} onclick={() => {}} class="hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-75 transition-opacity h-11 flex items-center justify-around w-full rounded-lg bg-slate-700 mb-8 font-bold">
                Delink Google Account
            </button>
        {:else}
            <button class="hover:opacity-90 mb-8 disabled:opacity-75 transition-opacity h-11 flex items-center justify-around w-full rounded-lg bg-slate-700 font-bold">
                Link Email/Password
            </button>
        {/if}-->

        <p class="opacity-50 mb-4 uppercase text-lg">Security</p>

        <button onclick={async () => { client.reset(); }} class="mb-3 hover:opacity-90 disabled:opacity-75 transition-opacity cursor-pointer h-13 flex items-center justify-around w-full rounded-lg bg-black text-white text-lg font-bold">
            Sign Out of All Devices
        </button>

        {#if client.user?.providerData.some(provider => provider.providerId == 'password')}
            <a href="/account/password" class="hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-75 transition-opacity cursor-pointer h-13 flex items-center justify-around w-full rounded-lg bg-black text-white text-lg mb-3 font-bold">
                Change Password
            </a>
        {/if}

        <a href="/account/delete" class="opacity-100 hover:opacity-90 disabled:opacity-75 transition-opacity h-13 flex items-center justify-around w-full rounded-lg bg-black text-white text-lg font-bold">
            Delete Account
        </a>

        <a href={useBack ?? "/"} class="flex w-fit items-center h-10 px-3 bg-white bg-opacity-10 text-sm rounded-lg mt-8 gap-1">
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