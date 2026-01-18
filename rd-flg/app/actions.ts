'use server' 

import { GoogleGenerativeAI } from "@google/generative-ai";
import { TOS_ANALYSIS_SCHEMA } from "@/lib/schema";
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeTosAction(tosText: string, serviceName: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-pro", // Using the latest flash model for speed/cost
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: TOS_ANALYSIS_SCHEMA as any,
      temperature: 0, 
    }
  });

  // Generate metadata inside the function to pass to the prompt
  const submissionId = uuidv4();
  const snapshot = new Date().toISOString();

  // Clean, structured prompt without the nested Python syntax
  const prompt = `
    Analyze the following Terms of Service agreement and provide a structured analysis.

    SERVICE DETAILS:
    - Service Name: ${serviceName}
    - Submission ID: ${submissionId}
    - Snapshot Date: ${snapshot}

    ANALYSIS REQUIREMENTS:
    1. Risk Score: 0-100 (0=Safe, 100=Predatory). Be objective and fair.
    2. Summary: A concise overview of the document tone and intent.
    3. Clause Count: Estimated total major sections.
    4. Red Flags: List critical legal risks (forced arbitration, broad data rights).
    5. Cautions: List moderate risks (automatic renewals, tracking).
    6. Positives: List user-centric terms (clear opt-outs, breach notifications).
    7. Violations: Group findings by category (Privacy, Content, Liability) with counts.

    TERMS OF SERVICE TEXT:
    ${tosText}

    Return the result as a JSON object matching the provided schema.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseData = JSON.parse(result.response.text());
    
    // We append the metadata to the result before returning to the UI
    return {
      ...responseData,
      submissionId,
      snapshot
    };
  } catch (error) {
    console.error("Gemini Protocol Error:", error);
    throw new Error("The deconstruction sequence failed. Check document integrity.");
  }
}