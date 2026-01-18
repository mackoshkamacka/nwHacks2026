"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

type Analysis = {
  service: string;
  riskScore: number;
  summary: string;
  snapshot: string;
  redFlags: string[];
  cautions: string[];
  positives: string[];
  clauseCount: number;
  violations: Array<{ count: number; label: string }>;
};

const extractHost = (value: string) => {
  try {
    return new URL(value).host.replace("www.", "");
  } catch {
    return "";
  }
};

const mockInitialData: Analysis = {
  service: "Ready to Analyze",
  riskScore: 0,
  summary: "Paste text and click 'Run Gemini Parse' to begin analysis.",
  snapshot: "Waiting for input...",
  redFlags: [],
  cautions: [],
  positives: [],
  clauseCount: 0,
  violations: [],
};

const severityBadge = {
  high: "text-rose-200 border border-rose-400/40 bg-rose-950/40",
  medium: "text-amber-200 border border-amber-300/40 bg-amber-950/40",
  low: "text-emerald-200 border border-emerald-300/40 bg-emerald-950/40",
};

export default function AddTosPage() {
  const [mounted, setMounted] = useState(false);
  const [tosText, setTosText] = useState("");
  const [tosUrl, setTosUrl] = useState("");
  const [analysis, setAnalysis] = useState<Analysis>(mockInitialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const derivedServiceName = useMemo(() => {
    if (analysis.service !== "Ready to Analyze") return analysis.service;
    if (tosUrl) {
      const host = extractHost(tosUrl);
      if (host) return host.split(".")[0]?.toUpperCase();
    }
    return "New Policy";
  }, [analysis.service, tosUrl]);

  const handleAnalyze = async () => {
    if (!tosText.trim()) {
      alert("Please paste some text first!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/analyze-tos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tos_text: tosText,
          service_name: derivedServiceName,
        }),
      });

      if (!response.ok)
        throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();

      // Merge with mockInitialData to ensure all arrays exist
      setAnalysis({
        ...mockInitialData,
        ...data,
        violations: data.violations || data.matchedIssues || [],
        snapshot: `Analyzed ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error("❌ [Parser] Sync Error:", error);
      alert("Analysis failed. Ensure your API route is returning valid JSON.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-4">
          <Link
            href="/business-dashboard"
            className="text-xs uppercase tracking-widest text-slate-300 underline"
          >
            ← back
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Paste or link a Terms of Service
          </h1>
          <p className="text-base text-slate-300">
            Gemini will extract clauses and score risks before you click "I
            agree."
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {/* Input Side */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Input
            </p>
            <div className="mt-4 space-y-6">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Public URL (optional)
                </label>
                <input
                  value={tosUrl}
                  onChange={(event) => setTosUrl(event.target.value)}
                  placeholder="https://example.com/terms"
                  className="w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm text-slate-300">
                    Paste full ToS text
                  </label>
                  <button
                    className="text-xs uppercase tracking-wide text-cyan-300 hover:text-cyan-100"
                    type="button"
                    onClick={() =>
                      setTosText(
                        "By using this app you grant us perpetual rights to train AI models on your content..."
                      )
                    }
                  >
                    Insert sample
                  </button>
                </div>
                <textarea
                  value={tosText}
                  onChange={(event) => setTosText(event.target.value)}
                  placeholder="Paste text here..."
                  rows={10}
                  className="w-full rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {loading ? "In progress..." : "Compare ToS with previous reports"}
              </button>
            </div>
          </div>

          {/* Results Side */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Gemini output
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {derivedServiceName}
                </h2>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {analysis.snapshot}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-cyan-400">
                  {analysis.riskScore}/100
                </p>
                <p className="text-xs uppercase text-slate-500">Risk Score</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {analysis.summary}
            </p>

            {/* Community violations */}
            {(analysis.violations?.length ?? 0) > 0 && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="mb-3 text-xs uppercase tracking-widest text-slate-400">
                  Community violations
                </p>
                <div className="space-y-2 text-sm text-slate-200">
                  {analysis.violations.map((violation, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2"
                    >
                      <span className="text-slate-300">{violation.label}</span>
                      <span className="text-cyan-300">
                        <span className="font-mono font-semibold">{violation.count?.toLocaleString() ?? 0}</span>
                        <span className="ml-1 text-xs text-slate-500">{violation.count === 1 ? "count" : "counts"}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Details Section */}
        {/* {analysis.riskScore > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Urgent Concerns (Red Flags)
                </p>
                <span
                  className={`${severityBadge.high} rounded-full px-3 py-1 text-xs uppercase tracking-widest`}
                >
                  rd-flgs
                </span>
              </div>
              <ul className="grid gap-3 md:grid-cols-2">
                {(analysis.redFlags ?? []).map((flag, idx) => (
                  <li
                    key={idx}
                    className="rounded-2xl border border-rose-400/20 bg-rose-950/30 p-4 text-sm text-rose-100"
                  >
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          </section> } 
        )}*/}
      </main>
    </div>
  );
}
