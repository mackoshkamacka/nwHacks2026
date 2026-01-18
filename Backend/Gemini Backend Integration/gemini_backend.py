import os
import json
import time
import uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from google import genai
from google.genai import types
from schemas import TOS_ANALYSIS_SCHEMA, SUBMISSION_SCHEMA, ENTERPRISE_COMPARISON_SCHEMA
import firebase_admin
from firebase_admin import credentials, firestore

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

app = Flask(__name__)
CORS(app)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize Firebase Admin SDK
firebase_cred_path = Path(__file__).resolve().parent / "firebase-service-account.json"
if firebase_cred_path.exists() and not firebase_admin._apps:
    cred = credentials.Certificate(str(firebase_cred_path))
    firebase_admin.initialize_app(cred)
    db = firestore.client()
else:
    db = None

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
            response_schema=TOS_ANALYSIS_SCHEMA,
            temperature=0
        )
    )
    latency_ms = (time.time() - start_time) * 1000

    result = json.loads(response.text)
    result["geminiLatencyMs"] = latency_ms
    if "riskScore" in result:
        result["riskScore"] = round(result["riskScore"] / 10) * 10

    return result

def process_submission(tos_text: str, source: str = "paste", tos_url: str = None) -> dict:
    prompt = f"""Extract submission metadata from the following Terms of Service text.

Source: {source}
URL: {tos_url if tos_url else "N/A"}

Terms of Service Text:
{tos_text}

Provide the following information:
- source: "{source}"
- tosUrl: {"'" + tos_url + "'" if tos_url else "null"}
- tosText: The full terms of service text
- wordCount: Count the number of words in the text
- notes: Any notable observations about the document format or structure"""

    start_time = time.time()
    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SUBMISSION_SCHEMA,
            temperature=0
        )
    )
    latency_ms = (time.time() - start_time) * 1000

    result = json.loads(response.text)
    result["geminiLatencyMs"] = latency_ms

    return result

def get_user_flagged_issues():
    """Fetch all user-submitted TOS analyses from Firebase to build issue database."""
    if db is None:
        return []

    analyses = []
    docs = db.collection("tos_analyses").stream()
    for doc in docs:
        data = doc.to_dict()
        analyses.append({
            "service": data.get("service", "Unknown"),
            "redFlags": data.get("redFlags", []),
            "cautions": data.get("cautions", []),
            "positives": data.get("positives", []),
            "riskScore": data.get("riskScore", 0),
            "violations": data.get("violations", [])
        })
    return analyses

def compare_enterprise_tos(tos_text: str, service_name: str = "Unknown Service") -> dict:
    """Compare enterprise TOS against user-flagged issues."""
    user_data = get_user_flagged_issues()

    # Aggregate user issues for the prompt
    all_red_flags = []
    all_cautions = []
    all_positives = []
    total_reports = len(user_data)

    for analysis in user_data:
        all_red_flags.extend(analysis.get("redFlags", []))
        all_cautions.extend(analysis.get("cautions", []))
        all_positives.extend(analysis.get("positives", []))

    # Build issue frequency summary
    red_flag_summary = {}
    for flag in all_red_flags:
        red_flag_summary[flag] = red_flag_summary.get(flag, 0) + 1

    caution_summary = {}
    for caution in all_cautions:
        caution_summary[caution] = caution_summary.get(caution, 0) + 1

    prompt = f"""You are analyzing an enterprise's Terms of Service to identify issues that users commonly complain about.

Enterprise Service Name: {service_name}

Enterprise Terms of Service:
{tos_text}

User Community Data (from {total_reports} user-submitted TOS analyses):

Common Red Flags users have reported (with frequency):
{json.dumps(red_flag_summary, indent=2) if red_flag_summary else "No data yet"}

Common Cautions users have reported (with frequency):
{json.dumps(caution_summary, indent=2) if caution_summary else "No data yet"}

Positive clauses users appreciate:
{json.dumps(list(set(all_positives))[:10], indent=2) if all_positives else "No data yet"}

TASK:
1. Analyze the enterprise TOS and identify clauses that match or are similar to issues users have flagged
2. Provide a risk score (0-100) based on how many user-complained issues appear in this TOS
3. For each matched issue, estimate how many users would likely flag it based on the community data
4. Provide specific recommendations to fix problematic clauses
5. Highlight any positive aspects that match what users appreciate

Be specific about which clauses in the enterprise TOS match user complaints."""

    start_time = time.time()
    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ENTERPRISE_COMPARISON_SCHEMA,
            temperature=0
        )
    )
    latency_ms = (time.time() - start_time) * 1000

    result = json.loads(response.text)
    result["geminiLatencyMs"] = latency_ms
    result["totalUserAnalyses"] = total_reports
    if "riskScore" in result:
        result["riskScore"] = round(result["riskScore"] / 10) * 10

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
        model="gemini-2.5-pro",
        contents=data["prompt"],
        config=types.GenerateContentConfig(temperature=0)
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
        analysis_result = analyze_tos(data["tos_text"], service_name)
        submission_result = process_submission(data["tos_text"])
        return jsonify({"analysis": analysis_result, "submission": submission_result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/process-submission", methods=["POST"])
def process_submission_endpoint():
    data = request.get_json()
    if not data or "tos_text" not in data:
        return jsonify({"error": "Missing 'tos_text' in request body"}), 400

    source = data.get("source", "paste")
    tos_url = data.get("tos_url")

    try:
        result = process_submission(data["tos_text"], source, tos_url)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/enterprise-compare", methods=["POST"])
def enterprise_compare_endpoint():
    """Compare an enterprise TOS against user-reported issues from the community."""
    data = request.get_json()
    if not data or "tos_text" not in data:
        return jsonify({"error": "Missing 'tos_text' in request body"}), 400

    service_name = data.get("service_name", "Unknown Service")

    try:
        result = compare_enterprise_tos(data["tos_text"], service_name)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6767, debug=True)