import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";

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

type Severity = "critical" | "caution" | "info";

type Alert = {
  id: number;
  severity: Severity;
  title: string;
  detail: string;
  impact: string;
  updated: string;
  action: string;
};

type TosEntry = {
  service: string;
  category: string;
  acceptedOn: string;
  riskScore: number;
  exposure: string;
  estValue: string;
  flags: number;
  reports: string;
};

const alerts: Alert[] = [
  {
    id: 1,
    severity: "critical",
    title: "Instagram expanded AI training clause",
    detail: "Now claims indefinite rights to train generative models on your photos unless you opt out by Jan 20.",
    impact: "High privacy risk",
    updated: "2m ago",
    action: "Review clause",
  },
  {
    id: 2,
    severity: "caution",
    title: "TikTok rolled out silent ToS update",
    detail: "Permissions now include background microphone access for " +
      "behavioral attribution. We recommend limiting OS-level access.",
    impact: "Moderate data exposure",
    updated: "14m ago",
    action: "Open permissions",
  },
  {
    id: 3,
    severity: "info",
    title: "VSCO reduced partner sharing scope",
    detail: "Data now limited to six analytics vendors. Your value exchange improved",
    impact: "Positive shift",
    updated: "1h ago",
    action: "Log acknowledgement",
  },
];

const tosHistory: TosEntry[] = [
  {
    service: "Instagram",
    category: "Social / Meta",
    acceptedOn: "Jan 12, 2026",
    riskScore: 78,
    exposure: "Shares with 127 trackers",
    estValue: "$47 / yr",
    flags: 4,
    reports: "47,392 peer violations",
  },
  {
    service: "BeReal",
    category: "Social",
    acceptedOn: "Jan 8, 2026",
    riskScore: 31,
    exposure: "Limited partner data",
    estValue: "$19 / yr",
    flags: 1,
    reports: "892 peer violations",
  },
  {
    service: "Snapchat",
    category: "Social",
    acceptedOn: "Jan 3, 2026",
    riskScore: 82,
    exposure: "Ad network telemetry",
    estValue: "$56 / yr",
    flags: 5,
    reports: "52,318 peer violations",
  },
  {
    service: "VSCO",
    category: "Creative",
    acceptedOn: "Dec 28, 2025",
    riskScore: 43,
    exposure: "Basic analytics",
    estValue: "$23 / yr",
    flags: 2,
    reports: "3,114 peer violations",
  },
];

const stats = [
  { label: "Contracts monitored", value: "64"},
  { label: "Open violations", value: "12"},
];

const communityPulse = {
  monthlyViolations: "143,294 reports",
  stressIndex: "2.1x vs. trusted apps",
  classActions: "3 active cohorts",
  callout: "Privacy-conscious users now 34% of market",
};

const severityClasses: Record<Severity, string> = {
  critical: "border-rose-400/60 bg-rose-950/40",
  caution: "border-amber-300/70 bg-amber-950/30",
  info: "border-cyan-300/60 bg-cyan-950/30",
};

const severityAccent: Record<Severity, string> = {
  critical: "text-rose-200",
  caution: "text-amber-200",
  info: "text-cyan-200",
};

const riskTrack = (score: number) => {
  if (score >= 75) return "bg-rose-500";
  if (score >= 50) return "bg-amber-400";
  return "bg-emerald-400";
};

const riskLabel = (score: number) => {
  if (score >= 75) return "High risk";
  if (score >= 50) return "Moderate risk";
  return "Stable";
};

export default function Home() {
  return (
    <div
      className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-slate-950 text-slate-50`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(248,113,113,0.35),_transparent_45%)]" />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <section className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full">
            <div id="dashboard-description" className="flex w-full flex-col mb-3">
              <p className="text-xs tracking-[0.4em] text-slate-300">rd-flg</p>
              <h1 className="mb-4 text-4xl leading-tight tracking-tight text-white lg:text-5xl">
                Your Terms of Service command center
              </h1>
              <p className="text-base text-slate-200">
                Real-time scans from Gemini, , and immutable violation trails stitched together so you can accept or reject with confidence.
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-4 text-center text-sm text-slate-200">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl  flex-grow  border border-white/10 bg-slate-900/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Contract history</p>
              <h2 className="font-[var(--font-heading)] text-2xl">Where your consent lives</h2>
            </div>
            <div className="flex gap-3 text-sm">
              <a
                href="/consumer/add-tos"
                className="rounded-full border border-white/30 px-4 py-2 text-white transition hover:border-white"
              >
                Add ToS
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {tosHistory.map((entry) => (
              <div key={entry.service} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{entry.category}</p>
                    <h3 className="text-xl font-semibold text-white">{entry.service}</h3>
                    <p className="text-sm text-slate-300">Accepted {entry.acceptedOn}</p>
                  </div>
                  <div className="flex w-full flex-col gap-3 md:w-1/2">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{riskLabel(entry.riskScore)}</span>
                      <span>{entry.riskScore}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className={`${riskTrack(entry.riskScore)} h-2 rounded-full`}
                        style={{ width: `${entry.riskScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{entry.exposure}</span>
                    <span>{entry.estValue}</span>
                    <span>{entry.flags} red flags</span>
                    <span>{entry.reports}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 lg:col-span-2">
            <p className="text-xs uppercase tracking-widest text-slate-400">Violation tracker</p>
            <h2 className="font-[var(--font-heading)] text-2xl">Evidence being captured</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-rose-200">Stress telemetry</p>
                <p className="text-sm text-slate-200">You experienced 8 spikes during last Instagram session. Correlated to ad interruptions and creator shop overlays.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-200">Promise mismatch</p>
                <p className="text-sm text-slate-200">"Minimal ads" clause breached: 47 ads in 20 minutes. Evidence block stored on Solana ledger #908311.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-cyan-200">Data resale claim</p>
                <p className="text-sm text-slate-200">Detected 127 unique tracking domains after acceptance despite "partners" being undefined. Flag ready for class action intake.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-200">Remediation history</p>
                <p className="text-sm text-slate-200">Two disputes resolved. VSCO granted AI training opt-out within 48 hours of your request.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-transparent p-6">
            <p className="text-xs uppercase tracking-widest text-slate-100">Next best actions</p>
            <ul className="mt-4 flex flex-col gap-4 text-sm text-slate-100">
              <li className="rounded-2xl border border-white/20 bg-slate-950/40 p-4">
                Send opt-out letter to Instagram for AI training. ConsentIQ template ready; notarized via ElevenLabs within 3 minutes.
              </li>
              <li className="rounded-2xl border border-white/20 bg-slate-950/40 p-4">
                Join privacy class action #2416 (data resale). 50,000+ members already submitted violation packets.
              </li>
              <li className="rounded-2xl border border-white/20 bg-slate-950/40 p-4">
                Lock down mobile permissions for TikTok before next session to keep microphone off when idle.
              </li>
              <li className="rounded-2xl border border-white/20 bg-slate-950/40 p-4">
                Schedule weekly digest to your counsel inbox to keep audit trail synchronized.
              </li>
            </ul>
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Live protection feed</p>
                <h2 className="font-[var(--font-heading)] text-2xl">Alerts you should care about</h2>
              </div>
              <button className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-slate-100 transition hover:border-white/40">
                Export digest
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl border px-5 py-4 ${severityClasses[alert.severity]}`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className={`text-xs uppercase tracking-wide ${severityAccent[alert.severity]}`}>
                        {alert.impact}
                      </p>
                      <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                      <p className="text-sm text-slate-200">{alert.detail}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 text-sm text-slate-300 md:items-end">
                      <p>{alert.updated}</p>
                      <button className="rounded-full border border-white/30 px-4 py-1 text-xs uppercase tracking-wide text-white transition hover:border-white">
                        {alert.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">Community intelligence</p>
            <h2 className="font-[var(--font-heading)] text-2xl text-white">Where the crowd sees risk</h2>
            <div className="mt-6 flex flex-col gap-4 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-xs text-slate-400">Monthly violation stream</p>
                <p className="text-xl font-semibold text-white">{communityPulse.monthlyViolations}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-xs text-slate-400">Stress signal</p>
                <p className="text-xl font-semibold text-white">{communityPulse.stressIndex}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-xs text-slate-400">Class action watch</p>
                <p className="text-xl font-semibold text-white">{communityPulse.classActions}</p>
              </div>
              <p className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                {communityPulse.callout}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
