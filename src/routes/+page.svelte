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

        playerOne.on('play', () => videoStateOne = true);
        playerOne.on('pause', () => videoStateOne = false);
        playerOne.on('ended', () => videoEndedOne = true);
        playerOne.on('playing', () => videoEndedOne = false);
        playerOne.on('timeupdate', (event) => videoProgressionOne = event.percent);

        return () => playerOne.destroy();
    });

    $effect(() => {
        playerTwo = new Player(playerElementTwo, {
            url: videoTwo == false ? "https://vimeo.com/1091394209/6d65ac0490" : videoTwo.vimeoLink,
            width: 480,
            height: 720,
            controls: false,
        });
        
        playerTwo.setColor("#f5c002");

        playerTwo.on('play', () => videoStateTwo = true);
        playerTwo.on('pause', () => videoStateTwo = false);
        playerTwo.on('ended', () => videoEndedTwo = true);
        playerTwo.on('playing', () => videoEndedTwo = false);
        playerTwo.on('timeupdate', (event) => videoProgressionTwo = event.percent);

        return () => playerTwo.destroy();
    });

    let scroll: HTMLDivElement;
    let windowHeight = 0;
</script>

<svelte:window bind:innerHeight={windowHeight} />

<!-- Pattern Background -->
<div class="pattern fixed top-0 left-0 w-full h-full z-[-1]"></div>

<!-- Main Layout -->
<div class="flex min-h-screen">
    <Sidebar />
    <div class="w-full relative">
        <div class="w-full min-h-screen pl-8 flex items-center justify-around">
            <div class="flex gap-4 items-center">
                <div bind:this={scroll} class="flex flex-col max-h-[100dvh] overflow-hidden">
                    <!-- VIDEO ONE BLOCK HERE -->
                    <!-- Keep existing block for Video One -->
                    <!-- VIDEO TWO BLOCK HERE -->
                    <!-- Keep existing block for Video Two -->
                </div>

                <!-- Scroll buttons -->
                <div class="flex flex-col gap-4 w-[6rem]">
                    <button class="cursor-pointer w-full h-[6rem] bg-amber-400/80 rounded-full flex items-center justify-center text-black">
                        <Icon width="2.5rem" icon="material-symbols:arrow-upward" />
                    </button>
                    <button
                        onclick={() => {
                            scroll.scrollTo({ top: windowHeight, behavior: "smooth" });
                        }}
                        class="cursor-pointer w-full h-[6rem] bg-amber-400/80 rounded-full flex items-center justify-center text-black"
                    >
                        <Icon width="2.5rem" icon="material-symbols:arrow-downward" />
                    </button>   
                </div>
            </div>
        </div>      
    </div>
</div>

<!-- Vertical Stripes (Side Decoration) -->
<div class="h-screen stripes w-[3rem] absolute overflow-hidden top-0 left-[5.5rem] pt-4 z-0">
    {#each new Array(40) as i}
        <div class="w-full h-2.5 rounded-full bg-zinc-700 mb-4 -rotate-12"></div>
    {/each}
</div>

<!-- Background Pattern Styling -->
<style>
    .pattern {
        background-color: #f8f9fa;
        opacity: 0.9;
        background-image: 
            radial-gradient(#e9ecef 0.5px, transparent 0.5px),
            radial-gradient(#e9ecef 0.5px, #f8f9fa 0.5px);
        background-size: 20px 20px;
        background-position: 0 0, 10px 10px;
        /* Try fixed for persistent scroll background */
        position: fixed; /* or absolute depending on scroll behavior */
    }

    .pattern::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            45deg,
            rgba(255,255,255,0.2) 0%,
            rgba(255,255,255,0.1) 100%
        );
    }
</style>
