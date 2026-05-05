<script lang="ts">
  import Bubbles from "$lib/components/Bubbles.svelte";
  import BackButton from "$lib/components/BackButton.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import html2canvas from "html2canvas";

  // Form state
  let fromName = $state("");
  let toName = $state("");
  let thingAbout = $state("");
  let selectedStyle = $state("manis");

  // Result state
  let phase = $state<"form" | "result">("form");
  let loading = $state(false);
  let letterText = $state("");
  let displayText = $state("");

  // UI state
  let toastMsg = $state("");
  let toastShow = $state(false);
  let shakeField = $state("");
  let floaters = $state<Array<{ id: number; emoji: string; left: number }>>([]);
  let letterPaper: HTMLElement | undefined = $state();
  let fId = 0;

  const styles = [
    {
      key: "manis",
      icon: "🍬",
      name: "Manis & Imut",
      desc: "penuh manja & kiyowo",
    },
    { key: "puitis", icon: "🌙", name: "Puitis", desc: "dalam & penuh makna" },
    {
      key: "drama",
      icon: "🎭",
      name: "Lebay Drama",
      desc: "se-dramatis sinetron",
    },
    {
      key: "receh",
      icon: "😂",
      name: "Receh & Kocak",
      desc: "ngakak tapi tetap nembak",
    },
  ] as const;

  const bgColors: Record<string, string> = {
    manis: "#fff9fb",
    puitis: "#f8f4ff",
    drama: "#fff5f7",
    receh: "#fffbf0",
  };
  const decoTop: Record<string, string> = {
    manis: "💌 ✦ 💌 ✦ 💌",
    puitis: "🌙 ✦ ⋆ ✦ 🌙",
    drama: "💔 ✦ 💔 ✦ 💔",
    receh: "😂 ✦ 💕 ✦ 😂",
  };

  async function generate(forceNew = false) {
    if (!toName.trim()) {
      shakeField = "to";
      setTimeout(() => (shakeField = ""), 500);
      showToast("Nama siapa dulu dong~ 😅");
      return;
    }

    loading = true;
    phase = "result";
    displayText = "";
    letterText = "";

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromName.trim() || "Seseorang",
          to: toName.trim(),
          thing: thingAbout.trim(),
          style: selectedStyle,
          forceNew,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      // Kumpulkan semua chunk dulu
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
      }
      // Replace placeholder setelah semua terkumpul
      letterText = raw
        .replace(/\[NAMA_PENERIMA\]/g, toName.trim())
        .replace(/\[NAMA_PENGIRIM\]/g, fromName.trim() || "Seseorang");
      // Baru jalankan typewriter
      loading = false;
      displayText = "";
      typeWriter(letterText, 0);
      spawnFloaters();
    } catch (e) {
      const message =
        e instanceof Error && e.message
          ? e.message
          : "Aduh, ada error nih 😅 Coba lagi ya!";
      showToast(message);
      phase = "form";
      loading = false;
    }
  }

  function typeWriter(text: string, i: number) {
    if (i <= text.length) {
      displayText = text.slice(0, i);
      setTimeout(() => typeWriter(text, i + 1), 16);
    }
  }

  function spawnFloaters() {
    const ems = ["💕", "💖", "💗", "💓", "✨", "🌸", "💌"];
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const id = fId++;
        floaters = [
          ...floaters,
          {
            id,
            emoji: ems[Math.floor(Math.random() * ems.length)],
            left: 10 + Math.random() * 80,
          },
        ];
        setTimeout(() => {
          floaters = floaters.filter((f) => f.id !== id);
        }, 1200);
      }, i * 120);
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(letterText);
      showToast("Surat disalin! 😏💌");
    } catch {
      showToast("Gagal menyalin 😅");
    }
  }

  async function downloadImage() {
    showToast("⏳ Memproses gambar...");
    const canvas = await html2canvas(letterPaper!, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement("a");
    link.download = "surat-cinta.png";
    link.href = (canvas as HTMLCanvasElement).toDataURL("image/png");
    link.click();
    showToast("Gambar tersimpan! 🌸");
  }

  async function shareImage() {
    showToast("⏳ Memproses gambar...");
    const canvas = await html2canvas(letterPaper!, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    (canvas as HTMLCanvasElement).toBlob(async (blob: Blob | null) => {
      if (!blob) return;
      const file = new File([blob], "surat-cinta.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Surat buat kamu 💌", files: [file] });
      } else {
        const link = document.createElement("a");
        link.download = "surat-cinta.png";
        link.href = URL.createObjectURL(blob);
        link.click();
        showToast("Gambar didownload! 🌸");
      }
    });
  }

  function showToast(msg: string) {
    toastMsg = msg;
    toastShow = true;
    setTimeout(() => (toastShow = false), 2800);
  }
</script>

<svelte:head><title>Confess Generator ✨</title></svelte:head>

<div class="pointer-events-none fixed inset-0 overflow-hidden z-0">
  <Bubbles />
</div>
<div
  class="pointer-events-none fixed inset-0 z-0"
  style="background:radial-gradient(ellipse at 15% 20%,#fce7f380 0%,transparent 45%),radial-gradient(ellipse at 88% 82%,#f3e8ff60 0%,transparent 45%);"
></div>

<!-- Floating hearts -->
{#each floaters as f (f.id)}
  <div
    class="heart-up fixed z-50 pointer-events-none text-lg"
    style="left:{f.left}%;bottom:25%;"
  >
    {f.emoji}
  </div>
{/each}

<main class="relative z-10 max-w-lg mx-auto px-5 py-10 pb-20">
  <BackButton />

  <!-- Header -->
  <div class="text-center mb-7 card-in">
    <span
      class="inline-block bg-pink-100 text-pink-500 text-[11px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase mb-3"
    >
      ✨ AI confess generator
    </span>
    <h1 class="font-display text-4xl text-[#3b1f2b] leading-tight mb-2">
      Ungkapin <span
        class="bg-linear-to-br from-pink-400 to-purple-400 bg-clip-text text-transparent"
      >
        Perasaan
      </span>
      Kamu 🥺
    </h1>
    <p class="text-[#c4a0b4] text-sm font-bold">
      isi namanya, pilih gaya suratnya,
      <br />
      dan biarkan AI yang nulisin~ ✨
    </p>
    <p class="text-[#c4a0b4] mt-3 tracking-[0.5em] opacity-50 text-sm">
      ♡ ♡ ♡ ♡ ♡
    </p>
  </div>

  <!-- Form -->
  <div
    class="bg-white rounded-3xl p-5 mb-4 border border-pink-100 shadow-sm card-in"
    style="animation-delay:0.08s"
  >
    <p
      class="text-[11px] font-black text-[#c4a0b4] uppercase tracking-widest mb-4"
    >
      ✍️ isi dulu ya
    </p>
    <div class="flex flex-col gap-3">
      <div>
        <label
          for="fromName"
          class="block text-xs font-black text-[#8b5a6e] mb-1"
        >
          Nama kamu 🌸
        </label>
        <input
          id="fromName"
          bind:value={fromName}
          placeholder="contoh: Rara, Dika, ..."
          class="w-full border border-pink-100 rounded-[14px] px-4 py-2.5 text-sm font-bold text-[#3b1f2b] bg-[#fffaf5] focus:border-pink-400 focus:bg-white outline-none transition-colors placeholder:text-[#c4a0b4]"
        />
      </div>
      <div>
        <label
          for="toName"
          class="block text-xs font-black text-[#8b5a6e] mb-1"
        >
          Nama yang mau di-confess 💘
        </label>
        <input
          id="toName"
          bind:value={toName}
          placeholder="contoh: Bintang, Naya, ..."
          class="w-full border border-pink-100 rounded-[14px] px-4 py-2.5 text-sm font-bold text-[#3b1f2b] bg-[#fffaf5] focus:border-pink-400 focus:bg-white outline-none transition-colors placeholder:text-[#c4a0b4] {shakeField ===
          'to'
            ? 'an-shake'
            : ''}"
        />
      </div>
      <div>
        <label
          for="thingAbout"
          class="block text-xs font-black text-[#8b5a6e] mb-1"
        >
          Hal yang kamu suka dari dia <span class="text-[#c4a0b4] font-bold">
            (opsional)
          </span>
        </label>
        <input
          id="thingAbout"
          bind:value={thingAbout}
          placeholder="contoh: senyumnya, cara dia ketawa, ..."
          class="w-full border border-pink-100 rounded-[14px] px-4 py-2.5 text-sm font-bold text-[#3b1f2b] bg-[#fffaf5] focus:border-pink-400 focus:bg-white outline-none transition-colors placeholder:text-[#c4a0b4]"
        />
      </div>
    </div>
  </div>

  <!-- Style picker -->
  <div
    class="bg-white rounded-3xl p-5 mb-5 border border-pink-100 shadow-sm card-in"
    style="animation-delay:0.16s"
  >
    <p
      class="text-[11px] font-black text-[#c4a0b4] uppercase tracking-widest mb-3"
    >
      🎨 pilih gaya surat
    </p>
    <div class="grid grid-cols-2 gap-2.5">
      {#each styles as s}
        <button
          type="button"
          onclick={() => (selectedStyle = s.key)}
          class="flex items-center gap-2.5 p-3 rounded-2xl border-2 text-left transition-all hover:scale-[1.03] {selectedStyle ===
          s.key
            ? 'border-pink-400 bg-pink-50'
            : 'border-pink-100 bg-[#fffaf5]'}"
        >
          <span class="text-2xl">{s.icon}</span>
          <div>
            <p class="text-xs font-black text-[#3b1f2b]">{s.name}</p>
            <p class="text-[10px] font-bold text-[#c4a0b4]">{s.desc}</p>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Generate button -->
  <button
    type="button"
    onclick={() => generate(false)}
    disabled={loading}
    class="w-full py-4 rounded-full bg-linear-to-r from-pink-400 to-purple-400 text-white font-black text-base shadow-[0_5px_22px_rgba(244,114,182,0.38)] hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(244,114,182,0.42)] active:scale-97 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-5"
  >
    {#if loading}
      <span class="flex gap-1">
        {#each [0, 1, 2] as i}
          <span
            class="w-2 h-2 bg-white rounded-full animate-bounce"
            style="animation-delay:{i * 0.12}s"
          ></span>
        {/each}
      </span>
      <span>AI lagi nulis...</span>
    {:else}
      Tulisin surat aku! 💌
    {/if}
  </button>

  <!-- Result -->
  {#if phase === "result"}
    <div class="letter-reveal">
      <div
        class="bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-[0_8px_32px_rgba(244,114,182,0.18)] mb-3"
      >
        <div
          bind:this={letterPaper}
          class="relative p-7 overflow-hidden"
          style="background:{bgColors[selectedStyle]}"
        >
          <!-- Ruled lines -->
          <div
            class="absolute inset-0 pointer-events-none"
            style="background:repeating-linear-gradient(transparent,transparent 27px,rgba(244,114,182,0.07) 27px,rgba(244,114,182,0.07) 28px)"
          ></div>
          <!-- Margin line -->
          <div
            class="absolute left-11 top-0 bottom-0 w-px pointer-events-none"
            style="background:rgba(244,114,182,0.15)"
          ></div>

          <p class="text-center text-xl tracking-[0.4em] mb-4 opacity-60">
            {decoTop[selectedStyle]}
          </p>
          <p
            class="text-[11px] font-black text-[#c4a0b4] tracking-widest uppercase mb-4"
          >
            Untuk: {toName} 💌
          </p>

          {#if loading}
            <!-- Skeleton shimmer while streaming -->
            <div class="space-y-2.5">
              {#each [100, 85, 95, 70, 90, 75] as w}
                <div
                  class="h-3 rounded-full bg-pink-100 animate-pulse"
                  style="width:{w}%"
                ></div>
              {/each}
            </div>
          {:else}
            <p
              class="font-script text-lg leading-[1.9] text-[#3b1f2b] whitespace-pre-wrap relative z-10"
            >
              {displayText}
            </p>
            <span
              class="font-script text-xl font-bold text-pink-400 block text-right mt-4"
            >
              — {fromName || "Seseorang"} 🌸
            </span>
          {/if}

          <p class="text-center mt-4 tracking-[0.3em] opacity-40 text-sm">
            ♡ ♡ ♡
          </p>
        </div>
      </div>

      <!-- Actions — hanya tampil setelah selesai generate -->
      {#if !loading}
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            onclick={() => generate(true)}
            class="py-2.5 rounded-full border-2 border-pink-200 bg-pink-50 text-[#8b5a6e] text-xs font-black hover:bg-pink-100 transition-all"
          >
            🔄 Ganti versi
          </button>
          <button
            type="button"
            onclick={copyText}
            class="py-2.5 rounded-full border-2 border-pink-200 bg-pink-50 text-[#8b5a6e] text-xs font-black hover:bg-pink-100 transition-all"
          >
            📋 Salin teks
          </button>
          <button
            type="button"
            onclick={downloadImage}
            class="py-2.5 rounded-full border-2 border-pink-200 bg-pink-50 text-[#8b5a6e] text-xs font-black hover:bg-pink-100 transition-all"
          >
            ⬇️ Simpan gambar
          </button>
          <button
            type="button"
            onclick={shareImage}
            class="py-2.5 rounded-full bg-linear-to-r from-pink-400 to-purple-400 text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
          >
            💌 Share gambar!
          </button>
        </div>
      {/if}
    </div>
  {/if}
</main>

<Toast
  message={toastMsg}
  show={toastShow}
/>
