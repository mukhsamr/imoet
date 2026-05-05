<script>
  export let href = '/';
  export let label = '← Balik ke beranda';
</script>

<a
  {href}
  class="
    inline-flex items-center gap-2
    px-4 py-2 rounded-full
    bg-white border border-pink-200
    text-pink-400 text-xs font-black
    shadow-sm
    hover:bg-pink-50 hover:scale-105
    transition-all duration-150
    mb-6
  "
>
  {label}
</a>
