<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Sidebar from "$lib/Sidebar.svelte";
    import Icon from "@iconify/svelte";
    import { getContext } from "svelte";

    let { children } = $props();
</script>

<div class="flex justify-around font-[Nunito]">
    <div class="w-[38rem] p-8">
        {@render children()}
    </div>
</div>