export const TOS_ANALYSIS_SCHEMA = {
    type: "object",
    properties: {
      service: { type: "string" },
      riskScore: { type: "number" },
      summary: { type: "string" },
      clauseCount: { type: "number" },
      redFlags: { type: "array", items: { type: "string" } },
      cautions: { type: "array", items: { type: "string" } },
      positives: { type: "array", items: { type: "string" } },
      violations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            count: { type: "number" }
          },
          required: ["label", "count"]
        }
      }
    },
    required: ["service", "riskScore", "summary", "clauseCount", "redFlags", "cautions", "positives", "violations"]
  };