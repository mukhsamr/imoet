import { env } from "$env/dynamic/private";
import type { RequestHandler } from './$types';

const STYLE_PROMPTS: Record<string, string> = {
  manis: 'Gaya manis dan manja, bahasa gaul lembut, banyak tanda ~ dan 🥺💕.',
  puitis: 'Gaya puitis dan sastrawi, metafora, kata-kata indah seperti sajak prosa.',
  drama: 'Gaya lebay dramatis seperti sinetron Indonesia, all caps sesekali, banyak 😭.',
  receh: 'Gaya receh kocak, seperti laporan resmi absurd, ada nomor bukti-bukti.',
};

export const POST: RequestHandler = async ({ request, platform }) => {
  const apiKey = env.OPENROUTER_API_KEY
  const model = env.OPENROUTER_MODEL ?? 'openrouter/free';
  const db = platform?.env?.DB;;

  if (!apiKey) {
    return new Response('OPENROUTER_API_KEY tidak ditemukan', { status: 500 });
  }

  const { from, to, thing, style, forceNew = false } = await request.json() as {
    from: string; to: string; thing: string; style: string; forceNew?: boolean;
  };

  if (!to?.trim()) {
    return new Response('Nama penerima wajib diisi', { status: 400 });
  }

  const thingText = thing?.trim() || 'semua hal tentang dirinya';
  const styleGuide = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.manis;

  // Cek cache D1 dulu (kecuali user minta "ganti versi")
  if (db && !forceNew) {
    const cached = await db
      .prepare('SELECT content FROM letters WHERE style = ? ORDER BY RANDOM() LIMIT 1')
      .bind(style)
      .first<{ content: string }>();

    if (cached) {
      const personalized = cached.content
        .replace(/\[NAMA_PENERIMA\]/g, to.trim())
        .replace(/\[NAMA_PENGIRIM\]/g, from.trim() || 'Seseorang')

      return new Response(personalized, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  const prompt = `Kamu adalah penulis surat cinta kreatif berbahasa Indonesia.

Tulis surat confess dari seseorang kepada seseorang lainnya.
Hal yang disukai pengirim: ${thingText}

${styleGuide}

Aturan:
- Ganti nama pengirim dengan teks: [NAMA_PENGIRIM]
- Ganti nama penerima dengan teks: [NAMA_PENERIMA]  
- Hal yang disukai (${thingText}) harus diparafrase natural dalam kalimat, contoh: kalau "senyumnya", tulis "suka banget lihat kamu senyum" — bukan copy paste
- Dilarang keras menulis tanda kurung siku [] selain untuk nama pengirim dan penerima
- Maksimal 5 kalimat
- Langsung tulis suratnya`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://imoet.pages.dev',
      'X-Title': 'imoet',
    },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    return new Response(`OpenRouter error: ${await res.text()}`, { status: res.status });
  }

  let fullText = '';

  const readable = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const chunk = JSON.parse(data);
            const text = chunk.choices?.[0]?.delta?.content ?? '';
            if (text) {
              fullText += text;
              controller.enqueue(encoder.encode(text)); // kirim raw, tanpa replace
            }
          } catch { /* skip */ }
        }
      }

      controller.close();

      // Simpan template ke D1
      if (db && fullText.trim()) {
        await db
          .prepare('INSERT INTO letters (style, content) VALUES (?, ?)')
          .bind(style, fullText.trim())
          .run();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};