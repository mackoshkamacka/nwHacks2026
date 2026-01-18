import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { ShieldAlert, Zap, Lock, Activity } from "lucide-react";

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

export default function Home() {
  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-[#0a0505] text-slate-50 overflow-hidden`}>
      
      {/* Background Ambient Glows - Shifted to Red/Orange */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(225,29,72,0.15),_transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_rgba(249,115,22,0.08),_transparent_50%)]" />

      {/* Navigation */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="h-7 w-7 rounded bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.6)] flex items-center justify-center transition-transform group-hover:scale-110">
            <ShieldAlert size={16} className="text-white" />
          </div>
          <span className="font-[var(--font-heading)] text-xl font-bold tracking-tight text-white">RD-FLG</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <a href="#personal" className="hover:text-rose-500 transition-colors">Individual Defense</a>
          <a href="#enterprise" className="hover:text-emerald-500 transition-colors">Enterprise Risk</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">
            Access Console
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-32">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 py-1.5 text-[10px] font-black tracking-[0.3em] text-rose-500 uppercase">
            <Activity size={12} className="animate-pulse" />
            Vigilance Protocol Active
          </div>
          <h1 className="mb-8 max-w-5xl font-[var(--font-heading)] text-6xl font-bold leading-[1] tracking-tighter text-white lg:text-8xl">
            The end of the <br />
            <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              "Blind Accept."
            </span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-slate-400 leading-relaxed">
            RD-FLG decodes the fine print in real-time. Don't just agree to terms—audit them. 
            Identify predatory clauses before they become binding.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="rounded-xl bg-rose-600 px-8 py-4 font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:bg-rose-500 hover:shadow-rose-500/50 transition-all">
              Initialize Defense
            </Link>
          </div>
        </section>

        {/* Dual Track Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* PERSONAL TRACK - Rose/Orange */}
          <section id="personal" className="group relative rounded-3xl border border-rose-500/10 bg-[#120808] p-10 transition-all hover:border-rose-500/40">
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-xl bg-rose-500/10 p-4 text-rose-500 shadow-[inset_0_0_15px_rgba(225,29,72,0.1)]">
                <Lock size={32} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-black text-rose-500/50 uppercase tracking-[0.2em]">Sentry Mode</span>
            </div>
            <h2 className="mb-4 font-[var(--font-heading)] text-3xl font-bold text-white">For Individuals</h2>
            <p className="mb-8 text-slate-400 leading-relaxed">
              Upload any Terms of Service to expose "Red Flags." We maintain an immutable record of every contract you’ve accepted, alerting you the moment a company changes the rules.
            </p>
            <ul className="mb-10 space-y-4 text-sm font-medium text-slate-300">
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-[10px] text-rose-500">01</span> 
                Smart Clause Summaries
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-[10px] text-rose-500">02</span> 
                Immutable Consent Vault
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-[10px] text-rose-500">03</span> 
                Violation Detection Engine
              </li>
            </ul>
            <Link href="/login" className="inline-flex w-full items-center justify-center rounded-xl bg-rose-600/10 border border-rose-500/30 py-4 font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
              Protect My Identity
            </Link>
          </section>

          {/* ENTERPRISE TRACK - Emerald (The "Safety" accent) */}
          <section id="enterprise" className="group relative rounded-3xl border border-emerald-500/10 bg-[#08120d] p-10 transition-all hover:border-emerald-500/40">
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-4 text-emerald-500 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]">
                <Zap size={32} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Sanitization Mode</span>
            </div>
            <h2 className="mb-4 font-[var(--font-heading)] text-3xl font-bold text-white">For Enterprise</h2>
            <p className="mb-8 text-slate-400 leading-relaxed">
              Scan draft agreements against thousands of historical disputes and regulatory actions. Flag high-risk language before it reaches the public or the courtroom.
            </p>
            <ul className="mb-10 space-y-4 text-sm font-medium text-slate-300">
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">01</span> 
                Draft Sanitization Engine
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">02</span> 
                Litigation Risk Benchmarks
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">03</span> 
                Compliance Pre-Check
              </li>
            </ul>
            <Link href="/login" className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600/10 border border-emerald-500/30 py-4 font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
              Sanitize Documents
            </Link>
          </section>
        </div>

        {/* Bottom Status Branding */}
        <section className="mt-32 border-t border-white/5 pt-20 text-center">
          <div className="flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all">
             <div className="h-4 w-20 bg-white/20 rounded" />
             <div className="h-4 w-20 bg-white/20 rounded" />
             <div className="h-4 w-20 bg-white/20 rounded" />
          </div>
          <p className="mt-12 mx-auto max-w-xl text-xs uppercase tracking-[0.5em] text-rose-500/40 font-bold">
            Red-Flag Transparency Protocol v7.1
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0505] px-6 py-12 text-center">
        <p className="text-[9px] text-slate-600 uppercase tracking-[0.4em] font-mono">
          © 2026 RD-FLG Terminal • Encrypted Endpoint • 0.0.0.0:SECURE
        </p>
      </footer>
    </div>
  );
}