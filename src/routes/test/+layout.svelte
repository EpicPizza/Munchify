<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Sidebar from "$lib/Sidebar.svelte";
    import Icon from "@iconify/svelte";
    import { getContext } from "svelte";

    let { children } = $props();

    const client = getContext('client') as Client;
</script>

<div class="flex justify-around font-[Nunito]">
    <div class="w-[38rem] p-8">
        {@render children()}

         <div class="p-4 rounded-lg mt-20 bg-black/10 break-words">
            <p class="mb-2 opacity-80">CLIENT</p>
            <p class="text-xs whitespace-pre-wrap">{JSON.stringify(client.user, null, "\t")}</p>
        </div>
    </div>
</div>