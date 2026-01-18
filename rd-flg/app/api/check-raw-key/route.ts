import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Detailed check of the raw private key format
 */
export async function GET() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!privateKey) {
    return NextResponse.json({ error: "FIREBASE_PRIVATE_KEY not set" });
  }

  // Count different types of characters
  const backslashCount = (privateKey.match(/\\/g) || []).length;
  const nAfterBackslash = (privateKey.match(/\\n/g) || []).length;
  const actualNewlines = (privateKey.match(/\n/g) || []).length;
  
  // Get first 300 chars to see the structure
  const first300 = privateKey.substring(0, 300);
  
  // Show as array to see each character
  const firstChars = first300.split('').slice(0, 80).map((char, i) => {
    if (char === '\n') return `[NEWLINE at ${i}]`;
    if (char === '\\') return `[BACKSLASH at ${i}]`;
    if (char === '"') return `[QUOTE at ${i}]`;
    return char;
  }).join('');

  // Determine the actual issue
  let issue = "";
  let fix = "";
  
  if (actualNewlines > 5) {
    // The string contains actual newline characters
    issue = "❌ Your private key contains ACTUAL newline characters (the string has been split)";
    fix = "The \\n in your .env.local are being interpreted as actual newlines. This usually happens when you paste the key with text that already has \\n converted to newlines.";
  } else if (nAfterBackslash === 0) {
    issue = "❌ Your private key has NO \\n separators";
    fix = "Add \\n between each line of the key";
  } else if (nAfterBackslash > 0 && actualNewlines <= 2) {
    issue = "✅ Format looks correct!";
    fix = "The private key format appears correct. The issue must be something else.";
  }

  return NextResponse.json({
    analysis: {
      totalLength: privateKey.length,
      backslashCount,
      backslashNCount: nAfterBackslash,
      actualNewlineCount: actualNewlines,
      issue,
      fix,
    },
    preview: {
      first300chars: first300,
      characterByCharacter: firstChars,
      startsCorrectly: privateKey.startsWith('"-----BEGIN') || privateKey.startsWith('-----BEGIN'),
      endsCorrectly: privateKey.endsWith('-----"') || privateKey.endsWith('-----\n"') || privateKey.endsWith('-----\\n"'),
    },
    rawValue: {
      // Show the actual JavaScript representation
      typeof: typeof privateKey,
      constructor: privateKey.constructor.name,
      // Check if it's actually a multi-line string
      lineArray: privateKey.split('\n').length,
    },
  });
}