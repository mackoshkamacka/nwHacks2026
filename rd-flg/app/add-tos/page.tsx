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

export default function AddTos() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [source, setSource] = useState<'paste' | 'url'>('paste');
  const [serviceName, setServiceName] = useState('');
  const [tosText, setTosText] = useState('');
  const [tosUrl, setTosUrl] = useState('');
  const [error, setError] = useState('');
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
      router.push('/customer-dashboard');
      
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
      </main>
    </div>
  );
}