'use client';

import { useState, useEffect } from "react";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, FileText, Link as LinkIcon, Send } from 'lucide-react';

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://iamcorbin.com/api';

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
      const textToAnalyze = source === 'paste' ? tosText : '';

      if (source === 'url') {
        setError('URL fetching is not yet supported. Please paste the ToS text directly.');
        setSubmitting(false);
        return;
      }

      const response = await fetch(`${API_URL}/analyze-tos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tos_text: textToAnalyze,
          service_name: serviceName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze ToS');
      }

      console.log('=== ANALYSIS RESULT ===');
      console.log(JSON.stringify(data, null, 2));
      console.log('=======================');

      // Save to Firestore
      const analysisData = data.analysis || data;
      await addDoc(collection(db, 'tos_analyses'), {
        userId: user?.uid,
        service: serviceName,
        riskScore: analysisData.riskScore,
        summary: analysisData.summary,
        clauseCount: analysisData.clauseCount,
        redFlags: analysisData.redFlags || [],
        cautions: analysisData.cautions || [],
        positives: analysisData.positives || [],
        violations: analysisData.violations || [],
        snapshot: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      console.log('Saved to Firestore!');
      router.push('/customer-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`${bodyFont.className} min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white`}>
        <div className="h-12 w-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin mb-4" />
        <p className="tracking-widest uppercase text-xs text-rose-500 font-bold">Initializing Scanner...</p>
      </div>
    );
  }

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-[#0a0505] text-slate-50`}>
      {/* Background Glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(225,29,72,0.15),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.05),_transparent_40%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
        {/* Back Button */}
        <Link
          href="/customer-dashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Back to Command Center</span>
        </Link>

        {/* Header */}
        <section className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-rose-500 w-5 h-5" />
            <p className="text-[10px] tracking-[0.4em] text-rose-500 uppercase font-bold">New Scan Protocol</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl mb-4 font-[var(--font-heading)]">
            Submit Terms of Service
          </h1>
          <p className="text-slate-400">
            Upload a Terms of Service document for automated violation detection and risk assessment.
          </p>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl space-y-6">
          {/* Service Name */}
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold tracking-widest mb-2">
              Service Name
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g., Netflix, Spotify, Discord"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition"
              required
            />
          </div>

          {/* Source Toggle */}
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold tracking-widest mb-2">
              Input Method
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSource('paste')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  source === 'paste'
                    ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <FileText size={16} />
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setSource('url')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  source === 'url'
                    ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <LinkIcon size={16} />
                URL
              </button>
            </div>
          </div>

          {/* Paste Text Input */}
          {source === 'paste' && (
            <div>
              <label className="block text-xs uppercase text-slate-500 font-bold tracking-widest mb-2">
                Terms of Service Text
              </label>
              <textarea
                value={tosText}
                onChange={(e) => setTosText(e.target.value)}
                placeholder="Paste the full Terms of Service text here..."
                rows={12}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition resize-none font-mono text-sm"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                {tosText.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          )}

          {/* URL Input */}
          {source === 'url' && (
            <div>
              <label className="block text-xs uppercase text-slate-500 font-bold tracking-widest mb-2">
                Terms of Service URL
              </label>
              <input
                type="url"
                value={tosUrl}
                onChange={(e) => setTosUrl(e.target.value)}
                placeholder="https://example.com/terms-of-service"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                We'll automatically fetch and analyze the content from this URL.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-4 text-sm font-bold text-white hover:bg-rose-500 transition shadow-[0_0_20px_rgba(225,29,72,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Send size={16} />
                Initiate Scan
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
