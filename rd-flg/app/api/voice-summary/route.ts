import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel (example)
const ELEVEN_ENDPOINT = "https://api.elevenlabs.io/v1/text-to-speech";

async function fetchVoiceSummary(text: string, voiceId?: string) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is missing. Add it to your environment.");
  }

  const response = await fetch(`${ELEVEN_ENDPOINT}/${voiceId || DEFAULT_VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs request failed: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const charCost = response.headers.get("x-character-count") || "0";
  const requestId = response.headers.get("request-id") || "unknown";

  return {
    audioBuffer: Buffer.from(arrayBuffer),
    charCost,
    requestId,
  };
}

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const narrationText = text.trim().slice(0, 5000); // prevent runaway cost
    const { audioBuffer, charCost, requestId } = await fetchVoiceSummary(narrationText, voiceId);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "x-elevenlabs-character-count": charCost,
        "x-elevenlabs-request-id": requestId,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Voice summary error:", error);
    return NextResponse.json(
      { error: "Voice synthesis failed", details: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
