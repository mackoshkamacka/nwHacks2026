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
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-[#060505] text-slate-50 overflow-hidden`}>
      
      {/* Balanced Pulsating Glow System */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-glow {
          animation: pulse-glow 8s ease-in-out infinite;
        }
      `}} />

      <div className="animate-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(225,29,72,0.3),_transparent_60%)]" />
      <div className="animate-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(37,99,235,0.3),_transparent_60%)]" style={{ animationDelay: '-4s' }} />

      {/* Navigation */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-center px-6 py-8">
        <div className="flex items-center gap-2 group cursor-pointer">
          {/* <div className="h-7 w-7 rounded bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.6)] flex items-center justify-center transition-transform group-hover:scale-110">
        <ShieldAlert size={16} className="text-white" />
          </div> */}
          {/* <span className="font-[var(--font-heading)] text-xl font-bold tracking-tight text-white">RD-FLG</span> */}
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <a href="#personal" className="hover:text-rose-500 transition-colors">Individual Defense</a>
            <a href="#enterprise" className="hover:text-blue-500 transition-colors">Enterprise Risk</a>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-32">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-32">
          <h1 className="mb-8 max-w-5xl font-[var(--font-heading)] text-6xl font-bold leading-[1] tracking-tighter text-white lg:text-8xl">
            The end of the <br />
            <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-blue-400 bg-clip-text text-transparent">
              "Blind Accept."
            </span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-slate-400 leading-relaxed">
            RD-FLG decodes the fine print in real-time. Don't just agree to terms—audit them. 
            Identify predatory clauses before they become binding.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {/* GRADIENT BUTTON WITH ENHANCED INTERACTION */}
            <Link 
              href="/signup" 
              className="group relative rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-blue-500 px-8 py-4 font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all duration-300 hover:scale-105 hover:brightness-110 hover:shadow-[0_0_40px_rgba(225,29,72,0.5)] active:scale-95"
            >
              Initialize Defense
            </Link>
          </div>
        </section>

        {/* Dual Track Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* PERSONAL TRACK */}
          <section id="personal" className="group relative rounded-3xl border border-rose-500/10 bg-[#120808] p-10 transition-all hover:border-rose-500/40">
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-xl bg-rose-500/10 p-4 text-rose-500 shadow-[inset_0_0_15px_rgba(225,29,72,0.1)]">
                <Lock size={32} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-black text-rose-500/50 uppercase tracking-[0.2em]">Sentry Mode</span>
            </div>
            <h2 className="mb-4 font-[var(--font-heading)] text-3xl font-bold text-white">For Individuals</h2>
            <p className="mb-8 text-slate-400 leading-relaxed">
              Upload any Terms of Service to expose "Red Flags." We maintain an immutable record of every contract you’ve accepted.
            </p>
            <Link href="/login" className="inline-flex w-full items-center justify-center rounded-xl bg-rose-600/10 border border-rose-500/30 py-4 font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
              Protect My Identity
            </Link>
          </section>

          {/* ENTERPRISE TRACK */}
          <section id="enterprise" className="group relative rounded-3xl border border-blue-500/10 bg-[#080810] p-10 transition-all hover:border-blue-500/40">
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-xl bg-blue-500/10 p-4 text-blue-500 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]">
                <Zap size={32} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.2em]">Sanitization Mode</span>
            </div>
            <h2 className="mb-4 font-[var(--font-heading)] text-3xl font-bold text-white">For Enterprise</h2>
            <p className="mb-8 text-slate-400 leading-relaxed">
              Scan draft agreements against thousands of historical disputes. Flag high-risk language before it reaches the courtroom.
            </p>
            <Link href="/login" className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/30 py-4 font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
              Sanitize Documents
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}