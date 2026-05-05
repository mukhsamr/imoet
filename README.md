# imoet

Kumpulan mini web lucu-lucuan berbasis SvelteKit, Bun, Tailwind CSS, Cloudflare Pages, OpenRouter, dan Cloudflare D1.

## Fitur

- `/cantik` - game tombol "Nggak" yang kabur.
- `/mood` - mood tracker lokal berbasis `localStorage`.
- `/confess` - generator surat confess memakai OpenRouter AI dan cache template di D1.

## Setup Lokal

Install dependency:

```bash
bun install
```

Buat file `.env` di root project:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/free
```

`OPENROUTER_MODEL` opsional. Jika kosong, endpoint memakai `openrouter/free`.

Jalankan dev server:

```bash
bun run dev
```

## Cloudflare D1

Binding D1 didefinisikan di `wrangler.toml` sebagai `DB`.

Apply schema lokal:

```bash
bunx wrangler d1 execute imoet-db --local --file=schema.sql
```

Apply schema remote:

```bash
bunx wrangler d1 execute imoet-db --remote --file=schema.sql
```

## Deploy Cloudflare Pages

Tambahkan environment variable di Cloudflare Pages:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/free
```

Build command:

```bash
bun run build
```

Output directory:

```bash
.svelte-kit/cloudflare
```
