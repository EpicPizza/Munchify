<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Input from "$lib/Input.svelte";
    import Icon from "@iconify/svelte";
    import { getContext } from "svelte";
    import { slide } from "svelte/transition";

    let email = $state("");
    let password = $state("");
    let name = $state("");

    let loading = $state(false);
    let error: true | string = $state(true);

    const client = getContext('client') as Client;
</script>

<div class="h-[calc(100dvh)] pattern w-full overflow-scroll absolute font-[Nunito]">
    <div class="my-8 w-[28rem] h-fit ml-auto mr-auto bg-yellow-200 rounded-lg shadow-2xl p-6 z-10">
        <p class="text-lg font-semibold tracking-wide mb-3">Account Management</p>
        <h1 class="text-4xl font-extrabold tracking-wide mb-8 font-[Nunito]">Create Account</h1>
        <p class="opacity-75 text-base mb-7">Please create an account below or <a href="/signin" class="underline">sign in</a>:</p>

        <Input name=name bind:value={name} label=Name></Input>
        <Input name=email bind:value={email} label=Email></Input>
        <Input name=password bind:value={password} label=Password></Input>

        <div class="pt-3">
            <p class="opacity-75 text-base mb-3">Password must</p>
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if password.length >= 8}
                        <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                    {:else}
                        <Icon class="text-red-200" width="1rem" icon=mdi:close></Icon>
                    {/if}
                </div>
                <p class="opacity-75 text-base">be at least 8 characters long.</p>
            </div>
            <div class="flex items-center gap-2 mt-1.5">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if password.split("").some(char => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(char))}
                        <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                    {:else}
                        <Icon class="text-red-200" width="1rem" icon=mdi:close></Icon>
                    {/if}
                </div>
                <p class="opacity-75 text-base">contain an uppercase character.</p>
            </div>
            <div class="flex items-center gap-2 mt-1.5">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if password.split("").some(char => "abcdefghijklmnopqrstuvwxyz".includes(char))}
                        <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                    {:else}
                        <Icon class="text-red-200" width="1rem" icon=mdi:close></Icon>
                    {/if}
                </div>
                <p class="opacity-75 text-base">contain a lowercase character.</p>
            </div>
            <div class="flex items-center gap-2 mt-1.5">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if password.split("").some(char => "1234567890".includes(char))}
                        <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                    {:else}
                        <Icon class="text-red-200" width="1rem" icon=mdi:close></Icon>
                    {/if}
                </div>
                <p class="opacity-75 text-base">contain a number.</p>
            </div>
            <div class="flex items-center gap-2 mt-1.5">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    {#if password.split("").some(char => "^$*.[]{}()?\"!@#%&/\\,><':;|_~".includes(char))}
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

        <p class="opacity-75 text-base mt-7">By creating an account, you are agreeing to our <a href="/privacy" class="underline">privacy policy</a>.</p>

        <button onclick={async () => { loading = true; error = await client.createUser(email, password, name); if(typeof error == 'string') { loading = false; }  }} class="mt-5 hover:opacity-90 disabled:opacity-75 transition-opacity h-13 flex items-center justify-around w-full rounded-lg bg-black text-white text-lg font-bold">
            {#if loading}
                <div class="border-3 rounded-full border-l-white border-t-white border-transparent animate-spin w-5 h-5"></div>
            {:else}
                Create Account
            {/if}
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