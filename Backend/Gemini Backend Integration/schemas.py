TOS_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "service": {
            "type": "string",
            "description": "Service name or identifier"
        },
        "riskScore": {
            "type": "number",
            "description": "Numerical risk score from 0-100, where 100 is highest risk"
        },
        "summary": {
            "type": "string",
            "description": "Brief summary of the terms of service analysis"
        },
        "clauseCount": {
            "type": "number",
            "description": "Total number of clauses analyzed in the terms of service"
        },
        "redFlags": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Array of serious concerns or problematic clauses found"
        },
        "cautions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Array of moderate concerns or clauses requiring attention"
        },
        "positives": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Array of user-friendly or positive aspects found"
        },
        "violations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "label": {
                        "type": "string",
                        "description": "Type or category of violation"
                    },
                    "count": {
                        "type": "number",
                        "description": "Number of occurrences of this violation type"
                    }
                },
                "required": ["label", "count"]
            },
            "description": "Array of violation types with their occurrence counts"
        },
        "alertsRaised": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Array of alert IDs for downstream notifications"
        }
    },
    "required": [
        "service",
        "riskScore",
        "summary",
        "clauseCount",
        "redFlags",
        "cautions",
        "positives",
        "violations"
    ]
}

SUBMISSION_SCHEMA = {
    "type": "object",
    "properties": {
        "source": {
            "type": "string",
            "enum": ["paste", "url"],
            "description": "Source of the terms of service - either pasted text or URL"
        },
        "tosUrl": {
            "type": "string",
            "description": "URL of the terms of service if source is 'url', otherwise null",
            "nullable": True
        },
        "tosText": {
            "type": "string",
            "description": "The actual terms of service text content"
        },
        "wordCount": {
            "type": "number",
            "description": "Number of words in the terms of service text"
        },
        "notes": {
            "type": "string",
            "description": "Optional notes or comments about the submission"
        }
    },
    "required": [
        "source",
        "tosText",
        "wordCount"
    ]
}

ENTERPRISE_COMPARISON_SCHEMA = {
    "type": "object",
    "properties": {
        "riskScore": {
            "type": "number",
            "description": "Overall risk score from 0-100 based on user-flagged issues"
        },
        "summary": {
            "type": "string",
            "description": "Summary of how this TOS compares to user-reported issues"
        },
        "matchedIssues": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "issue": {
                        "type": "string",
                        "description": "The problematic clause or issue found in the enterprise TOS"
                    },
                    "userReports": {
                        "type": "number",
                        "description": "Number of times users have flagged similar issues"
                    },
                    "severity": {
                        "type": "string",
                        "enum": ["high", "medium", "low"],
                        "description": "Severity level based on user feedback"
                    },
                    "recommendation": {
                        "type": "string",
                        "description": "Suggested fix or improvement"
                    }
                },
                "required": ["issue", "userReports", "severity", "recommendation"]
            },
            "description": "Issues in the enterprise TOS that match user-reported problems"
        },
        "redFlags": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Critical issues that users frequently complain about"
        },
        "cautions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Moderate concerns based on user feedback"
        },
        "positives": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Clauses that users respond well to"
        },
        "communityInsights": {
            "type": "object",
            "properties": {
                "totalUserReports": {
                    "type": "number",
                    "description": "Total number of user reports analyzed"
                },
                "topComplaint": {
                    "type": "string",
                    "description": "Most common user complaint category"
                },
                "industryComparison": {
                    "type": "string",
                    "description": "How this TOS compares to industry average"
                }
            },
            "required": ["totalUserReports", "topComplaint", "industryComparison"]
        }
    },
    "required": [
        "riskScore",
        "summary",
        "matchedIssues",
        "redFlags",
        "cautions",
        "positives",
        "communityInsights"
    ]
}