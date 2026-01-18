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