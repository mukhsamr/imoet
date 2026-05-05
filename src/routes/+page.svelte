<script>
  import Bubbles from '$lib/components/Bubbles.svelte';

  const apps = [
    {
      href: '/cantik',
      icon: '🪞',
      iconBg: 'bg-pink-100',
      badgeColor: 'bg-pink-400',
      border: 'hover:border-pink-400',
      name: 'Aku Cantik Kan? 🥺',
      desc: 'tombol "nggak" bakal kabur terus — bisa kamu tangkap? ada 5% chance berhasil loh~',
      tags: [
        { label: 'iseng',     color: 'bg-pink-100 text-pink-500' },
        { label: 'lucu',      color: 'bg-yellow-100 text-yellow-600' },
        { label: 'tantangan', color: 'bg-pink-100 text-pink-500' },
      ],
    },
    {
      href: '/mood',
      icon: '🌸',
      iconBg: 'bg-purple-100',
      badgeColor: 'bg-purple-400',
      border: 'hover:border-purple-400',
      name: 'Mood Tracker 🌸',
      desc: 'catat perasaan kamu hari ini, dapat respons lucu & tips mood sesuai pilihan~',
      tags: [
        { label: 'mood',   color: 'bg-purple-100 text-purple-500' },
        { label: 'harian', color: 'bg-teal-100 text-teal-600' },
        { label: 'imut',   color: 'bg-yellow-100 text-yellow-600' },
      ],
    },
    {
      href: '/confess',
      icon: '💌',
      iconBg: 'bg-teal-100',
      badgeColor: 'bg-teal-400',
      border: 'hover:border-teal-400',
      name: 'Confess Generator 💌',
      desc: 'isi nama crush kamu, pilih gaya suratnya, dan biarkan kita yang nulisin~ ada 4 gaya!',
      tags: [
        { label: 'cinta',    color: 'bg-teal-100 text-teal-600' },
        { label: 'romantis', color: 'bg-pink-100 text-pink-500' },
        { label: 'lucu',     color: 'bg-yellow-100 text-yellow-600' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Lucu-lucuan 🌸</title>
</svelte:head>

<!-- Floating bubbles -->
<div class="pointer-events-none fixed inset-0 overflow-hidden z-0">
  <Bubbles />
</div>

<!-- BG gradient blobs -->
<div class="pointer-events-none fixed inset-0 z-0"
  style="background:
    radial-gradient(ellipse at 10% 15%, #fce7f370 0%, transparent 45%),
    radial-gradient(ellipse at 90% 85%, #f3e8ff60 0%, transparent 45%),
    radial-gradient(ellipse at 60% 5%,  #fef9c340 0%, transparent 35%);">
</div>

<main class="relative z-10 max-w-lg mx-auto px-5 py-12 pb-20">

  <!-- HEADER -->
  <div class="text-center mb-10 card-in">
    <span class="inline-block bg-pink-100 text-pink-500 text-[11px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase mb-4">
      ✨ web lucu-lucuan
    </span>
    <h1 class="font-display text-4xl text-[#3b1f2b] leading-tight mb-2">
      Halo, <span class="bg-gradient-to-br from-pink-400 to-purple-400 bg-clip-text text-transparent">selamat datang!</span> 🌸
    </h1>
    <p class="text-[#c4a0b4] text-sm font-bold leading-relaxed">
      kumpulan web seru dan lucu buatan kita~<br>pilih yang mana dulu?
    </p>
    <p class="text-[#c4a0b4] text-sm mt-3 tracking-[0.5em] opacity-50">♡ ♡ ♡ ♡ ♡</p>
  </div>

  <!-- APP LIST -->
  <p class="text-[11px] font-black text-[#c4a0b4] tracking-widest uppercase mb-3 pl-1">🎀 pilih web</p>

  <div class="flex flex-col gap-4">
    {#each apps as app, i}
      <a
        href={app.href}
        class="
          flex items-center gap-4
          bg-white rounded-3xl px-5 py-5
          border-2 border-transparent {app.border}
          shadow-[0_4px_20px_rgba(244,114,182,0.08)]
          hover:-translate-y-1 hover:scale-[1.01]
          hover:shadow-[0_12px_36px_rgba(244,114,182,0.18)]
          transition-all duration-200
          card-in no-underline
        "
        style="animation-delay:{i * 0.1}s"
      >
        <!-- Icon -->
        <div class="relative flex-shrink-0">
          <div class="w-14 h-14 {app.iconBg} rounded-[18px] flex items-center justify-center text-3xl float-anim">
            {app.icon}
          </div>
          <div class="absolute -top-1.5 -right-1.5 w-5 h-5 {app.badgeColor} rounded-full flex items-center justify-center text-white text-[9px] font-black border-2 border-white">
            ♡
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-[#3b1f2b] font-black text-base truncate">{app.name}</p>
          <p class="text-[#c4a0b4] text-xs font-bold leading-relaxed mt-0.5">{app.desc}</p>
          <div class="flex flex-wrap gap-1.5 mt-2">
            {#each app.tags as tag}
              <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full {tag.color}">{tag.label}</span>
            {/each}
          </div>
        </div>

        <span class="text-[#c4a0b4] text-xl flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
      </a>
    {/each}

    <!-- Coming soon -->
    <div class="relative flex items-center gap-4 bg-white rounded-3xl px-5 py-5 border-2 border-pink-100 opacity-50 pointer-events-none">
      <span class="absolute top-3 right-3 bg-yellow-100 text-yellow-600 text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase">🚧 soon</span>
      <div class="w-14 h-14 bg-pink-50 rounded-[18px] flex items-center justify-center text-3xl">✨</div>
      <div>
        <p class="text-[#3b1f2b] font-black text-base">Web Lucu Berikutnya</p>
        <p class="text-[#c4a0b4] text-xs font-bold mt-0.5">masih dalam proses, ditunggu yaaa~ 🤭</p>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="text-center mt-10 card-in" style="animation-delay:0.4s">
    <div class="inline-block bg-white rounded-2xl px-7 py-4 border border-pink-100 shadow-sm">
      <p class="text-[#c4a0b4] text-xs font-black">dibuat dengan banyak cinta 💕</p>
      <p class="text-[#c4a0b4] text-sm mt-1 tracking-[0.4em] opacity-50">♡ ♡ ♡</p>
    </div>
  </div>

</main>
