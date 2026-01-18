'use client';

import { useState, useEffect } from "react";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Zap, AlertTriangle, ShieldAlert, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

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

const riskTrack = (score: number) => {
  if (score >= 75) return "bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]";
  if (score >= 50) return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
  return "bg-amber-400";
};

const riskLabel = (score: number) => {
  if (score >= 75) return "Critical Violation";
  if (score >= 50) return "Caution Advised";
  return "Clearance Level 1";
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
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
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
        
        const q = query(
          collection(db, "tos_analyses"),
          where("userId", "==", currentUser.uid),
          orderBy("snapshot", "desc")
        );

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
              clauseCount: data.clauseCount || 0,
              redFlags: data.redFlags || [],
              cautions: data.cautions || [],
              positives: data.positives || [],
              violations: data.violations || [],
            };
          });
          setTosHistory(liveData);
          setLoading(false);
        }, (err) => {
          console.error("Firestore Error:", err);
          setLoading(false);
        });

        return () => unsubscribeDocs();

      } catch (error) {
        console.error("Security handshake failed:", error);
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  if (loading) {
    return (
      <div className={`${bodyFont.className} min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white`}>
        <div className="h-12 w-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin mb-4" />
        <p className="tracking-widest uppercase text-xs text-rose-500 font-bold">Scanning for Violations...</p>
      </div>
    );
  }

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-[#0a0505] text-slate-50`}>
      {/* Red/Orange Warm Background Glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(225,29,72,0.15),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.05),_transparent_40%)]" />
      
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        {/* Header with Warm Theme */}
        <section className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-rose-500 w-5 h-5" />
            <p className="text-[10px] tracking-[0.4em] text-rose-500 uppercase font-bold">Active Sentry Mode</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl mb-4 font-[var(--font-heading)]">
            Command Center
          </h1>
          <p className="text-slate-400">
            Monitoring identity <span className="text-rose-200/80 font-mono underline decoration-rose-500/40">{user?.email}</span>
          </p>
        </section>

        {/* Risk Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 hover:bg-white/10 transition-colors">
            <p className="text-xs uppercase text-slate-500 mb-1 font-bold tracking-widest">Audited Assets</p>
            <p className="text-3xl font-bold text-white">{tosHistory.length}</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6">
            <p className="text-xs uppercase text-rose-400/60 mb-1 font-bold tracking-widest">Red Flags</p>
            <p className="text-3xl font-bold text-rose-500">
              {tosHistory.reduce((acc, curr) => acc + curr.flags, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6">
            <p className="text-xs uppercase text-orange-400/60 mb-1 font-bold tracking-widest">Cautions</p>
            <p className="text-3xl font-bold text-orange-500">
              {tosHistory.reduce((acc, curr) => acc + curr.cautions.length, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <p className="text-xs uppercase text-emerald-400/60 mb-1 font-bold tracking-widest">Positives</p>
            <p className="text-3xl font-bold text-emerald-500">
              {tosHistory.reduce((acc, curr) => acc + curr.positives.length, 0)}
            </p>
          </div>
        </div>

        {/* History List */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-[var(--font-heading)] text-2xl font-bold text-white flex items-center gap-2">
              Violation Log
            </h2>
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
                <div key={entry.id} className="group rounded-2xl border border-white/5 bg-[#140c0c] p-6 hover:border-rose-500/40 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <div className={`w-2 h-2 rounded-full animate-pulse ${entry.riskScore > 70 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                         <p className="text-[10px] uppercase text-rose-400 font-bold tracking-tighter">{entry.category}</p>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors tracking-tight">{entry.service}</h3>
                      <p className="text-xs text-slate-500 uppercase font-mono mt-1">Ref: {entry.id.slice(0,12)} • {entry.acceptedOn}</p>
                    </div>

                    <div className="w-full md:w-64">
                      <div className="flex justify-between text-[10px] uppercase font-black mb-2">
                        <span className={entry.riskScore > 70 ? "text-rose-500" : "text-amber-500"}>{riskLabel(entry.riskScore)}</span>
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
                      <button
                        onClick={() => toggleCard(entry.id)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all"
                      >
                        {expandedCards.has(entry.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedCards.has(entry.id) && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
                      {/* Summary */}
                      <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-2">Summary</p>
                        <p className="text-sm text-slate-300">{entry.summary}</p>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <p className="text-2xl font-bold text-rose-500">{entry.redFlags.length}</p>
                          <p className="text-[10px] uppercase text-rose-400/60 font-bold">Red Flags</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          <p className="text-2xl font-bold text-orange-500">{entry.cautions.length}</p>
                          <p className="text-[10px] uppercase text-orange-400/60 font-bold">Cautions</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-2xl font-bold text-emerald-500">{entry.positives.length}</p>
                          <p className="text-[10px] uppercase text-emerald-400/60 font-bold">Positives</p>
                        </div>
                      </div>

                      {/* Red Flags */}
                      {entry.redFlags.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase text-rose-500 font-bold tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle size={12} /> Red Flags
                          </p>
                          <ul className="space-y-2">
                            {entry.redFlags.map((flag: string, i: number) => (
                              <li key={i} className="text-sm text-slate-300 pl-4 border-l-2 border-rose-500/50">{flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Cautions */}
                      {entry.cautions.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase text-orange-500 font-bold tracking-widest mb-2 flex items-center gap-2">
                            <AlertCircle size={12} /> Cautions
                          </p>
                          <ul className="space-y-2">
                            {entry.cautions.map((caution: string, i: number) => (
                              <li key={i} className="text-sm text-slate-300 pl-4 border-l-2 border-orange-500/50">{caution}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Positives */}
                      {entry.positives.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest mb-2 flex items-center gap-2">
                            <CheckCircle size={12} /> Positives
                          </p>
                          <ul className="space-y-2">
                            {entry.positives.map((positive: string, i: number) => (
                              <li key={i} className="text-sm text-slate-300 pl-4 border-l-2 border-emerald-500/50">{positive}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Violations */}
                      {entry.violations.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-2">Violations by Category</p>
                          <div className="flex flex-wrap gap-2">
                            {entry.violations.map((v: {label: string, count: number}, i: number) => (
                              <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                                {v.label}: <span className="text-rose-400 font-bold">{v.count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* View Full Analysis Link */}
                      <Link
                        href={`/analysis/${entry.id}`}
                        className="inline-flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors"
                      >
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