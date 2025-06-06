<script lang=ts>
    let { children } = $props();
</script>

<div class="w-full flex justify-center bg-slate-800">
    {@render children()}
</div>