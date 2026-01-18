'use client';

import { useState, useEffect } from "react";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Zap, AlertTriangle, ShieldAlert, ShieldCheck, CheckCircle, ChevronDown, ChevronUp, Radio, Globe } from 'lucide-react';

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

// Helper functions for the Violation Log
const riskTrack = (score: number) => {
  if (score >= 75) return "bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]";
  if (score >= 50) return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
  return "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]";
};

const riskLabel = (score: number) => {
  if (score >= 75) return "Critical Violation";
  if (score >= 50) return "Caution Advised";
  return "Clearance: Secure";
};

// --- Optimized Ticker Component ---
const ThreatTicker = () => {
  const news = [
    { agency: "REUTERS", impact: "HIGH", msg: "META face massive fine over biometric data usage without explicit consent." },
    { agency: "AP", impact: "CRITICAL", msg: "AMAZON updated 'Mandatory Arbitration' clause—restricting user class-action rights." },
    { agency: "TECHCRUNCH", impact: "MODERATE", msg: "INSTAGRAM privacy policy shift: New 'Content Scraping' permissions detected." },
    { agency: "BBC", impact: "INFO", msg: "Global GDPR audit reveals 40% of apps fail 'Right to be Forgotten' standards." }
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-[#060505]/90 border-b border-rose-500/10 py-2.5 backdrop-blur-md overflow-hidden flex items-center">
      {/* Label - Fixed Position */}
      <div className="flex items-center gap-2 px-6 border-r border-rose-500/30 bg-[#060505] z-30 relative">
        <Radio className="text-rose-500 animate-pulse" size={14} />
        <span className="text-[10px] font-black uppercase tracking-tighter text-rose-500 whitespace-nowrap">Live Intel Feed</span>
      </div>
      
      {/* Scrolling Container with Masking */}
      <div className="relative flex overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex animate-marquee whitespace-nowrap min-w-full">
          {/* Render twice for a seamless loop */}
          {[...news, ...news].map((item, i) => (
            <div key={i} className="flex items-center gap-4 mx-8">
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                [{item.agency}]
              </span>
              <span className="text-xs text-slate-300 font-medium italic">
                {item.msg}
              </span>
              <span className={`text-[9px] font-bold ${item.impact === 'CRITICAL' ? 'text-rose-500' : 'text-orange-400'}`}>
                • {item.impact} IMPACT
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tosHistory, setTosHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const router = useRouter();

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        if (userData?.role === 'business') {
          router.push('/business-dashboard');
          return;
        }
        setUser(currentUser);
        const q = query(collection(db, "tos_analyses"), where("userId", "==", currentUser.uid), orderBy("snapshot", "desc"));
        const unsubscribeDocs = onSnapshot(q, (snapshot) => {
          const liveData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              service: data.service || "Unknown Service",
              category: "Red Flag Audit",
              acceptedOn: data.snapshot?.toDate().toLocaleDateString() || "Recently",
              riskScore: data.riskScore || 0,
              flags: data.redFlags?.length || 0,
              reports: `${data.clauseCount || 0} clauses analyzed`,
              summary: data.summary || "No summary available",
              redFlags: data.redFlags || [],
              cautions: data.cautions || [],
              positives: data.positives || [],
            };
          });
          setTosHistory(liveData);
          setLoading(false);
        });
        return () => unsubscribeDocs();
      } catch (error) {
        router.push('/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  if (loading) {
    return (
      <div className={`${bodyFont.className} min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white`}>
        <div className="h-12 w-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin mb-4" />
        <p className="tracking-widest uppercase text-xs text-rose-500 font-bold">Scanning Ledger...</p>
      </div>
    );
  }

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-[#060505] text-slate-50 overflow-x-hidden`}>
      
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
        .animate-marquee { 
          display: flex;
          animation: marquee 40s linear infinite; 
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="animate-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(225,29,72,0.3),_transparent_60%)]" />
      <div className="animate-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(37,99,235,0.3),_transparent_60%)]" style={{ animationDelay: '-4s' }} />
      
      <ThreatTicker />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <section className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Globe className="text-rose-500 w-32 h-32 rotate-12" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-rose-500 w-5 h-5" />
            <p className="text-[10px] tracking-[0.4em] text-rose-500 uppercase font-bold">Active Sentry Mode</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl mb-4 font-[var(--font-heading)]">Command Center</h1>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <p>Monitoring: <span className="text-rose-200/80 font-mono underline decoration-rose-500/40">{user?.email}</span></p>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <p className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500"/> System Secure</p>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <p className="text-[10px] uppercase text-slate-500 mb-1 font-bold tracking-widest">Audited Assets</p>
            <p className="text-3xl font-bold text-white">{tosHistory.length}</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 backdrop-blur-sm">
            <p className="text-[10px] uppercase text-rose-400/60 mb-1 font-bold tracking-widest">Red Flags</p>
            <p className="text-3xl font-bold text-rose-500">{tosHistory.reduce((acc, curr) => acc + curr.flags, 0)}</p>
          </div>
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6 backdrop-blur-sm">
            <p className="text-[10px] uppercase text-orange-400/60 mb-1 font-bold tracking-widest">Cautions</p>
            <p className="text-3xl font-bold text-orange-500">{tosHistory.reduce((acc, curr) => acc + curr.cautions.length, 0)}</p>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-6 backdrop-blur-sm">
            <p className="text-[10px] uppercase text-sky-400/60 mb-1 font-bold tracking-widest">Positives</p>
            <p className="text-3xl font-bold text-sky-500">{tosHistory.reduce((acc, curr) => acc + curr.positives.length, 0)}</p>
          </div>
        </div>

        {/* Violation Log Section */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-[var(--font-heading)] text-2xl font-bold text-white flex items-center gap-2">Violation Log</h2>
            <Link href="/add-tos" className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-500 transition shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center gap-2">
              <Zap size={16} /> New Scan
            </Link>
          </div>

          <div className="space-y-4">
            {tosHistory.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-rose-500/20 rounded-3xl bg-rose-500/5">
                <AlertTriangle className="mx-auto text-rose-500/40 mb-4 w-12 h-12" />
                <p className="text-slate-500 font-medium">System idle. No violations anchored to ledger.</p>
              </div>
            ) : (
              tosHistory.map((entry) => (
                <div key={entry.id} className="group rounded-2xl border border-white/5 bg-[#140c0c]/80 p-6 hover:border-rose-500/40 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <div className={`w-2 h-2 rounded-full animate-pulse ${entry.riskScore > 70 ? 'bg-rose-500' : entry.riskScore > 40 ? 'bg-amber-500' : 'bg-sky-500'}`} />
                         <p className="text-[10px] uppercase text-rose-400 font-bold tracking-tighter">{entry.category}</p>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors tracking-tight">{entry.service}</h3>
                      <p className="text-xs text-slate-500 uppercase font-mono mt-1">Ref: {entry.id.slice(0,12)} • {entry.acceptedOn}</p>
                    </div>

                    <div className="w-full md:w-64">
                      <div className="flex justify-between text-[10px] uppercase font-black mb-2">
                        <span className={entry.riskScore > 70 ? "text-rose-500" : entry.riskScore > 40 ? "text-amber-500" : "text-sky-500"}>
                          {riskLabel(entry.riskScore)}
                        </span>
                        <span className="text-slate-400">{entry.riskScore}% Risk</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`${riskTrack(entry.riskScore)} h-full transition-all duration-1000 ease-out`}
                          style={{ width: `${entry.riskScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-lg font-black ${entry.flags > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{entry.flags} Flags</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest italic">{entry.reports}</p>
                      </div>
                      <button onClick={() => toggleCard(entry.id)} className="p-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all">
                        {expandedCards.has(entry.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {expandedCards.has(entry.id) && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-2">Summary</p>
                        <p className="text-sm text-slate-300">{entry.summary}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <p className="text-2xl font-bold text-rose-500">{entry.redFlags.length}</p>
                          <p className="text-[10px] uppercase text-rose-400/60 font-bold">Red Flags</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          <p className="text-2xl font-bold text-orange-500">{entry.cautions.length}</p>
                          <p className="text-[10px] uppercase text-orange-400/60 font-bold">Cautions</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                          <p className="text-2xl font-bold text-sky-500">{entry.positives.length}</p>
                          <p className="text-[10px] uppercase text-sky-400/60 font-bold">Positives</p>
                        </div>
                      </div>

                      {entry.positives.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase text-sky-500 font-bold tracking-widest mb-2 flex items-center gap-2">
                            <CheckCircle size={12} /> Positives
                          </p>
                          <ul className="space-y-2">
                            {entry.positives.map((positive: string, i: number) => (
                              <li key={i} className="text-sm text-slate-300 pl-4 border-l-2 border-sky-500/50">{positive}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Link href={`/analysis/${entry.id}`} className="inline-flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors">
                        <Zap size={14} /> View Full Analysis
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}