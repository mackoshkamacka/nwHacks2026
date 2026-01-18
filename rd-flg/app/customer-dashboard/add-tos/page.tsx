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

const mockAnalysis: Analysis = {
  service: "Untitled Service",
  riskScore: 76,
  summary:
    "Gemini detects broad AI-training permissions, unrestricted data resale, and a forced arbitration clause that removes your right to sue.",
  snapshot: "Auto-run 4s ago",
  redFlags: [
    "Company may use your photos, voice, and likeness to train AI models without compensation",
    "Terms can change at any moment with only an in-app banner as notice",
    "Data shared with 'trusted partners' (1,000+ trackers) without an opt-out",
  ],
  cautions: [
    "Arbitration is mandatory and bans class actions",
    "Deletes still keep backups indefinitely",
    "Location pinged every 5 minutes, even when app closed",
  ],
  positives: [
    "GDPR export supported",
    "Kids mode limits personalized ads",
  ],
  clauseCount: 47,
  violations: [
    { count: 12483, label: "Sold data despite opt-out" },
    { count: 8932, label: "Account deletion rejected" },
    { count: 4110, label: "Unwanted AI training" },
  ],
};

const severityBadge = {
  high: "text-rose-200 border border-rose-400/40 bg-rose-950/40",
  medium: "text-amber-200 border border-amber-300/40 bg-amber-950/40",
  low: "text-emerald-200 border border-emerald-300/40 bg-emerald-950/40",
};

export default function AddTosPage() {
  const [tosText, setTosText] = useState("");
  const [tosUrl, setTosUrl] = useState("");
  const [analysis, setAnalysis] = useState<Analysis>(mockAnalysis);
  const [loading, setLoading] = useState(false);

  const derivedServiceName = useMemo(() => {
    if (analysis.service !== "Untitled Service") return analysis.service;
    if (tosUrl) {
      const host = extractHost(tosUrl);
      if (host) return host.split(".")[0]?.toUpperCase() || mockAnalysis.service;
    }
    return mockAnalysis.service;
  }, [analysis.service, tosUrl]);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      const textSignal = tosText.trim().length;
      const scoreDelta = Math.min(15, Math.floor(textSignal / 800));
      const score = Math.min(95, Math.max(30, mockAnalysis.riskScore + scoreDelta));
      setAnalysis({
        ...mockAnalysis,
        service: tosUrl ? extractHost(tosUrl) || mockAnalysis.service : mockAnalysis.service,
        riskScore: score,
        snapshot: `Parsed ${new Date().toLocaleTimeString()}`,
      });
      setLoading(false);
    }, 900);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-4">
          <Link href="/consumer" className="text-xs uppercase tracking-[0.4em] text-slate-300 underline">← back</Link>
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
                <label className="mb-2 block text-sm text-slate-300">Public URL (optional)</label>
                <input
                  value={tosUrl}
                  onChange={(event) => setTosUrl(event.target.value)}
                  placeholder="https://example.com/terms"
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
                  rows={10}
                  className="w-full rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <button
                onClick={handleAnalyze}
                className="flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                {loading ? "Parsing with Gemini..." : "Run Gemini parse"}
              </button>
              <p className="text-xs text-slate-500">
                Storage note: raw ToS text is encrypted at rest. Only derived analytics are shared with the community intelligence layer.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Gemini output</p>
                <h2 className="text-2xl font-semibold text-white">{derivedServiceName}</h2>
                <p className="text-xs text-slate-400">{analysis.snapshot}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">{analysis.riskScore}/100</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-200">{analysis.summary}</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400">Community violations</p>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                {analysis.violations.map((violation) => (
                  <div key={violation.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2">
                    <span>{violation.label}</span>
                    <span className="font-semibold text-white">{violation.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Urgent Concern</p>
              </div>
              <span className={`${severityBadge.high} rounded-full px-3 py-1 text-xs uppercase tracking-wide`}>rd-flgs</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-200">
              {analysis.redFlags.map((flag) => (
                <li key={flag} className="rounded-2xl border border-rose-400/20 bg-rose-950/30 p-4">{flag}</li>
              ))}
            </ul>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Moderate concerns</p>
                  <span className={`${severityBadge.medium} rounded-full px-2 py-1 text-[11px] uppercase tracking-wide`}>Watch</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-200">
                  {analysis.cautions.map((item) => (
                    <li key={item} className="rounded-xl border border-amber-300/20 bg-amber-950/20 p-3">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Positive clauses</p>
                  <span className={`${severityBadge.low} rounded-full px-2 py-1 text-[11px] uppercase tracking-wide`}>Good</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-200">
                  {analysis.positives.map((item) => (
                    <li key={item} className="rounded-xl border border-emerald-300/20 bg-emerald-950/20 p-3">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
