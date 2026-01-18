'use client'

import { useState } from 'react';
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { ShieldAlert, Activity, Search, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { analyzeTosAction } from '../actions'; // We'll create this next

const headingFont = Space_Grotesk({ subsets: ["latin"], weight: ["700"], variable: "--font-heading" });
const bodyFont = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export default function AnalyzePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    
    // 1. Get data from form
    const tos = formData.get('tosText') as string;
    const name = formData.get('serviceName') as string;
  
    try {
      // 2. Call the server function directly! 
      // No URLs, no CORS, no JSON stringifying needed.
      const data = await analyzeTosAction(tos, name);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} min-h-screen bg-[#060505] text-slate-50 p-6`}>
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(225,29,72,0.15),_transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Secure Session Active
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Input Panel */}
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">New Analysis</h2>
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Provider Identity</label>
                <input 
                  name="serviceName" 
                  placeholder="e.g. OpenAI, Meta, TikTok" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Contract Verbatim</label>
                <textarea 
                  name="tosText" 
                  placeholder="Paste Terms of Service text here..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-64 focus:outline-none focus:border-rose-500 transition-colors resize-none text-sm leading-relaxed"
                />
              </div>
              <button 
                disabled={loading}
                className="w-full group relative overflow-hidden rounded-xl bg-rose-600 py-4 font-black uppercase tracking-widest text-white transition-all hover:bg-rose-500 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Activity size={16} className="animate-spin" /> Deconstructing...
                  </span>
                ) : 'Execute Audit'}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
             {!result && !loading && (
               <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600 p-12 text-center">
                 <Search size={48} className="mb-4 opacity-20" />
                 <p className="text-sm uppercase tracking-widest font-bold">Awaiting Data Input</p>
                 <p className="text-xs mt-2">Initialize defense protocol to begin analysis</p>
               </div>
             )}

             {result && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 {/* Risk Header */}
                 <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-[var(--font-heading)] text-3xl font-bold">{result.service}</h3>
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase text-slate-500">Risk Factor</div>
                        <div className={`text-4xl font-bold ${result.riskScore > 70 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {result.riskScore}%
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-6">{result.summary}</p>
                 </div>

                 {/* Red Flags Card */}
                 <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-rose-500 mb-4">
                        <AlertTriangle size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Red Flags</span>
                      </div>
                      <ul className="space-y-2">
                        {result.redFlags.map((flag: string, i: number) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed">• {flag}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-emerald-500 mb-4">
                        <CheckCircle size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Positives</span>
                      </div>
                      <ul className="space-y-2">
                        {result.positives.map((pos: string, i: number) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed">• {pos}</li>
                        ))}
                      </ul>
                    </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}