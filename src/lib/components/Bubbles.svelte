<script lang="ts">
  import { onMount } from "svelte";

  let bubbles: any[] = $state([]);
  const colors = [
    "#ffc8e0",
    "#f783b0",
    "#ddd6fe",
    "#fef9c3",
    "#fce7f3",
    "#ccfbf1",
  ];

  onMount(() => {
    bubbles = Array.from({ length: 12 }, () => ({
      size: 25 + Math.random() * 70,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      duration: 11 + Math.random() * 14,
      delay: -(Math.random() * 14),
    }));
  });
</script>

{#each bubbles as b}
  <div
    class="bubble opacity-10"
    style="
      width:{b.size}px; height:{b.size}px;
      background:{b.color};
      left:{b.left}%;
      animation-duration:{b.duration}s;
      animation-delay:{b.delay}s;
    "
  ></div>
{/each}
