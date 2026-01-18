import { NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/**
 * Fetches existing analyses and builds cross-reference intelligence.
 */
async function getCommunityIntelligence() {
  try {
    console.log("🔍 Fetching community intelligence...");
    const db = getAdminDb();

    const snapshot = await db
      .collection("analyses")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    console.log(`📊 Found ${snapshot.size} existing analyses`);

    const issueCounts: Record<string, number> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const allIssues = [
        ...(data.redFlags || []),
        ...(data.cautions || []),
      ];
      allIssues.forEach((issue: string) => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });

    const violations = Object.entries(issueCounts).map(([label, count]) => ({
      label,
      count,
    }));

    return {
      violations,
      totalReports: snapshot.size,
    };
  } catch (error) {
    console.error("❌ Community Fetch Error:", error);
    return { violations: [], totalReports: 0 };
  }
}

export async function POST(req: Request) {
  try {
    console.log("📥 Received ToS analysis request");

    const body = await req.json();
    const { tos_text, service_name } = body;

    if (!tos_text || tos_text.trim().length === 0) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // 1. Fetch Community Context
    const community = await getCommunityIntelligence();

    // 2. Build the Prompt
    const prompt = `You are an expert legal auditor analyzing Terms of Service documents.

ANALYSIS REQUEST:
Service: ${service_name || "Unknown Service"}
Community Reports Analyzed: ${community.totalReports}

KNOWN COMMUNITY ISSUE PATTERNS:
${JSON.stringify(community.violations.slice(0, 10), null, 2)}

TERMS OF SERVICE TEXT:
${tos_text.substring(0, 15000)}

YOUR TASK:
Analyze this ToS and return ONLY valid JSON with:
{
  service,
  riskScore (0–100),
  summary,
  redFlags[],
  cautions[],
  positives[],
  violations[] // array of { label, count }
}`;

    const result = await geminiModel.generateContent(prompt);
    const responseText = (await result.response).text();

    const sanitizedText = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const analysis = JSON.parse(sanitizedText);

    // 3. Normalize + Merge Community Counts
    const finalizedData = {
      service: service_name || analysis.service || "New Policy",
      riskScore: Math.round((analysis.riskScore || 0) / 10) * 10,
      summary: analysis.summary || "Analysis completed",
      redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
      cautions: Array.isArray(analysis.cautions) ? analysis.cautions : [],
      positives: Array.isArray(analysis.positives) ? analysis.positives : [],
      violations: Array.isArray(analysis.violations)
        ? analysis.violations
        : community.violations,
      totalUserAnalyses: community.totalReports,
      createdAt: new Date().toISOString(),
    };

    // 4. Save to Firestore
    try {
      const db = getAdminDb();
      await db.collection("analyses").add(finalizedData);
    } catch (err) {
      console.error("⚠️ Firestore save failed:", err);
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
