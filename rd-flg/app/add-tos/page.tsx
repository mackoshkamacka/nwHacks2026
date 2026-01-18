'use client';

import { useState, useEffect } from "react";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { 
    ShieldAlert, 
    ArrowLeft, 
    FileText, 
    Link as LinkIcon, 
    Send, 
    Activity, 
    AlertTriangle // <--- Add this!
  } from 'lucide-react';

// Import the server action you created
import { analyzeTosAction } from '../actions'; 

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

type AnalysisResult = {
  service?: string;
  riskScore: number;
  summary: string;
  clauseCount?: number;
  redFlags?: string[];
  cautions?: string[];
  positives?: string[];
  violations?: Array<{ label: string; count: number }>;
};

export default function AddTos() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [source, setSource] = useState<'paste' | 'url'>('paste');
  const [serviceName, setServiceName] = useState('');
  const [tosText, setTosText] = useState('');
  const [tosUrl, setTosUrl] = useState('');
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    return () => {
      if (voiceUrl) {
        URL.revokeObjectURL(voiceUrl);
      }
    };
  }, [voiceUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (source === 'url') {
        throw new Error('URL fetching is not yet supported. Please paste the ToS text directly.');
      }

      // 1. EXECUTE THE SERVER ACTION (REPLACES FETCH)
      const analysisResult = await analyzeTosAction(tosText, serviceName);

      // 2. SAVE TO FIRESTORE
      // Using the structure returned by Gemini based on your SCHEMA
      await addDoc(collection(db, 'tos_analyses'), {
        userId: user?.uid,
        service: serviceName,
        riskScore: analysisResult.riskScore,
        summary: analysisResult.summary,
        clauseCount: analysisResult.clauseCount,
        redFlags: analysisResult.redFlags || [],
        cautions: analysisResult.cautions || [],
        positives: analysisResult.positives || [],
        violations: analysisResult.violations || [],
        snapshot: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      console.log('Audit complete and saved to records.');
      setAnalysisResult(analysisResult);
      setVoiceError('');
      if (voiceUrl) {
        URL.revokeObjectURL(voiceUrl);
        setVoiceUrl(null);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during deconstruction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`${bodyFont.className} min-h-screen bg-[#060505] flex flex-col items-center justify-center text-white`}>
        <Activity className="h-12 w-12 text-rose-500 animate-spin mb-4" />
        <p className="tracking-[0.3em] uppercase text-[10px] text-rose-500 font-black">Initializing Scanner...</p>
      </div>
    );
  }

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-[#0a0505] text-slate-50 overflow-x-hidden`}>
      {/* Background Aesthetic */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(225,29,72,0.12),_transparent_50%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
        {/* Navigation */}
        <Link
          href="/customer-dashboard"
          className="group flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors w-fit"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return to Console</span>
        </Link>

        {/* Protocol Header */}
        <header className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-6 rounded bg-rose-600 flex items-center justify-center shadow-[0_0_10px_rgba(225,29,72,0.4)]">
                <ShieldAlert size={14} className="text-white" />
            </div>
            <p className="text-[10px] tracking-[0.4em] text-rose-500 uppercase font-black">Analysis Protocol v2.0</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white lg:text-6xl mb-4 font-[var(--font-heading)]">
            Audit Agreement
          </h1>
          <p className="max-w-xl text-sm text-slate-400 leading-relaxed">
            Submit Terms of Service for automated deconstruction. RD-FLG will identify predatory clauses and generate a risk assessment.
          </p>
        </header>

        {/* Main Interface */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl space-y-8">
          
          <div className="grid gap-6 md:grid-cols-2">
              {/* Service Identity */}
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-black tracking-widest mb-3">
                  Service Identity
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Netflix, Spotify"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-rose-500/50 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Input Toggle */}
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-black tracking-widest mb-3">
                  Data Stream
                </label>
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setSource('paste')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition ${
                      source === 'paste' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <FileText size={12} /> Paste
                  </button>
                  <button
                    type="button"
                    onClick={() => setSource('url')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition ${
                      source === 'url' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <LinkIcon size={12} /> URL
                  </button>
                </div>
              </div>
          </div>

          {/* Dynamic Input Area */}
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {source === 'paste' ? (
              <div className="space-y-3">
                <label className="block text-[10px] uppercase text-slate-500 font-black tracking-widest">
                  Verbatim Text
                </label>
                <textarea
                  value={tosText}
                  onChange={(e) => setTosText(e.target.value)}
                  placeholder="Paste legal text here..."
                  rows={10}
                  className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-4 text-white focus:border-rose-500/50 focus:outline-none transition resize-none font-mono text-xs leading-relaxed"
                  required
                />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-[10px] uppercase text-slate-500 font-black tracking-widest">
                  Remote URL
                </label>
                <input
                  type="url"
                  value={tosUrl}
                  onChange={(e) => setTosUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-4 text-white focus:border-rose-500/50 focus:outline-none transition"
                  required
                />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-rose-400 text-xs font-bold uppercase tracking-wider animate-shake">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full overflow-hidden rounded-xl bg-rose-600 px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white transition hover:bg-rose-500 disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Activity size={16} className="animate-spin" /> 
                  Analyzing Data Stream...
                </>
              ) : (
                <>
                  <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                  Execute Audit
                </>
              )}
            </div>
          </button>
        </form>

        {analysisResult && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl space-y-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.4em] text-rose-500">Gemini Analysis Ready</p>
              <h2 className="text-3xl font-bold text-white">{analysisResult.service || serviceName}</h2>
              <p className="text-slate-300 text-sm">Risk score: <span className="text-white font-semibold">{analysisResult.riskScore}</span>/100 • Clauses parsed: {analysisResult.clauseCount || '—'}</p>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{analysisResult.summary}</p>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={async () => {
                  if (!analysisResult) return;
                  try {
                    setVoiceLoading(true);
                    setVoiceError('');
                    const response = await fetch('/api/voice-summary', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        text: `The risk score is ${analysisResult.riskScore} out of 100 after analysing ${analysisResult.clauseCount} clauses. The highest concerns includes these as follows: ${analysisResult.redFlags?.[0] || 'No major red flags detected.'} To summarize, ${analysisResult.summary}`,
                      }),
                    });

                    if (!response.ok) {
                      const data = await response.json().catch(() => ({}));
                      throw new Error(data.error || 'Voice synthesis failed');
                    }

                    const blob = await response.blob();
                    if (voiceUrl) URL.revokeObjectURL(voiceUrl);
                    const url = URL.createObjectURL(blob);
                    setVoiceUrl(url);
                  } catch (err) {
                    setVoiceError(err instanceof Error ? err.message : 'Unable to generate voice summary');
                  } finally {
                    setVoiceLoading(false);
                  }
                }}
                className="rounded-xl bg-gradient-to-r from-rose-500 to-blue-500 px-6 py-3 text-xs font-black uppercase tracking-[0.3em] text-white shadow-[0_0_20px_rgba(225,29,72,0.25)] transition hover:scale-105 disabled:opacity-50"
                disabled={voiceLoading}
              >
                {voiceLoading ? 'Synthesizing...' : 'Voice Description'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/customer-dashboard')}
                className="rounded-xl border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.3em] text-white/80 hover:text-white transition"
              >
                Return to dashboard
              </button>
            </div>

            {voiceError && (
              <p className="text-xs uppercase tracking-widest text-rose-400">{voiceError}</p>
            )}

            {voiceUrl && (
              <div className="mt-4">
                <audio controls src={voiceUrl} className="w-full" />
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}