"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  Radio, 
  BarChart3, 
  Target, 
  TrendingDown, 
  Activity 
} from 'lucide-react';

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

// --- Intelligence Ticker (Blue Version) ---
const IntelligenceTicker = () => {
  const news = [
    { agency: "SEC", impact: "HIGH", msg: "New disclosure requirements for AI training data sets effective Q1." },
    { agency: "GDPR", impact: "CRITICAL", msg: "Major social platform fined €1.2B for dark pattern consent flows." },
    { agency: "MARKET", impact: "MODERATE", msg: "User trust in 'Terms of Service' hits all-time low—transparency is now a competitive edge." },
    { agency: "LEGAL", impact: "INFO", msg: "Open-source 'Right to Opt-Out' clauses becoming industry standard." }
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-[#060505]/90 border-b border-cyan-500/10 py-2.5 backdrop-blur-md overflow-hidden flex items-center">
      <div className="flex items-center gap-2 px-6 border-r border-cyan-500/30 bg-[#060505] z-30 relative">
        <Radio className="text-cyan-500 animate-pulse" size={14} />
        <span className="text-[10px] font-black uppercase tracking-tighter text-cyan-500 whitespace-nowrap">B2B Intel Stream</span>
      </div>
      <div className="relative flex overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex animate-marquee whitespace-nowrap min-w-full">
          {[...news, ...news].map((item, i) => (
            <div key={i} className="flex items-center gap-4 mx-8">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                [{item.agency}]
              </span>
              <span className="text-xs text-slate-300 font-medium italic">{item.msg}</span>
              <span className={`text-[9px] font-bold ${item.impact === 'CRITICAL' ? 'text-cyan-500' : 'text-blue-400'}`}>
                • {item.impact} IMPACT
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function BusinessLanding() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUserEmail(currentUser.email);
    });
    return () => unsubscribe();
  }, [router]);

  if (!mounted) return <div className="min-h-screen bg-[#060505]" />;

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-[#060505] text-slate-50 overflow-x-hidden`}>
      
      {/* Dynamic Background Glows */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-glow { animation: pulse-glow 8s ease-in-out infinite; }
        .animate-marquee { display: flex; animation: marquee 40s linear infinite; }
      `}} />

      <div className="animate-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(6,182,212,0.15),_transparent_60%)]" />
      <div className="animate-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(37,99,235,0.15),_transparent_60%)]" style={{ animationDelay: '-4s' }} />
      
      <IntelligenceTicker />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        
        {/* Hero Header Section */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <BarChart3 className="text-cyan-500 w-32 h-32 rotate-12" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-cyan-500 w-5 h-5" />
            <p className="text-[10px] tracking-[0.4em] text-cyan-500 uppercase font-bold">Enterprise Intelligence Dashboard</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl mb-4 font-[var(--font-heading)]">Violation Intelligence</h1>
          <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
            <p>Org: <span className="text-cyan-200/80 font-mono underline decoration-cyan-500/40">{userEmail}</span></p>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <p className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500"/> Trust Verified</p>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Violations", val: "0", color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
            { label: "Global Trust Score", val: "68", color: "text-cyan-500", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
            { label: "Community Reports", val: "1.2k", color: "text-blue-500", border: "border-blue-500/20", bg: "bg-blue-500/10" },
            { label: "Risk Mitigation", val: "94%", color: "text-indigo-500", border: "border-indigo-500/20", bg: "bg-indigo-500/10" },
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl border ${stat.border} ${stat.bg} p-6 backdrop-blur-sm`}>
              <p className="text-[10px] uppercase text-slate-400 mb-1 font-bold tracking-widest">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Competitive Intelligence Section */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-[var(--font-heading)] text-2xl font-bold text-white flex items-center gap-2">
                Market Positioning
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Real-time competitive benchmark</p>
            </div>
            <Link href="/business-dashboard/add-tos-business" className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 transition shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2">
              <Zap size={16} /> Run Compliance Audit
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { label: "Privacy score", you: "47/100", compA: "73", compB: "41", avg: "62" },
              { label: "User trust (Reports)", you: "12,483", compA: "892", compB: "15k", avg: "4.1k" },
              { label: "Revenue at risk", you: "$47M", compA: "$12M", compB: "$51M", avg: "$18M" },
            ].map((metric, idx) => (
              <div key={idx} className="group rounded-2xl border border-white/5 bg-[#0a0f1a]/80 p-6 hover:border-cyan-500/40 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <Target className="text-cyan-500" size={12} />
                       <p className="text-[10px] uppercase text-cyan-400 font-bold tracking-tighter">{metric.label}</p>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight">Market Comparison</h3>
                  </div>

                  {/* Benchmark HUD */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-[2]">
                    {[
                      { l: "YOU", v: metric.you, c: "text-cyan-400" },
                      { l: "COMP A", v: metric.compA, c: "text-slate-300" },
                      { l: "COMP B", v: metric.compB, c: "text-slate-300" },
                      { l: "AVG", v: metric.avg, c: "text-blue-500" },
                    ].map((cell, i) => (
                      <div key={i}>
                        <p className="text-[9px] font-black text-slate-600 mb-1">{cell.l}</p>
                        <p className={`text-lg font-bold font-mono ${cell.c}`}>{cell.v}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="hidden md:block">
                     <TrendingDown className="text-rose-500/50" size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Impact CTA */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Sentiment Card */}
          <div className="rounded-3xl border border-white/5 bg-white/5 p-8 flex flex-col justify-between hover:border-cyan-500/20 transition-all group">
            <div>
              <h4 className="text-xl font-bold mb-2 font-[var(--font-heading)] text-white">Community Sentiment</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your current legal draft contains clauses that trigger "High Stress" warnings in 80% of your user base.
              </p>
            </div>
            <button className="mt-6 text-sm font-bold text-cyan-400 flex items-center gap-2 hover:text-cyan-300 transition-colors">
              View sentiment heatmap <Zap size={14} className="group-hover:animate-pulse" />
            </button>
          </div>
          
          {/* NEW: Clean Version with no icon */}
          <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900 via-sky-950 to-indigo-950 p-8 flex flex-col justify-between overflow-hidden">

  <div className="relative z-10">
    <div className="flex items-center gap-2 mb-3">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300/80">
        Active Protection
      </span>
    </div>

    <h4 className="text-xl font-bold mb-2 font-[var(--font-heading)] text-white">
      Global Sentry Guard
    </h4>

    <p className="text-sm text-slate-300 leading-relaxed max-w-[300px]">
      Ensure your platform remains compliant with shifting global standards and avoids mass community reports.
    </p>
  </div>

  <Link
  href="/business-dashboard/add-tos-business"
  className="
    relative z-10 mt-8 w-full py-4
    bg-blue-600 text-white
    text-center text-xs font-black uppercase tracking-widest
    rounded-xl
    hover:bg-blue-500
    transition-all
    shadow-[0_0_0_1px_rgba(59,130,246,0.4),_0_0_25px_rgba(59,130,246,0.45)]
    active:scale-[0.98]
  "
>
  Analyze New Policy Draft
</Link>
</div>

        </section>
      </main>
    </div>
  );
}