<script lang="ts">
  import Bubbles from "$lib/components/Bubbles.svelte";
  import BackButton from "$lib/components/BackButton.svelte";
  import Toast from "$lib/components/Toast.svelte";

  // State
  let phase = $state("game"); // 'game' | 'win' | 'lose'
  let missCount = $state(0);
  let animating = $state(false);
  let noClicked = $state(false);
  let missMsg = $state("");
  let toastMsg = $state("");
  let toastShow = $state(false);

  // btn-no position
  let btnLeft = $state(50);
  let btnTop = $state(6);
  let btnAnim = $state("");
  let btnSmall = $state(false);

  let zoneEl: HTMLElement | undefined = $state();
  let btnEl: HTMLElement | undefined = $state();

  const anims = [
    "an-bounce",
    "an-wobble",
    "an-jelly",
    "an-spin",
    "an-flip",
    "an-shake",
  ];
  const floatEmojis = ["💨", "🏃", "😅", "👀", "🤭", "😂", "✨", "💫", "🌸"];
  const missLines = [
    "eh mau kemana? 😏",
    "hehe lari terus~",
    "capek belum? 😂",
    "tombolnya malu nih~",
    "hampir kena... atau ga? 🤭",
    "tangan gemetar ya?",
    "wkwk masih semangat?",
    "udah jauh banget tuh~",
    "oke fine kamu keren juga 😤",
  ];

  // Floating emojis & ripples
  let floaters: any[] = $state([]);
  let ripples: any[] = $state([]);
  let confettis: any[] = $state([]);
  let fId = $state(0);

  function onHover(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (noClicked || animating) return;
    if (Math.random() < 0.05) return;
    doRunAway();
  }

  function onClickNo() {
    if (noClicked) return;
    if (Math.random() < 0.05) {
      noClicked = true;
      phase = "lose";
      return;
    }
    doRunAway();
  }

  function doRunAway() {
    animating = true;
    missCount++;

    const zw = zoneEl?.clientWidth ?? 320;
    const bw = btnEl?.offsetWidth ?? 100;
    const maxX = Math.max(0, zw - bw);
    btnLeft = Math.floor(Math.random() * maxX);
    btnTop = Math.floor(Math.random() * 8);

    // pick random anim
    btnAnim = "";
    setTimeout(() => {
      btnAnim = anims[Math.floor(Math.random() * anims.length)];
    }, 0);

    if (missCount >= 7) btnSmall = true;

    missMsg =
      missCount > missLines.length
        ? `udah ${missCount}x kabur~ 😏`
        : missLines[missCount - 1];

    // Spawn floater
    const id = fId++;
    floaters = [
      ...floaters,
      {
        id,
        emoji: floatEmojis[Math.floor(Math.random() * floatEmojis.length)],
        left: 20 + Math.random() * 60,
      },
    ];
    setTimeout(() => {
      floaters = floaters.filter((f) => f.id !== id);
    }, 950);

    // Spawn ripple
    const rid = fId++;
    ripples = [...ripples, { id: rid }];
    setTimeout(() => {
      ripples = ripples.filter((r) => r.id !== rid);
    }, 650);

    setTimeout(() => {
      animating = false;
    }, 450);
  }

  function answerYes() {
    phase = "win";
    spawnConfetti();
  }

  function spawnConfetti() {
    const colors = [
      "#f4c0d1",
      "#ed93b1",
      "#fac775",
      "#9fe1cb",
      "#b5d4f4",
      "#afa9ec",
      "#f09595",
      "#5dcaa5",
    ];
    confettis = Array.from({ length: 42 }, (_, i) => ({
      id: i,
      left: 3 + Math.random() * 94,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 7,
      dur: 0.8 + Math.random() * 0.7,
      delay: Math.random() * 0.5,
      round: Math.random() > 0.5,
    }));
    setTimeout(() => {
      confettis = [];
    }, 1800);
  }

  function reset() {
    phase = "game";
    missCount = 0;
    animating = false;
    noClicked = false;
    missMsg = "";
    btnLeft = 50;
    btnTop = 6;
    btnAnim = "";
    btnSmall = false;
    floaters = [];
    ripples = [];
  }
</script>

<svelte:head><title>Aku Cantik Kan? 🥺</title></svelte:head>

<!-- Fixed BG -->
<div class="pointer-events-none fixed inset-0 overflow-hidden z-0">
  <Bubbles />
</div>
<div
  class="pointer-events-none fixed inset-0 z-0"
  style="background:radial-gradient(ellipse at 15% 20%,#fce7f380 0%,transparent 45%),radial-gradient(ellipse at 88% 82%,#f3e8ff60 0%,transparent 45%);"
></div>

<!-- Confetti -->
{#each confettis as c (c.id)}
  <div
    class="conf-fall fixed top-0 z-50 pointer-events-none"
    style="left:{c.left}%;width:{c.size}px;height:{c.size}px;background:{c.color};border-radius:{c.round
      ? '50%'
      : '3px'};animation-duration:{c.dur}s;animation-delay:{c.delay}s;"
  ></div>
{/each}

<!-- Floaters -->
{#each floaters as f (f.id)}
  <div
    class="heart-up fixed z-50 pointer-events-none text-lg"
    style="left:{f.left}%;bottom:30%;"
  >
    {f.emoji}
  </div>
{/each}

<main
  class="relative z-10 max-w-md mx-auto px-5 py-10 pb-20 flex flex-col items-center min-h-screen justify-center"
>
  <BackButton />

  {#if phase === "game"}
    <div
      class="bg-white rounded-4xl p-8 w-full text-center card-in border border-pink-100 shadow-[0_8px_32px_rgba(244,114,182,0.15)] relative"
    >
      <!-- Corner deco -->
      <span class="absolute -top-3 -left-2 text-2xl text-pink-300 spin-slow">
        ✿
      </span>
      <span
        class="absolute -bottom-2 -right-2 text-xl text-pink-200 spin-slow-r"
      >
        ✦
      </span>

      <!-- Avatar -->
      <div class="w-20 h-20 mx-auto mb-5 relative float-anim">
        <div
          class="w-20 h-20 rounded-full bg-linear-to-br from-pink-100 to-pink-200 border-2 border-pink-200 shadow-md flex flex-col items-center justify-center relative"
        >
          <div class="flex gap-3 mb-1.5">
            <div
              class="w-2.5 h-2.5 rounded-full bg-[#72243e] eye-blink relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-1 after:h-1 after:rounded-full after:bg-white/70"
            ></div>
            <div
              class="w-2.5 h-2.5 rounded-full bg-[#72243e] eye-blink-r relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-1 after:h-1 after:rounded-full after:bg-white/70"
            ></div>
          </div>
          <div
            class="w-5 h-2.5 rounded-b-full border-2 border-[#72243e] border-t-0"
          ></div>
          <div
            class="absolute bottom-5 left-2.5 w-3.5 h-2 rounded-full bg-pink-300 opacity-40"
          ></div>
          <div
            class="absolute bottom-5 right-2.5 w-3.5 h-2 rounded-full bg-pink-300 opacity-40"
          ></div>
        </div>
        <!-- Badge -->
        <div
          class="absolute -top-2 -right-2 bg-pink-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow"
        >
          ✨ hei!
        </div>
      </div>

      <h1 class="font-display text-2xl text-[#3b1f2b] mb-1">
        Aku cantik kan? 🥺
      </h1>
      <p class="text-[#c4a0b4] text-sm font-bold mb-7">jawab jujur yaaa~</p>

      <button
        onclick={answerYes}
        class="inline-flex items-center gap-2 px-9 py-3 rounded-full bg-linear-to-br from-pink-400 to-pink-500 text-white font-black text-base shadow-[0_4px_16px_rgba(244,114,182,0.4)] hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all pulse-ring"
      >
        <span>Iya dong!</span>
        <span>😍</span>
      </button>

      <!-- No zone -->
      <div
        class="relative w-full h-14 mt-4"
        bind:this={zoneEl}
      >
        <button
          bind:this={btnEl}
          onmouseenter={onHover}
          ontouchstart={onHover}
          onclick={onClickNo}
          class="absolute px-5 py-2.5 rounded-full border-2 border-dashed border-pink-200 bg-pink-50 text-[#c4a0b4] font-bold text-sm transition-[left,top] duration-300 {btnAnim} {btnSmall
            ? 'text-xs px-3 py-1.5 opacity-40'
            : ''}"
          style="left:{btnLeft}px; top:{btnTop}px;"
        >
          Nggak... 😐
        </button>
      </div>

      {#if missMsg}
        <p class="text-[#c4a0b4] text-xs font-bold mt-3">{missMsg}</p>
      {/if}

      <div
        class="flex justify-center gap-2 mt-5 text-[#c4a0b4] opacity-40 text-sm tracking-[0.4em]"
      >
        ♡ ♡ ♡ ♡ ♡
      </div>
    </div>
  {:else if phase === "win"}
    <div
      class="bg-white rounded-4xl p-10 w-full text-center card-in border border-pink-100 shadow-[0_8px_32px_rgba(244,114,182,0.18)]"
    >
      <span
        class="text-5xl block mb-4"
        style="animation:moodPick 0.6s cubic-bezier(0.34,1.56,0.64,1) both"
      >
        🎉
      </span>
      <h2 class="font-display text-2xl text-[#3b1f2b] mb-2">
        Makasih banyak!!
      </h2>
      <p class="text-[#8b5a6e] text-sm font-bold leading-relaxed mb-6">
        Kamu yang paling jujur sedunia 🌸
        <br />
        Appreciate banget udah jawab dengan hati nurani!
      </p>
      <button
        onclick={reset}
        class="px-6 py-2.5 rounded-full border-2 border-pink-200 bg-pink-50 text-[#8b5a6e] text-sm font-black hover:bg-pink-100 transition-all"
      >
        ↩ Coba lagi~
      </button>
    </div>
  {:else}
    <div
      class="bg-white rounded-4xl p-10 w-full text-center card-in border border-pink-100 shadow-[0_8px_32px_rgba(244,114,182,0.18)]"
    >
      <span class="text-5xl block mb-4">😭</span>
      <h2 class="font-display text-2xl text-[#3b1f2b] mb-2">Oalah...</h2>
      <p class="text-[#8b5a6e] text-sm font-bold leading-relaxed mb-6">
        {missCount > 0
          ? `Udah ${missCount}x ngeles tapi tetap bilang nggak juga... OK fine. FINE. 😤`
          : "Kamu berhasil klik tombol paling susah di dunia. Selamat? Mungkin? 😭"}
      </p>
      <button
        onclick={reset}
        class="px-6 py-2.5 rounded-full border-2 border-pink-200 bg-pink-50 text-[#8b5a6e] text-sm font-black hover:bg-pink-100 transition-all"
      >
        ↩ Coba lagi~
      </button>
    </div>
  {/if}
</main>

<Toast
  message={toastMsg}
  show={toastShow}
/>
