<script lang=ts>
    import { goto, invalidate, invalidateAll } from "$app/navigation";
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Input from "$lib/Input.svelte";
    import Icon from "@iconify/svelte";
    import { getContext, onMount } from "svelte";
    import { slide } from "svelte/transition";

    let loading = $state(false);

    const client = getContext('client') as Client;

    let currentPassword = $state("");

    let newPassword = $state("");

    let error: true | string = $state(true);
</script>

<div class="h-[calc(100dvh)] pattern w-full overflow-scroll absolute font-[Nunito]">
    <div class="my-8 w-[28rem] h-fit ml-auto mr-auto bg-yellow-200 rounded-lg shadow-2xl p-6 z-10">
        <p class="text-lg font-semibold tracking-wide mb-3">Account Management</p>
        <h1 class="text-4xl font-extrabold tracking-wide mb-8 font-[Nunito]">Change Password</h1>
        <p class="opacity-75 text-base mb-7">Please enter your current password and the password you want to change to:</p>

        <Input name="current password" bind:value={currentPassword} label="Current Password"></Input>
        <Input name="new password" bind:value={newPassword} label="New Password"></Input>

        <div class="pt-3">
            <p class="opacity-75 text-base mb-3">Password must</p>
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if newPassword.length >= 8}
                        <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                    {:else}
                        <Icon class="text-red-200" width="1rem" icon=mdi:close></Icon>
                    {/if}
                </div>
                <p class="opacity-75 text-base">be at least 8 characters long.</p>
            </div>
            <div class="flex items-center gap-2 mt-1.5">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if newPassword.split("").some(char => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(char))}
                        <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                    {:else}
                        <Icon class="text-red-200" width="1rem" icon=mdi:close></Icon>
                    {/if}
                </div>
                <p class="opacity-75 text-base">contain an uppercase character.</p>
            </div>
            <div class="flex items-center gap-2 mt-1.5">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if newPassword.split("").some(char => "abcdefghijklmnopqrstuvwxyz".includes(char))}
                        <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                    {:else}
                        <Icon class="text-red-200" width="1rem" icon=mdi:close></Icon>
                    {/if}
                </div>
                <p class="opacity-75 text-base">contain a lowercase character.</p>
            </div>
            <div class="flex items-center gap-2 mt-1.5">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if newPassword.split("").some(char => "1234567890".includes(char))}
                        <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                    {:else}
                        <Icon class="text-red-200" width="1rem" icon=mdi:close></Icon>
                    {/if}
                </div>
                <p class="opacity-75 text-base">contain a number.</p>
            </div>
            <div class="flex items-center gap-2 mt-1.5">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if newPassword.split("").some(char => "^$*.[]{}()?\"!@#%&/\\,><':;|_~".includes(char))}
                        <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                    {:else}
                        <Icon class="text-red-200" width="1rem" icon=mdi:close></Icon>
                    {/if}
                </div>
                <p class="opacity-75 text-base">contain a symbol.</p>
            </div>
        </div>

        {#if typeof error == 'string'}
            <p transition:slide class="mt-6 text-red-800 font-bold">{error}</p>
        {/if}


        <button onclick={async () => { loading = true; error = await client.changePassword(currentPassword, newPassword); if(typeof error == 'string') { loading = false; } else { await goto("/account/settings?password=updated");} }} class="hover:opacity-90 disabled:opacity-75 transition-opacity cursor-pointer mt-7 h-13 flex items-center justify-around w-full rounded-lg bg-black text-white text-lg font-bold">
            {#if loading}
                <div class="border-2 rounded-full border-l-white border-t-white border-transparent animate-spin w-4 h-4"></div>
            {:else}
                Change Password
            {/if}
        </button>

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