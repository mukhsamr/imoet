<script lang="ts">
  import { onMount } from "svelte";
  import Bubbles from "$lib/components/Bubbles.svelte";
  import BackButton from "$lib/components/BackButton.svelte";
  import Toast from "$lib/components/Toast.svelte";

  const STORAGE_KEY = "mood_logs_v1";

  interface Mood {
    key: string;
    emoji: string;
    label: string;
    color: string;
    bg: string;
    resp: string[];
    tip: string;
  }

  interface Log {
    mood: string;
    intensity: number;
    note: string;
    time: string;
  }

  const moods: Mood[] = [
    {
      key: "happy",
      emoji: "😄",
      label: "Happy",
      color: "#fbbf24",
      bg: "#fef9c3",
      resp: [
        "Waaah seneng banget deh liat kamu happy!~ 🌟",
        "Senyum kamu pasti bikin orang sekitar ikut bahagia 🌸",
        "Hari yang bagus! Abadiin perasaan ini yaaa 💛",
      ],
      tip: "💡 Abadiin momen ini! Foto atau tulis diary yuk~",
    },
    {
      key: "love",
      emoji: "🥰",
      label: "Sayang",
      color: "#f472b6",
      bg: "#fce7f3",
      resp: [
        "Aww kamu lagi ngerasain hangatnya perasaan itu ya 🫶",
        "Siapa nih yang bikin hati kamu meleleh? 👀💕",
        "Perasaan ini mau disimpen apa dibagi? Hehe~",
      ],
      tip: "💡 Ungkapin perasaan kamu ke orang itu!",
    },
    {
      key: "excited",
      emoji: "🤩",
      label: "Excited",
      color: "#fb923c",
      bg: "#fff7ed",
      resp: [
        "YAYYY vibes kamu hari ini 10/10! 🎉",
        "Ada event apa nih? Ceritaaa dong! 🥳",
        "Energi kamu hari ini bisa ngisi ulang semua orang~ 🔆",
      ],
      tip: "💡 Salurkan energi ini ke hal produktif!",
    },
    {
      key: "calm",
      emoji: "😌",
      label: "Tenang",
      color: "#60a5fa",
      bg: "#eff6ff",
      resp: [
        "Adem banget rasanya... kayak abis minum teh hangat ☕",
        "Tenang itu mahal loh, nikmatin yaaa 💙",
        "Slow life gang! Istirahat yang cukup yaaa~",
      ],
      tip: "💡 Meditasi 5 menit bisa pertahanin mood ini~",
    },
    {
      key: "sad",
      emoji: "😢",
      label: "Sedih",
      color: "#a78bfa",
      bg: "#f3e8ff",
      resp: [
        "Gapapa nangis dulu, itu manusiawi banget 💜",
        "Aku di sini dengerin kamu ya~ semangat!",
        "Sedih itu boleh, tapi jangan lupa bahwa ini juga pasti berlalu 🌈",
      ],
      tip: "💡 Dengerin musik favorit atau hubungi temen~",
    },
    {
      key: "anxious",
      emoji: "😰",
      label: "Cemas",
      color: "#34d399",
      bg: "#ecfdf5",
      resp: [
        "Tarik napas dulu... pelan-pelan ya 🍃",
        "Cemas itu tandanya kamu peduli, tapi jangan terlalu dibawa ya 💚",
        "Coba tulis yang bikin cemas, kadang itu bantu banget!",
      ],
      tip: "💡 Teknik 4-7-8: tarik napas 4 detik, tahan 7, buang 8.",
    },
    {
      key: "tired",
      emoji: "😴",
      label: "Ngantuk",
      color: "#94a3b8",
      bg: "#f1f5f9",
      resp: [
        "TIDUR DULU SANA! 😤 Istirahat itu penting~",
        "Tubuh kamu lagi minta jatah tidurnya nih hehe",
        "Kopi ke-berapa ini? Udah cukup, ayo rebahan! 🛏️",
      ],
      tip: "💡 Power nap 20 menit lebih efektif dari kopi loh!",
    },
    {
      key: "angry",
      emoji: "😤",
      label: "Kesal",
      color: "#f87171",
      bg: "#fef2f2",
      resp: [
        "Ugh... sabar yaaa, napas dulu 🌬️",
        "Boleh marah, asal jangan sampe nyesel habis itu ya 🤍",
        "Kalau udah agak tenang, coba cerita ke seseorang yang kamu percaya 💬",
      ],
      tip: "💡 Tulis di kertas lalu buang — surprisingly works!",
    },
  ];

  let selectedMood: Mood | null = null;
  let intensity: number = 6;
  let note: string = "";
  let logs: Log[] = [];
  let toastMsg: string = "";
  let toastShow: boolean = false;
  let dateStr: string = "";

  $: response = selectedMood
    ? selectedMood.resp[Math.floor(Math.random() * selectedMood.resp.length)]
    : "";
  let cachedResponse = "";
  $: if (selectedMood)
    cachedResponse =
      selectedMood.resp[Math.floor(Math.random() * selectedMood.resp.length)];

  $: totalToday = logs.filter(
    (l) => new Date(l.time).toDateString() === new Date().toDateString(),
  ).length;
  $: favMood = (() => {
    if (!logs.length) return "—";
    const freq: Record<string, number> = {};
    logs.forEach((l) => {
      freq[l.mood] = (freq[l.mood] || 0) + 1;
    });
    const top = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];
    return moods.find((m) => m.key === top)?.emoji ?? "—";
  })();
  $: streak = calcStreak(logs);

  function getLogs(): Log[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Log[];
    } catch {
      return [];
    }
  }
  function saveLogs(l: Log[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
  }

  function pickMood(m: Mood) {
    selectedMood = m;
    cachedResponse = m.resp[Math.floor(Math.random() * m.resp.length)];
  }

  function saveLog() {
    if (!selectedMood) return;
    const all = [
      {
        mood: selectedMood.key,
        intensity,
        note: note.trim(),
        time: new Date().toISOString(),
      },
      ...logs,
    ].slice(0, 50);
    saveLogs(all);
    logs = all;
    selectedMood = null;
    intensity = 6;
    note = "";
    showToast("Mood tersimpan! 🌸");
  }

  function clearHistory() {
    if (!confirm("Yakin mau hapus semua riwayat mood? 🥺")) return;
    localStorage.removeItem(STORAGE_KEY);
    logs = [];
    showToast("Riwayat dihapus 🌸");
  }

  function calcStreak(l: Log[]) {
    if (!l.length) return 0;
    const days: Record<string, boolean> = {};
    l.forEach((x) => {
      days[new Date(x.time).toDateString()] = true;
    });
    let s = 0,
      cur = new Date();
    while (days[cur.toDateString()]) {
      s++;
      cur.setDate(cur.getDate() - 1);
    }
    return s;
  }

  function showToast(msg: string) {
    toastMsg = msg;
    toastShow = true;
    setTimeout(() => {
      toastShow = false;
    }, 2800);
  }

  onMount(() => {
    logs = getLogs();
    dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });
</script>

<svelte:head><title>Mood Tracker 🌸</title></svelte:head>

<div class="pointer-events-none fixed inset-0 overflow-hidden z-0">
  <Bubbles />
</div>
<div
  class="pointer-events-none fixed inset-0 z-0"
  style="background:radial-gradient(ellipse at 15% 20%,#fce7f380 0%,transparent 45%),radial-gradient(ellipse at 88% 82%,#f3e8ff60 0%,transparent 45%);"
></div>

<main class="relative z-10 max-w-lg mx-auto px-5 py-10 pb-20">
  <BackButton />

  <!-- Header -->
  <div class="text-center mb-6 card-in">
    <h1 class="font-display text-4xl text-[#3b1f2b] mb-1">Mood Tracker 🌸</h1>
    <p class="text-[#c4a0b4] text-sm font-bold">
      gimana perasaan kamu hari ini?
    </p>
    {#if dateStr}
      <span
        class="inline-block bg-pink-100 text-pink-400 text-xs font-black px-4 py-1 rounded-full mt-2"
      >
        📅 {dateStr}
      </span>
    {/if}
  </div>

  <!-- Stats -->
  <div
    class="grid grid-cols-3 gap-3 mb-4 card-in"
    style="animation-delay:0.05s"
  >
    {#each [{ val: logs.length, lbl: "Total Log" }, { val: totalToday, lbl: "Hari Ini" }, { val: favMood, lbl: "Favorit" }] as s}
      <div
        class="bg-white rounded-[18px] p-3 text-center border border-pink-100 shadow-sm"
      >
        <div class="font-display text-2xl text-pink-400">{s.val}</div>
        <div
          class="text-[10px] font-black text-[#c4a0b4] uppercase tracking-wider mt-0.5"
        >
          {s.lbl}
        </div>
      </div>
    {/each}
  </div>

  <!-- Streak -->
  <div
    class="flex items-center gap-3 bg-linear-to-r from-pink-50 to-purple-50 rounded-[18px] px-4 py-3 mb-4 border border-pink-100 card-in"
    style="animation-delay:0.1s"
  >
    <span class="text-3xl">🔥</span>
    <div>
      <p class="font-display text-lg text-[#3b1f2b]">{streak} hari</p>
      <p class="text-xs font-bold text-[#8b5a6e]">
        streak check-in berturut-turut
      </p>
    </div>
  </div>

  <!-- Mood picker -->
  <div
    class="bg-white rounded-3xl p-5 mb-4 border border-pink-100 shadow-sm card-in"
    style="animation-delay:0.15s"
  >
    <p
      class="text-[11px] font-black text-[#c4a0b4] uppercase tracking-widest mb-3"
    >
      ✨ Pilih mood kamu
    </p>
    <div class="grid grid-cols-4 gap-2">
      {#each moods as m}
        <button
          onclick={() => pickMood(m)}
          class="flex flex-col items-center gap-1.5 py-3 px-1 rounded-[18px] border-2 transition-all duration-150 hover:scale-105 {selectedMood?.key ===
          m.key
            ? 'border-(--mc) scale-105'
            : 'border-transparent bg-[#fffaf5]'}"
          style="--mc:{m.color}; {selectedMood?.key === m.key
            ? `background:${m.bg}`
            : ''}"
        >
          <span class="text-2xl leading-none">{m.emoji}</span>
          <span class="text-[10px] font-black text-[#8b5a6e]">{m.label}</span>
        </button>
      {/each}
    </div>

    {#if selectedMood}
      <div
        class="mt-4 rounded-[18px] p-4 letter-reveal"
        style="background:{selectedMood.bg}"
      >
        <span class="text-3xl block mb-2">{selectedMood.emoji}</span>
        <p
          class="font-display text-lg mb-1"
          style="color:{selectedMood.color}"
        >
          {selectedMood.label} banget nih~
        </p>
        <p class="text-sm font-bold text-[#8b5a6e] leading-relaxed">
          {cachedResponse}
        </p>
        <span
          class="inline-block mt-2 text-[11px] font-black px-3 py-1 rounded-full"
          style="background:{selectedMood.color}22; color:{selectedMood.color}"
        >
          {selectedMood.tip}
        </span>
      </div>

      <!-- Intensity -->
      <div class="mt-4">
        <p
          class="text-[11px] font-black text-[#c4a0b4] uppercase tracking-widest mb-2"
        >
          💫 Seberapa kuat?
        </p>
        <div class="flex items-center gap-3">
          <span class="text-sm">😶</span>
          <input
            type="range"
            min="1"
            max="10"
            bind:value={intensity}
            class="flex-1 h-1.5 rounded-full accent-pink-400 bg-pink-100"
          />
          <span class="text-sm">🔥</span>
          <span class="font-display text-pink-400 text-lg w-6 text-center">
            {intensity}
          </span>
        </div>
      </div>

      <!-- Note -->
      <div class="mt-4">
        <p
          class="text-[11px] font-black text-[#c4a0b4] uppercase tracking-widest mb-2"
        >
          📝 Mau cerita dikit?
        </p>
        <textarea
          bind:value={note}
          placeholder="tulis apa aja... ga ada yang judge kok 🤍"
          class="w-full border border-pink-100 rounded-[14px] px-4 py-3 text-sm font-bold text-[#3b1f2b] bg-[#fffaf5] focus:border-pink-400 focus:bg-white outline-none resize-none h-20 transition-colors placeholder:text-[#c4a0b4]"
        ></textarea>
      </div>

      <button
        onclick={saveLog}
        class="mt-3 w-full py-3.5 rounded-full bg-linear-to-r from-pink-400 to-purple-400 text-white font-black text-base shadow-[0_4px_20px_rgba(244,114,182,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(244,114,182,0.4)] active:scale-97 transition-all"
      >
        Simpan mood aku! 🌸
      </button>
    {/if}
  </div>

  <!-- History -->
  <div
    class="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm card-in"
    style="animation-delay:0.2s"
  >
    <div class="flex items-center justify-between mb-3">
      <p
        class="text-[11px] font-black text-[#c4a0b4] uppercase tracking-widest"
      >
        🗓️ Riwayat mood
      </p>
      {#if logs.length}
        <button
          onclick={clearHistory}
          class="text-[11px] font-black text-[#c4a0b4] underline hover:text-red-400 transition-colors"
        >
          hapus semua
        </button>
      {/if}
    </div>

    {#if !logs.length}
      <div class="text-center py-6">
        <span class="text-3xl block mb-2">🌙</span>
        <p class="text-[#c4a0b4] text-sm font-bold">
          belum ada log nih, yuk mulai!
        </p>
      </div>
    {:else}
      <div class="flex flex-col divide-y divide-dashed divide-pink-100">
        {#each logs as log, i}
          {@const m = moods.find((x) => x.key === log.mood)}
          {#if m}
            <div
              class="flex items-start gap-3 py-3 card-in"
              style="animation-delay:{i * 0.05}s"
            >
              <div
                class="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl shrink-0"
                style="background:{m.bg}"
              >
                {m.emoji}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-black text-[#3b1f2b] text-sm">
                    {m.label}
                  </span>
                  <span class="text-[10px] font-bold text-[#c4a0b4]">
                    {new Date(log.time).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })} · {new Date(log.time).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  class="mt-1 h-1.5 bg-pink-100 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-linear-to-r from-pink-400 to-purple-400 rounded-full"
                    style="width:{log.intensity * 10}%"
                  ></div>
                </div>
                {#if log.note}
                  <p class="text-xs font-bold text-[#8b5a6e] mt-1 italic">
                    "{log.note}"
                  </p>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</main>

<Toast
  message={toastMsg}
  show={toastShow}
/>
