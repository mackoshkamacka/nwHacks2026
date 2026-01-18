import { SchemaType, Schema } from "@google/generative-ai";

export const TOS_ANALYSIS_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    service: { type: SchemaType.STRING },
    riskScore: { type: SchemaType.NUMBER },
    summary: { type: SchemaType.STRING },
    clauseCount: { type: SchemaType.NUMBER },
    redFlags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    cautions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    positives: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    violations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          label: { type: SchemaType.STRING },
          count: { type: SchemaType.NUMBER },
        },
        required: ["label", "count"],
      },
    },
  },
  required: ["service", "riskScore", "summary", "redFlags", "violations"],
};

export const ENTERPRISE_COMPARISON_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    riskScore: { type: SchemaType.NUMBER },
    summary: { type: SchemaType.STRING },
    matchedIssues: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          issue: { type: SchemaType.STRING },
          userReports: { type: SchemaType.NUMBER },
          severity: {
            type: SchemaType.STRING,
          },
          recommendation: { type: SchemaType.STRING },
        },
        required: ["issue", "userReports", "severity", "recommendation"],
      },
    },
    communityInsights: {
      type: SchemaType.OBJECT,
      properties: {
        totalUserReports: { type: SchemaType.NUMBER },
        topComplaint: { type: SchemaType.STRING },
        industryComparison: { type: SchemaType.STRING },
      },
      required: ["totalUserReports", "topComplaint"],
    },
  },
  required: ["riskScore", "matchedIssues", "communityInsights"],
};
