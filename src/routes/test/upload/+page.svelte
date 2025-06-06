<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Sidebar from "$lib/Sidebar.svelte";
    import Icon from "@iconify/svelte";
    import { getContext } from "svelte";

    const client = getContext('client') as Client;
</script>

<h1 class="text-3xl font-bold">Upload File</h1>