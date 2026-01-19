import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Split long text into natural sentence/phrase chunks <= 180 chars
 */
function splitTextIntoChunks(text: string, maxLength = 180): string[] {
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\[image:\d+\](?:\s*\*\((.*?)\)\*)?/g, '')
    .trim();

  if (!cleaned) return [];

  const chunks: string[] = [];
  // Split by sentence terminators or clauses
  const sentences = cleaned.split(/(?<=[.?!;:\n])\s+/);

  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).trim().length <= maxLength) {
      currentChunk = (currentChunk + ' ' + sentence).trim();
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }

      // If single sentence exceeds maxLength, split by commas or spaces
      if (sentence.length > maxLength) {
        const words = sentence.split(' ');
        let temp = '';
        for (const word of words) {
          if ((temp + ' ' + word).trim().length <= maxLength) {
            temp = (temp + ' ' + word).trim();
          } else {
            if (temp) chunks.push(temp);
            temp = word;
          }
        }
        if (temp) chunks.push(temp);
      } else {
        currentChunk = sentence;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.filter((c) => c.trim().length > 0);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, lang = 'vi', voice = 'vi-VN-NamMinhNeural', speed = 1.0 } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Nội dung văn bản không được để trống' }, { status: 400 });
    }

    const targetLang = voice.startsWith('en') || lang === 'en' ? 'en' : 'vi';
    const isMale = voice.includes('Nam') || voice.includes('Guy') || voice.toLowerCase().includes('male');
    const gender = isMale ? 'male' : 'female';

    // 1. Attempt to call OmniVoice TTS Microservice
    const omnivoiceUrl = process.env.OMNIVOICE_API_URL || 'http://127.0.0.1:8000/v1/tts';
    try {
      const omniResponse = await fetch(omnivoiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: targetLang,
          gender,
          voice,
          speed,
        }),
        // Fast timeout check: 4.5s
        signal: AbortSignal.timeout(4500),
      });

      if (omniResponse.ok) {
        const omniAudioBuffer = Buffer.from(await omniResponse.arrayBuffer());
        if (omniAudioBuffer.length > 500) {
          return new NextResponse(omniAudioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/wav',
              'Content-Length': omniAudioBuffer.length.toString(),
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
              'X-Engine': 'OmniVoice-AI',
              'X-Voice-Gender': gender,
            },
          });
        }
      }
    } catch (omniErr) {
      // OmniVoice microservice is offline or timed out, proceed to neural fallback
      console.log('[TTS API] OmniVoice offline, using neural fallback engine.');
    }

    // 2. High-speed Fallback Engine
    const textChunks = splitTextIntoChunks(text, 180);

    if (textChunks.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy văn bản hợp lệ để đọc' }, { status: 400 });
    }

    // Limit to first 30 chunks (approx 5,000 chars) for high-speed responsiveness
    const limitedChunks = textChunks.slice(0, 30);

    // Fetch MP3 chunks in parallel batches
    const fetchPromises = limitedChunks.map(async (chunk) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${encodeURIComponent(
        chunk
      )}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      });

      if (!response.ok) {
        throw new Error(`TTS provider returned status ${response.status}`);
      }

      return Buffer.from(await response.arrayBuffer());
    });

    const results = await Promise.all(fetchPromises);
    const combinedBuffer = Buffer.concat(results);

    return new NextResponse(combinedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        'X-Engine': 'Neural-Fallback',
      },
    });
  } catch (error: any) {
    console.error('[TTS API] Synthesis Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Không thể tạo giọng đọc từ máy chủ' },
      { status: 500 }
    );
  }
}
