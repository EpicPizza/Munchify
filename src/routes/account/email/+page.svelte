<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Icon from "@iconify/svelte";
    import { getContext } from "svelte";
    import { slide } from "svelte/transition";

    const client = getContext('client') as Client;

    let loading = $state(false);
    let error: true | string = $state(true);
    let clicked: boolean = $state(false);

    let confirmed: boolean = $derived(client.user?.verified ?? false);
</script>

<div class="h-[calc(100dvh)] pattern w-full overflow-scroll absolute font-[Nunito]">
    <div class="my-8 w-[28rem] h-fit ml-auto mr-auto bg-yellow-200 rounded-lg shadow-2xl p-6 z-10">
         <p class="text-lg font-semibold tracking-wide mb-3">Account Management</p>
        <h1 class="text-4xl font-extrabold tracking-wide mb-8 font-[Nunito]">Email Verification</h1>
        <!--<p class="opacity-75 mb-7">An email has been sent to {client.user?.email} to verify your account. Please verify your account to continue.</p>-->
         <p class="opacity-75 text-base mb-7">Your email must be verified before you continue. Click below to send a verification code to your email.</p>
        
        {#if confirmed}
            <div class="flex items-center gap-2 mt-1.5">
                <div class="w-6 h-6 rounded-full flex items-center justify-around bg-black">
                    <Icon class="text-green-200" width="1rem" icon=mdi:check></Icon>
                </div>
                <p class="text-base">Email verified.</p>
            </div>
        {/if}

        {#if typeof error == 'string'}
            <p transition:slide class="mt-6 text-red-600 font-bold">{error}</p>
        {/if}

        {#if !confirmed}
            <button onclick={async () => {
                loading = true;

                error = await client.sendEmail();

                if(typeof error == 'string' && clicked == false) {
                    clicked = false;
                } else {
                    clicked = true;
                }

                loading = false;
            }} class="mt-6 hover:opacity-90 disabled:opacity-75 transition-opacity cursor-pointer h-13 flex items-center justify-around w-full rounded-lg bg-black text-lg text-white font-bold">
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
        {:else}
            <a href="/" class="mt-6 hover:opacity-90 disabled:opacity-75 transition-opacity cursor-pointer h-13 flex items-center justify-around w-full rounded-lg bg-black text-white text-lg font-bold">
                Continue
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