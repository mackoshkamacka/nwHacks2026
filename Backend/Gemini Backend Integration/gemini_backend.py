import os
import json
import time
import uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from google import genai
from google.genai import types
from schemas import TOS_ANALYSIS_SCHEMA

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

app = Flask(__name__)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_tos(tos_text: str, service_name: str = "Unknown Service") -> dict:
    submission_id = str(uuid.uuid4())
    snapshot = datetime.utcnow().isoformat() + "Z"

    prompt = f"""Analyze the following Terms of Service agreement and provide a structured analysis.

Service Name: {service_name}
Submission ID: {submission_id}
Snapshot: {snapshot}

Terms of Service Text:
{tos_text}

Provide your analysis including:
- A risk score from 0-100 (0 = safe, 100 = very risky)
- A brief summary of the ToS
- Count of major clauses
- Red flags (serious concerns users should know about)
- Cautions (moderate concerns)
- Positives (user-friendly terms)
- Violations categorized by type with counts

Use the submissionId "{submission_id}", service "{service_name}", and snapshot "{snapshot}" in your response."""

    start_time = time.time()
    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TOS_ANALYSIS_SCHEMA
        )
    )
    latency_ms = (time.time() - start_time) * 1000

    result = json.loads(response.text)
    result["geminiLatencyMs"] = latency_ms

    return result

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/prompt", methods=["POST"])
def prompt_llm():
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "Missing 'prompt' in request body"}), 400

    response = client.models.generate_content(
        model="gemini-2.5-pro", contents=data["prompt"]
    )

    print(response.text)

    return jsonify({"response": response.text})

@app.route("/analyze-tos", methods=["POST"])
def analyze_tos_endpoint():
    data = request.get_json()
    if not data or "tos_text" not in data:
        return jsonify({"error": "Missing 'tos_text' in request body"}), 400

    service_name = data.get("service_name", "Unknown Service")

    try:
        result = analyze_tos(data["tos_text"], service_name)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6767, debug=True)