<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Icon from "@iconify/svelte";
    import { getContext } from "svelte";

    const client = getContext('client') as Client;
</script>

<div class="w-[6rem] mr-[1rem] flex items-center flex-col justify-between py-4 h-full">
    <div class="flex flex-col items-center gap-1.5 text-2xl text-zinc-900 font-[700] font-[Edu_SA_Hand] pt-4">
        <p class="-rotate-6">M</p>
        <p class="-rotate-6">U</p>
        <p class="-rotate-6">N</p>
        <p class="-rotate-6">C</p>
        <p class="-rotate-6">H</p>
        <p class="-rotate-6">A</p>
        <p class="-rotate-6">B</p>
        <p class="-rotate-6">L</p>
        <p class="-rotate-6">E</p>
        <p class="-rotate-6">S</p>
    </div>
    <div>
        <button on:click={() => { client.signOut(); }} class="w-12 h-12 mb-4 flex hover:cursor-pointer text-zinc-700 items-center justify-around bg-black/10 rounded-md">
            <Icon width=1.5rem icon="mdi:log-out"></Icon>
        </button>
        <a href="/account/settings" class="w-12 h-12 mb-4 flex text-zinc-700 items-center justify-around bg-black/10 rounded-md">
            <Icon width=1.7rem icon="mdi:settings"></Icon>
        </a>
        {#if client.user?.photoURL == null}
            <div class="w-12 h-12 rounded-full bg-blue-800 flex items-center justify-around text-2xl text-white font-bold font-[Nunito]">
                {client.user?.displayName?.substring(0, 1)}
            </div>
        {:else}
            <img alt="Profile" referrerpolicy="no-referrer" class="w-12 h-12 rounded-full" src="{client.user?.photoURL}"/>
        {/if}
    </div>
</div>