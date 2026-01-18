"use client";

import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { useMemo, useState } from "react";
import Link from "next/link";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

type MatchedIssue = {
  issue: string;
  userReports: number;
  severity: "high" | "medium" | "low";
  recommendation: string;
};

type CommunityInsights = {
  totalUserReports: number;
  topComplaint: string;
  industryComparison: string;
};

type Analysis = {
  service: string;
  riskScore: number;
  summary: string;
  snapshot: string;
  redFlags: string[];
  cautions: string[];
  positives: string[];
  matchedIssues: MatchedIssue[];
  communityInsights: CommunityInsights;
  totalUserAnalyses: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6767';

const extractHost = (value: string) => {
  try {
    return new URL(value).host.replace("www.", "");
  } catch {
    return "";
  }
};

const initialAnalysis: Analysis = {
  service: "Untitled Service",
  riskScore: 0,
  summary: "Paste your Terms of Service and click analyze to compare against user-reported issues.",
  snapshot: "Awaiting input",
  redFlags: [],
  cautions: [],
  positives: [],
  matchedIssues: [],
  communityInsights: {
    totalUserReports: 0,
    topComplaint: "N/A",
    industryComparison: "N/A",
  },
  totalUserAnalyses: 0,
};

const severityBadge = {
  high: "text-rose-200 border border-rose-400/40 bg-rose-950/40",
  medium: "text-amber-200 border border-amber-300/40 bg-amber-950/40",
  low: "text-emerald-200 border border-emerald-300/40 bg-emerald-950/40",
};

export default function AddTosPage() {
  const [tosText, setTosText] = useState("");
  const [tosUrl, setTosUrl] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [analysis, setAnalysis] = useState<Analysis>(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const derivedServiceName = useMemo(() => {
    if (serviceName) return serviceName;
    if (analysis.service !== "Untitled Service") return analysis.service;
    if (tosUrl) {
      const host = extractHost(tosUrl);
      if (host) return host.split(".")[0]?.toUpperCase() || initialAnalysis.service;
    }
    return initialAnalysis.service;
  }, [analysis.service, tosUrl, serviceName]);

  const handleAnalyze = async () => {
    if (!tosText.trim()) {
      setError("Please paste your Terms of Service text");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/enterprise-compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tos_text: tosText,
          service_name: serviceName || derivedServiceName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze TOS");
      }

      setAnalysis({
        service: serviceName || derivedServiceName,
        riskScore: data.riskScore || 0,
        summary: data.summary || "",
        snapshot: `Analyzed ${new Date().toLocaleTimeString()}`,
        redFlags: data.redFlags || [],
        cautions: data.cautions || [],
        positives: data.positives || [],
        matchedIssues: data.matchedIssues || [],
        communityInsights: data.communityInsights || initialAnalysis.communityInsights,
        totalUserAnalyses: data.totalUserAnalyses || 0,
      });
      setHasAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-slate-950 text-slate-50`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-4">
          <Link href="/business-dashboard" className="text-xs uppercase tracking-[0.4em] text-slate-300 underline">← back</Link>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Paste or link a Terms of Service</h1>
          <p className="text-base text-slate-300">
            Drop the full text or a public URL. We hand it to Gemini for clause extraction, risk scoring, and flag detection before you click “I agree.”
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">Input</p>
            <div className="mt-4 space-y-6">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Service Name</label>
                <input
                  value={serviceName}
                  onChange={(event) => setServiceName(event.target.value)}
                  placeholder="Your Company Name"
                  className="w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm text-slate-300">Paste full ToS text</label>
                  <button
                    className="text-xs uppercase tracking-wide text-cyan-300"
                    type="button"
                    onClick={() =>
                      setTosText(
                        "By using this app you grant us perpetual rights to reuse, distribute, and train AI models on your content, even after account deletion..."
                      )
                    }
                  >
                    Insert sample
                  </button>
                </div>
                <textarea
                  value={tosText}
                  onChange={(event) => setTosText(event.target.value)}
                  placeholder="Paste 500-10,000 words for best results"
                  rows={14}
                  className="w-full rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              {error && (
                <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Analyzing with Gemini..." : "Compare Against User Data"}
              </button>
              <p className="text-xs text-slate-500">
                Your TOS will be compared against {analysis.totalUserAnalyses || "community"} user-submitted analyses to identify potential issues.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            {!hasAnalyzed ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Community Analysis</p>
                <p className="text-slate-400 text-sm">Paste your Terms of Service and click analyze to compare against user-reported issues.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Community Analysis</p>
                    <h2 className="text-2xl font-semibold text-white">{derivedServiceName}</h2>
                    <p className="text-xs text-slate-400">{analysis.snapshot}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white">{analysis.riskScore}/100</p>
                    <p className="text-xs text-slate-400">Risk Score</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-200">{analysis.summary}</p>

                {/* Matched Issues */}
                {analysis.matchedIssues.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-400">Issues Matched to User Complaints</p>
                    <p className="mt-2 text-[10px] text-slate-500 italic">
                      Disclaimer: This tool is not a substitute for legal advice. Please consult qualified legal counsel before making changes to your Terms of Service.
                    </p>
                    <div className="mt-3 space-y-3 text-sm text-slate-200">
                      {analysis.matchedIssues.map((issue, index) => (
                        <div key={index} className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex-1">{issue.issue}</span>
                            <span className={`${severityBadge[issue.severity]} rounded-full px-2 py-0.5 text-xs uppercase`}>
                              {issue.severity}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-slate-400">{issue.userReports.toLocaleString()} similar user reports</span>
                          </div>
                          <p className="mt-2 text-xs text-cyan-300">💡 {issue.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
