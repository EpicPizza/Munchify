<script lang=ts>
    let active = $state(false);
    let element: HTMLInputElement | undefined = $state();

    let { value = $bindable(), label, name }: { value: string, label: string, name: string } = $props();
</script>

<div class="relative mb-4">
    <p class="absolute transition-all pointer-events-none { active || (value && value.length > 0) ? "text-base -top-3.5 py-0.5 px-1.5 rounded-sm left-3 font-bold " + (active ? "text-blue-800 " : "text-slate-600 ") + (name.includes("test") ? "bg-white" : "bg-yellow-200") : "text-zinc-700 font-bold text-lg top-1/2 -translate-y-1/2 left-4" }">{label}</p>
    <input type={name.includes("password") ? "password" : "text"} name={name} bind:value={value} bind:this={element} onfocusin={() => { active = true; }} onfocusout={() => { active = false; }} class="border-slate-700 border-2 {name.includes("test") ? "bg-white" : "bg-yellow-200"} rounded-lg px-4 py-2.5 w-full text-lg focus:outline-blue-800 focus:outline-3 focus:-outline-offset-2 transition-all">
</div> 