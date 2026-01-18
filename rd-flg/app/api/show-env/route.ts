import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Show current environment configuration (sanitized for security)
 * Visit: http://localhost:3000/api/show-env
 */
export async function GET() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  // Sanitize private key - only show structure, not actual key
  let keyPreview = "NOT SET";
  if (privateKey) {
    const lines = privateKey.split("\n");
    keyPreview = `${lines.length} lines, ${privateKey.length} chars`;
    
    // Show first and last few characters (safe to show)
    if (privateKey.length > 60) {
      keyPreview += `\nFirst 30: ${privateKey.substring(0, 30)}...\nLast 30: ...${privateKey.substring(privateKey.length - 30)}`;
    }
  }

  const result = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    variables: {
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: {
        set: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NOT SET",
      },
      FIREBASE_CLIENT_EMAIL: {
        set: !!process.env.FIREBASE_CLIENT_EMAIL,
        value: process.env.FIREBASE_CLIENT_EMAIL || "NOT SET",
      },
      FIREBASE_PRIVATE_KEY: {
        set: !!privateKey,
        length: privateKey?.length || 0,
        hasBackslashN: privateKey?.includes("\\n") || false,
        hasActualNewlines: privateKey?.split("\n").length || 0,
        startsWithDashes: privateKey?.startsWith("-----") || false,
        preview: keyPreview,
      },
      GEMINI_API_KEY: {
        set: !!process.env.GEMINI_API_KEY,
        length: process.env.GEMINI_API_KEY?.length || 0,
      },
    },
    analysis: {
      privateKeyFormat: "unknown",
      recommendation: "",
    },
  };

  // Analyze private key format
  if (privateKey) {
    if (privateKey.includes("\\n")) {
      result.analysis.privateKeyFormat = "Contains \\n - needs processing";
      result.analysis.recommendation = "Private key has literal \\n - this is CORRECT for .env.local";
    } else if (privateKey.split("\n").length > 1) {
      result.analysis.privateKeyFormat = "Contains actual newlines";
      result.analysis.recommendation = "⚠️ Private key has actual newlines - this might cause issues. Should use \\n instead.";
    } else {
      result.analysis.privateKeyFormat = "Single line without \\n";
      result.analysis.recommendation = "❌ Private key appears to be on single line without \\n separators - this will fail.";
    }
  }

  return NextResponse.json(result);
}
