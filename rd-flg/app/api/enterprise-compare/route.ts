import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin"; // Match the export name
import { geminiModel } from "@/lib/gemini";
import { ENTERPRISE_COMPARISON_SCHEMA } from "@/lib/schema";

// Initialize adminDb by calling the helper function
const adminDb = getAdminDb();

async function getUserFlaggedIssues() {
  // Added try/catch for database resilience
  try {
    const snapshot = await adminDb.collection("tos_analyses").get();
    
    const allRedFlags: string[] = [];
    const allPositives: string[] = [];
    const reportCount = snapshot.size;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.redFlags)) allRedFlags.push(...data.redFlags);
      if (Array.isArray(data.positives)) allPositives.push(...data.positives);
    });

    // Simple frequency counter
    const redFlagSummary = allRedFlags.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { redFlagSummary, allPositives, reportCount };
  } catch (dbError) {
    console.error("Firestore error:", dbError);
    return { redFlagSummary: {}, allPositives: [], reportCount: 0 };
  }
}

export async function POST(req: Request) {
  try {
    const { tos_text, service_name } = await req.json();

    if (!tos_text || !service_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch aggregate data from Firestore
    const { redFlagSummary, allPositives, reportCount } = await getUserFlaggedIssues();

    // 2. Build Prompt
    const prompt = `You are analyzing an enterprise's Terms of Service.
    
    Enterprise: ${service_name}
    Text: ${tos_text.substring(0, 25000)}

    User Community Data (${reportCount} reports):
    Common Complaints: ${JSON.stringify(redFlagSummary, null, 2)}
    Liked Features: ${JSON.stringify([...new Set(allPositives)].slice(0, 10), null, 2)}

    TASK:
    1. Identify clauses in this enterprise TOS that match user complaints.
    2. Estimate how many users would flag specific sections based on the community data provided.
    3. Provide actionable business recommendations.
    4. Return a risk score from 0-100.`;

    // 3. Call Gemini
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ENTERPRISE_COMPARISON_SCHEMA,
      },
    });

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error("Empty response from AI model");
    }

    const data = JSON.parse(responseText);
    
    // 4. Add metadata & clean data
    data.totalUserAnalyses = reportCount;
    if (data.riskScore !== undefined) {
      data.riskScore = Math.round(data.riskScore / 5) * 5; // Rounding to nearest 5 for a cleaner dashboard look
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}