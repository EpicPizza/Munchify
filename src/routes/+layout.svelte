<script lang="ts">
    import { onMount, setContext } from 'svelte';
	import '../app.css';
    import { firebaseClient } from '$lib/Firebase/firebase.svelte';

	let { children, data } = $props();

	const client = firebaseClient();

	client.serverInit(data.preload);

	setContext('client', client);

	$inspect(client.user);

	onMount(() => {
		client.clientInit(() => {});
	})
</script>

{@render children()}


<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Edu+SA+Hand:wght@400..700&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">
</svelte:head>