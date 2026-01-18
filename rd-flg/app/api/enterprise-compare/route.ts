import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { geminiModel } from "@/lib/gemini";
import { ENTERPRISE_COMPARISON_SCHEMA } from "@/lib/schema";

// This replaces the Python get_user_flagged_issues function
async function getUserFlaggedIssues() {
  const snapshot = await adminDb.collection("tos_analyses").get();
  
  const allRedFlags: string[] = [];
  const allPositives: string[] = [];
  const reportCount = snapshot.size;

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (Array.isArray(data.redFlags)) allRedFlags.push(...data.redFlags);
    if (Array.isArray(data.positives)) allPositives.push(...data.positives);
  });

  // Simple frequency counter (replacing Python dict comprehension)
  const redFlagSummary = allRedFlags.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { redFlagSummary, allPositives, reportCount };
}

export async function POST(req: Request) {
  try {
    const { tos_text, service_name } = await req.json();

    // 1. Fetch aggregate data from Firestore
    const { redFlagSummary, allPositives, reportCount } = await getUserFlaggedIssues();

    // 2. Build Prompt
    const prompt = `You are analyzing an enterprise's Terms of Service.
    
    Enterprise: ${service_name}
    Text: ${tos_text.substring(0, 20000)} // Truncate if massive

    User Community Data (${reportCount} reports):
    Common Complaints: ${JSON.stringify(redFlagSummary, null, 2)}
    Liked Features: ${JSON.stringify([...new Set(allPositives)].slice(0, 10), null, 2)}

    TASK:
    1. Identify clauses in this enterprise TOS that match user complaints.
    2. Estimate how many users would flag specific sections.
    3. Provide recommendations.`;

    // 3. Call Gemini
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ENTERPRISE_COMPARISON_SCHEMA,
      },
    });

    const data = JSON.parse(result.response.text());
    
    // Add metadata
    data.totalUserAnalyses = reportCount;
    if (data.riskScore) data.riskScore = Math.round(data.riskScore / 10) * 10;

    return NextResponse.json(data);

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}