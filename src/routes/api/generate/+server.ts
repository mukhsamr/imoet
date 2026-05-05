import type { RequestHandler } from './$types';

const DEFAULT_OPENROUTER_MODEL = 'openrouter/free';

const STYLE_PROMPTS: Record<string, string> = {
  manis: 'Gaya manis dan manja, bahasa gaul lembut, banyak tanda ~ dan 🥺💕.',
  puitis: 'Gaya puitis dan sastrawi, metafora, kata-kata indah seperti sajak prosa.',
  drama: 'Gaya lebay dramatis seperti sinetron Indonesia, all caps sesekali, banyak 😭.',
  receh: 'Gaya receh kocak, seperti laporan resmi absurd, ada nomor bukti-bukti.',
};

function textResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export const POST: RequestHandler = async ({ request, platform }) => {
  const apiKey = platform?.env?.OPENROUTER_API_KEY;
  const model = platform?.env?.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
  const db = platform?.env?.DB;

  if (!apiKey) {
    return textResponse('OPENROUTER_API_KEY belum dikonfigurasi', 500);
  }

  let body: {
    from?: string;
    to?: string;
    thing?: string;
    style?: string;
    forceNew?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return textResponse('Request tidak valid', 400);
  }

  const { from = '', to = '', thing = '', style = 'manis', forceNew = false } = body;

  if (!to?.trim()) {
    return textResponse('Nama penerima wajib diisi', 400);
  }

  const thingText = thing?.trim() || 'semua hal tentang dirinya';
  const styleGuide = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.manis;
  const selectedStyle = STYLE_PROMPTS[style] ? style : 'manis';

  // Cek cache D1 dulu (kecuali user minta "ganti versi")
  if (db && !forceNew) {
    try {
      const cached = await db
        .prepare('SELECT id, content FROM letters WHERE style = ? ORDER BY RANDOM() LIMIT 1')
        .bind(selectedStyle)
        .first<{ id: number; content: string }>();

      if (cached) {
        await db
          .prepare('UPDATE letters SET used = COALESCE(used, 0) + 1 WHERE id = ?')
          .bind(cached.id)
          .run();

        const personalized = cached.content
          .replace(/\[NAMA_PENERIMA\]/g, to.trim())
          .replace(/\[NAMA_PENGIRIM\]/g, from.trim() || 'Seseorang');

        return textResponse(personalized, 200);
      }
    } catch (error) {
      console.error('D1 cache read failed', error);
      // Cache is optional. If D1 is not ready in a Pages environment, keep generating.
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
- Jangan menulis salam penutup, tanda tangan, atau nama pengirim di akhir surat karena template sudah menampilkannya
- Maksimal 5 kalimat
- Langsung tulis suratnya`;

  let res: Response;

  try {
    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://imoet.pages.dev',
        'X-Title': 'imoet',
      },
      body: JSON.stringify({
        model,
        stream: false,
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (error) {
    console.error('OpenRouter request failed', error);
    return textResponse('AI belum bisa dihubungi. Coba lagi sebentar ya.', 502);
  }

  if (!res.ok) {
    console.error('OpenRouter response failed', {
      status: res.status,
      body: await res.text(),
    });
    return textResponse('AI gagal menulis surat. Coba lagi sebentar ya.', res.status);
  }

  if (!res.body) {
    return textResponse('AI tidak mengirim respons yang bisa dibaca', 502);
  }

  let completion: {
    choices?: Array<{
      message?: { content?: string };
      delta?: { content?: string };
    }>;
  };

  try {
    completion = await res.json();
  } catch (error) {
    console.error('OpenRouter JSON parse failed', error);
    return textResponse('AI mengirim respons yang tidak bisa dibaca', 502);
  }

  const fullText =
    completion.choices?.[0]?.message?.content ??
    completion.choices?.[0]?.delta?.content ??
    '';

  if (!fullText.trim()) {
    console.error('OpenRouter returned empty content', completion);
    return textResponse('AI belum berhasil menulis surat. Coba lagi ya.', 502);
  }

  // Simpan template ke D1
  if (db) {
    try {
      await db
        .prepare('INSERT INTO letters (style, content) VALUES (?, ?)')
        .bind(selectedStyle, fullText.trim())
        .run();
    } catch (error) {
      console.error('D1 cache write failed', error);
    }
  }

  return textResponse(fullText.trim(), 200);
};
