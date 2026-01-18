import { NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { getAdminDb } from "@/lib/firebase-admin"; // Updated import

export const runtime = "nodejs";

/**
 * Fetches existing analyses to provide community context to Gemini.
 */
async function getCommunityIntelligence() {
  try {
    console.log("🔍 Fetching community intelligence...");
    
    // Initialize DB instance
    const db = getAdminDb();
    
    // Fetch the latest 50 reports to stay within token limits
    const snapshot = await db
      .collection("analyses")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    console.log(`📊 Found ${snapshot.size} existing analyses`);

    const communityData = {
      redFlags: [] as string[],
      cautions: [] as string[],
      positives: [] as string[],
      totalReports: snapshot.size,
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.redFlags) communityData.redFlags.push(...data.redFlags);
      if (data.cautions) communityData.cautions.push(...data.cautions);
      if (data.positives) communityData.positives.push(...data.positives);
    });

    console.log(`✅ Community data summary: ${communityData.redFlags.length} red flags found`);
    return communityData;
  } catch (error) {
    console.error("❌ Community Fetch Error:", error);
    // Return empty data instead of failing the whole request
    return { redFlags: [], cautions: [], positives: [], totalReports: 0 };
  }
}

export async function POST(req: Request) {
  try {
    console.log("📥 Received ToS analysis request");
    
    const body = await req.json();
    const { tos_text, service_name } = body;

    console.log(`📄 Service: ${service_name || "Unknown"}, Text length: ${tos_text?.length || 0} chars`);

    if (!tos_text || tos_text.trim().length === 0) {
      console.error("❌ No text provided");
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // 1. Fetch Community Context
    const community = await getCommunityIntelligence();

    // 2. Build Frequency Maps for the prompt
    const redFlagFreq = community.redFlags.reduce((acc, flag) => {
      acc[flag] = (acc[flag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRedFlags = Object.entries(redFlagFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

    // 3. Build the Prompt
    const prompt = `You are an expert legal auditor analyzing Terms of Service documents.

ANALYSIS REQUEST:
Service: ${service_name || "Unknown Service"}
Community Context: ${community.totalReports} previous user reports analyzed

TOP COMMUNITY CONCERNS (frequency):
${JSON.stringify(topRedFlags, null, 2)}

TERMS OF SERVICE TEXT:
${tos_text.substring(0, 15000)}

YOUR TASK:
Analyze this ToS and provide a JSON response with:
1. service, 2. riskScore (0-100), 3. summary, 4. redFlags, 5. cautions, 6. positives, 7. violations.

Return ONLY valid JSON.`;

    console.log("🤖 Calling Gemini API...");

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Clean up markdown code blocks if Gemini includes them
    const sanitizedText = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(sanitizedText);
      console.log("✅ JSON parsed successfully");
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    // 4. Final Normalization
    const finalizedData = {
      service: service_name || analysis.service || "New Policy",
      riskScore: Math.round((analysis.riskScore || 0) / 10) * 10,
      summary: analysis.summary || "Analysis completed",
      redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
      cautions: Array.isArray(analysis.cautions) ? analysis.cautions : [],
      positives: Array.isArray(analysis.positives) ? analysis.positives : [],
      violations: Array.isArray(analysis.violations) ? analysis.violations : [],
      totalUserAnalyses: community.totalReports,
      createdAt: new Date().toISOString(),
    };

    // 5. Save to Firestore
    try {
      const db = getAdminDb();
      const docRef = await db.collection("analyses").add(finalizedData);
      console.log(`✅ Saved to Firestore with ID: ${docRef.id}`);
    } catch (firestoreError) {
      console.error("⚠️ Firestore save failed (non-critical):", firestoreError);
    }

    return NextResponse.json(finalizedData);

  } catch (error: any) {
    console.error("💥 API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}