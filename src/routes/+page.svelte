<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Sidebar from "$lib/Sidebar.svelte";
    import Icon from "@iconify/svelte";
    import { getContext } from "svelte";

    const client = getContext('client') as Client;
</script>

<div class="flex h-screen">
    <Sidebar></Sidebar>
    <div class="w-full h-full relative">
        <div class="pattern w-full h-full absolute top-0 left-0 z-[-1]">

        </div>
        <div class="w-full h-full pl-8 flex items-center justify-around">
            <div class="flex gap-4 items-center ">
                <div class="flex flex-col gap-6 w-[30rem] ml-auto mr-auto">
                    <div class="bg-zinc-700 w-full h-[45rem] rounded-xl flex items-center justify-around font-[Edu_SA_Hand] font-extrabold">
                        PLACEHOLDER
                    </div>

                    <div class="flex items-center justify-between -mt-3">
                        <div class="flex items-center gap-3">
                            <div class="rounded-2xl bg-black flex w-20 h-20 items-center justify-around text-white">
                                <Icon width=3rem icon=mdi:play></Icon>
                            </div>
                            <div class="rounded-2xl bg-black flex w-20 h-20 items-center justify-around text-white">
                                <Icon width=2.5rem icon=mdi:thumbs-up></Icon>
                            </div>
                            
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="rounded-full bg-black/20 text-black flex items-center justify-around w-14 h-14">
                                <Icon width=2rem icon=mdi:volume></Icon>
                            </div>
                            <div class="rounded-full bg-black/20 text-black flex items-center justify-around w-14 h-14">
                                <Icon width=2rem icon=mdi:share></Icon>
                            </div>
                            <div class="rounded-full bg-black/20 text-black flex items-center justify-around w-14 h-14">
                                <Icon width=2rem icon=mdi:comments></Icon>
                            </div>
                        </div>
                    </div>
                </div>

               <div class="flex flex-col gap-4 w-[6rem]">
                    <button class="cursor-pointer w-full h-[6rem] bg-amber-400/80 rounded-full flex items-center justify-around text-black">
                        <Icon width=2.5rem icon=material-symbols:arrow-upward></Icon>
                    </button>

                    <button class="cursor-pointer w-full h-[6rem] bg-amber-400/80 rounded-full flex items-center justify-around text-black">
                        <Icon width=2.5rem icon=material-symbols:arrow-downward></Icon>
                    </button>   
                </div>
            </div>
        </div>      
    </div>
</div>

<div class="h-screen stripes w-[3rem] absolute overflow-hidden top-0 left-[5.5rem] pt-4">
    {#each new Array(40) as i}
        <div class="w-full h-2.5 rounded-full bg-zinc-700 mb-4 -rotate-12"></div>
    {/each}
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