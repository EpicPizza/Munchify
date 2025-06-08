<script lang=ts>
    import type { Client } from "$lib/Firebase/firebase.svelte";
    import Sidebar from "$lib/Sidebar.svelte";
    import Icon from "@iconify/svelte";
    import { getContext } from "svelte";
    import Player from '@vimeo/player';

    const { data } = $props();

    let heartedOne = $state(data.heartedOne);
    let videoOne = $state(data.videoOne);

    let heartedTwo = $state(data.heartedTwo);
    let videoTwo = $state(data.videoTwo);

    const client = getContext('client') as Client;

    let playerElementOne: HTMLDivElement;
    let playerOne: Player;
    let videoStateOne = $state(false);
    let videoProgressionOne = $state(0);
    let videoEndedOne = $state(false) as boolean;

    let playerElementTwo: HTMLDivElement;
    let playerTwo: Player;
    let videoStateTwo = $state(false);
    let videoProgressionTwo = $state(0);
    let videoEndedTwo = $state(false) as boolean;

    $inspect(videoOne);

    $effect(() => {
        playerOne = new Player(playerElementOne, {
            url: videoOne == false ? "https://vimeo.com/1091394209/6d65ac0490" : videoOne.vimeoLink,
            width: 480,
            height: 720,
            controls: false,
        });
        
        playerOne.setColor("#f5c002");

        playerOne.on('play', () => {
            videoStateOne = true;
        });

        playerOne.on('pause', () => {
            videoStateOne = false;
        });

        playerOne.on('ended', () => {
            videoEndedOne = true;
        });

        playerOne.on('playing', () => {
            videoEndedOne = false;
        });

        playerOne.on('timeupdate', (event) => {
            videoProgressionOne = event.percent;
        });

        return () => {
            playerOne.destroy();
        }
    });

    $effect(() => {
        playerTwo = new Player(playerElementTwo, {
            url: videoTwo == false ? "https://vimeo.com/1091394209/6d65ac0490" : videoTwo.vimeoLink,
            width: 480,
            height: 720,
            controls: false,
        });
        
        playerTwo.setColor("#f5c002");

        playerTwo.on('play', () => {
            videoStateTwo = true;
        });

        playerTwo.on('pause', () => {
            videoStateTwo = false;
        });

        playerTwo.on('ended', () => {
            videoEndedTwo = true;
        });

        playerTwo.on('playing', () => {
            videoEndedTwo = false;
        });

        playerTwo.on('timeupdate', (event) => {
            videoProgressionTwo = event.percent;
        });

        return () => {
            playerTwo.destroy();
        }
    });

    let scroll: HTMLDivElement;

    let windowHeight = 0;
</script>

<svelte:window bind:innerHeight={windowHeight}></svelte:window>

<div class="flex h-screen">
    <Sidebar></Sidebar>
    <div class="w-full h-full relative">
        <div class="pattern w-full h-full absolute top-0 left-0 z-[-1]">

        </div>
        <div class="w-full h-full pl-8 flex items-center justify-around">
            <div class="flex gap-4 items-center ">
                <div bind:this={scroll} class="flex flex-col max-h-[100dvh] overflow-hidden">
                    <div class="min-h-[100dvh] flex flex-col justify-around">
                        {#if videoOne == false}
                            <div class="w-[30rem] h-[51rem] flex items-center justify-around bg-red-800 text-white rounded-lg">
                                <div class="flex flex-col items-center gap-1">
                                    <Icon width=4rem icon=material-symbols:heart-broken-outline></Icon>
                                    <p class="text-2xl mt-5 font-bold font-[Edu_SA_Hand]">Video Not Found</p>
                                </div>
                            </div>
                        {:else}
                            <div class="flex flex-col gap-6 w-[30rem] ml-auto mr-auto">
                                <div bind:this={playerElementOne} class="bg-zinc-700 relative overflow-hidden w-full h-[45rem] rounded-xl flex items-center justify-around font-[Edu_SA_Hand] font-extrabold">
                                    <div style="width: {videoProgressionOne * 100}%;" class="h-2 bg-yellow-400 transition-all absolute bottom-0 left-0"></div>
                                </div>

                                <div class="flex items-center justify-between -mt-3">
                                    <div class="flex items-center gap-3">
                                        <button onclick={() => { if(videoStateOne == false) { playerOne.play(); } else { playerOne.pause(); } }} class="cursor-pointer rounded-2xl bg-black flex w-20 h-20 items-center justify-around text-white">
                                            {#if videoEndedOne == true}
                                                <Icon width=3rem icon=mdi:refresh></Icon>
                                            {:else if videoStateOne == false}
                                                <Icon width=3rem icon=mdi:play></Icon>
                                            {:else}
                                                <Icon width=3rem icon=mdi:pause></Icon>
                                            {/if}       
                                        </button>
                                        <button onclick={() => {
                                            fetch('/heart?type=' + (heartedOne ? "remove" : "add") + '&id=' + videoOne.id, {
                                                method: 'POST',
                                            });

                                            videoOne.hearts += heartedOne ? -1 : 1;

                                            heartedOne = !heartedOne;
                                        }} class="rounded-2xl cursor-pointer flex w-20 h-20 items-center justify-around {heartedOne ? "bg-white text-black" : "bg-black text-white"}">
                                            <div class="flex flex-col items-center gap-0.5 mt-1">
                                                <Icon width=2rem icon=mdi:thumbs-up></Icon>
                                                <p class="text-xs">{videoOne.hearts}</p>
                                            </div>
                                        </button>
                                        
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
                        {/if}
                    </div>

                    <div class="min-h-[100dvh] flex flex-col justify-around">
                        {#if videoTwo == false}
                            <div class="w-[30rem] h-[51rem] flex items-center justify-around bg-red-800 text-white rounded-lg">
                                <div class="flex flex-col items-center gap-1">
                                    <Icon width=4rem icon=material-symbols:heart-broken-outline></Icon>
                                    <p class="text-2xl mt-5 font-bold font-[Edu_SA_Hand]">Video Not Found</p>
                                </div>
                            </div>
                        {:else}
                            <div class="flex flex-col gap-6 w-[30rem] ml-auto mr-auto">
                                <div bind:this={playerElementTwo} class="bg-zinc-700 relative overflow-hidden w-full h-[45rem] rounded-xl flex items-center justify-around font-[Edu_SA_Hand] font-extrabold">
                                    <div style="width: {videoProgressionTwo * 100}%;" class="h-2 bg-yellow-400 transition-all absolute bottom-0 left-0"></div>
                                </div>

                                <div class="flex items-center justify-between -mt-3">
                                    <div class="flex items-center gap-3">
                                        <button onclick={() => { if(videoStateTwo == false) { playerTwo.play(); } else { playerTwo.pause(); } }} class="cursor-pointer rounded-2xl bg-black flex w-20 h-20 items-center justify-around text-white">
                                            {#if videoEndedTwo == true}
                                                <Icon width=3rem icon=mdi:refresh></Icon>
                                            {:else if videoStateTwo == false}
                                                <Icon width=3rem icon=mdi:play></Icon>
                                            {:else}
                                                <Icon width=3rem icon=mdi:pause></Icon>
                                            {/if}       
                                        </button>
                                        <button onclick={() => {
                                            fetch('/heart?type=' + (heartedTwo ? "remove" : "add") + '&id=' + videoTwo.id, {
                                                method: 'POST',
                                            });

                                            videoTwo.hearts += heartedTwo ? -1 : 1;

                                            heartedTwo = !heartedTwo;
                                        }} class="rounded-2xl cursor-pointer flex w-20 h-20 items-center justify-around {heartedTwo ? "bg-white text-black" : "bg-black text-white"}">
                                            <div class="flex flex-col items-center gap-0.5 mt-1">
                                                <Icon width=2rem icon=mdi:thumbs-up></Icon>
                                                <p class="text-xs">{videoTwo.hearts}</p>
                                            </div>
                                        </button>
                                        
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
                        {/if}
                    </div>
                </div>

                <div class="flex flex-col gap-4 w-[6rem]">
                    <button class="cursor-pointer w-full h-[6rem] bg-amber-400/80 rounded-full flex items-center justify-around text-black">
                        <Icon width=2.5rem icon=material-symbols:arrow-upward></Icon>
                    </button>

                    <button onclick={() => { scroll.scrollTo({ top: windowHeight, behavior: "smooth" }); }} class="cursor-pointer w-full h-[6rem] bg-amber-400/80 rounded-full flex items-center justify-around text-black">
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