# imoet — AI Patch 🌸

File-file ini adalah **tambahan / pengganti** dari project SvelteKit sebelumnya.
Salin ke dalam project kamu dengan struktur yang sama.

## File yang diganti / ditambah

```
package.json                              ← GANTI (tambah @google/genai)
src/app.d.ts                              ← BARU (Cloudflare platform types)
src/routes/api/generate/+server.ts        ← BARU (endpoint Gemini AI)
src/routes/confess/+page.svelte           ← GANTI (pakai AI, bukan template hardcode)
```

## Setup setelah copy

1. Install dependency baru:
   ```bash
   npm install
   ```

2. Buat file `.env` di root project:
   ```
   GEMINI_API_KEY=AIza_your_key_here
   ```
   Dapet API key gratis di: https://aistudio.google.com

3. Jalankan dev server:
   ```bash
   npm run dev
   ```

## Deploy ke Cloudflare Pages

Di dashboard Cloudflare Pages → Settings → Environment Variables, tambahkan:
- `GEMINI_API_KEY` = key kamu

Build command : `npm run build`
Output directory: `.svelte-kit/cloudflare`
