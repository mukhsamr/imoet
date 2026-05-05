<script>
  export let message = '';
  export let show = false;
</script>

{#if show}
  <div
    class="
      fixed bottom-8 left-1/2 -translate-x-1/2
      bg-[#3b1f2b] text-white
      text-xs font-black
      px-5 py-3 rounded-full
      z-50 whitespace-nowrap
      shadow-lg
      toast-in
    "
  >
    {message}
  </div>
{/if}
