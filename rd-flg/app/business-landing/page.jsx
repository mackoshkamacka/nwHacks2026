'use client';

import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { Building2, ShieldCheck, Zap, BarChart3, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

// Ensure this is a DEFAULT export and a valid Function Component
export default function BusinessLanding() {
  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-[#050806] text-slate-50 overflow-hidden`}>
      
      {/* Emerald/Safety Glows for Business */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(16,185,129,0.1),_transparent_70%)]" />

      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center">
            <Building2 size={14} className="text-black" />
          </div>
          <span className="font-[var(--font-heading)] text-xl font-bold tracking-tight uppercase">RD-FLG <span className="text-emerald-500">Enterprise</span></span>
        </div>
        <Link href="/login" className="text-xs font-bold tracking-widest uppercase hover:text-emerald-400 transition">
          Partner Console
        </Link>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-32">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[10px] font-black tracking-[0.3em] text-emerald-500 uppercase">
              <ShieldCheck size={12} />
              Risk Mitigation Protocol
            </div>
            <h1 className="mb-6 font-[var(--font-heading)] text-5xl font-bold leading-[1.1] tracking-tighter lg:text-7xl">
              Sanitize your <br />
              <span className="text-emerald-500 italic">Legal Exposure.</span>
            </h1>
            <p className="mb-10 text-lg text-slate-400 leading-relaxed max-w-lg">
              RD-FLG Enterprise helps legal teams identify "Red Flag" language in draft agreements before they cause litigation or user backlash. 
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="rounded-xl bg-emerald-600 px-8 py-4 font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition-all flex items-center gap-2">
                Start Audit <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Zap, title: "Draft Sanitization", desc: "Instantly scan ToS drafts for predatory clauses." },
              { icon: BarChart3, title: "Litigation Benchmarking", desc: "Compare terms against 10k+ historical disputes." },
              { icon: ShieldCheck, title: "Compliance Pre-Check", desc: "Automated verification for GDPR & CCPA alignment." }
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-emerald-500/30 transition-all">
                <feature.icon className="mb-4 text-emerald-500" size={24} />
                <h3 className="text-lg font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}