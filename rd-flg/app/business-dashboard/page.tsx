'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { bodyFont, headingFont } from "@/lib/fonts";

type Product = {
  name: string;
  price: string;
  description: string;
  bulletPoints: string[];
  proof: string[];
};

type Insight = {
  label: string;
  value: string;
  delta: string;
};

type AbVariant = {
  version: string;
  stats: { label: string; value: string }[];
  highlight: string;
};

type CompetitorMetric = {
  label: string;
  you: string;
  competitorA: string;
  competitorB: string;
  industry: string;
};

const valueProof: Insight[] = [
  { label: "ToS flagged", value: "47,392", delta: "for unclear sharing" },
  { label: "Stress differential", value: "3.2x", delta: "vs. category" },
  { label: "Trust uplift", value: "+24 pts", delta: "after fixes" },
  { label: "Revenue upside", value: "$15M", delta: "per launch" },
];

const products: Product[] = [
  {
    name: "Violation Intelligence",
    price: "$50K - $300K / yr",
    description:
      "Snowflake-grade telemetry that shows every clause users dispute, with Gemini pinning root cause language and Presage quantifying emotional fallout.",
    bulletPoints: [
      "47,392 flags for unclear sharing, 8,932 for deletion failures",
      "2.1x elevated stress traced to forced arbitration",
      "Gemini clarity rank: bottom 12% → fix list auto-generated",
    ],
    proof: [
      "User trust 47 → 71",
      "Violation reports -67%",
      "Acceptance rate 73% → 89%",
    ],
  },
  {
    name: "A/B Compliance Lab",
    price: "$100K / yr",
    description:
      "Run live ToS experiments with real customers. Presage captures emotion, Gemini scores comprehension, Snowflake tracks conversion, and Solana notarizes.",
    bulletPoints: [
      "Version A stress 0.68 vs. Version B 0.34",
      "Violations 142 → 23 within 30 days",
      "+16% acceptance when clauses are human-readable",
    ],
    proof: [
      "Projected violations 12,483 → 2,000",
      "+$15M trust-driven revenue",
      "Audit-stamped on chain",
    ],
  },
  {
    name: "Competitive Intelligence",
    price: "$75K / yr",
    description:
      "Benchmark every clause against VSCO, Snapchat, BeReal and the industry average. Spot exactly where you leak users and revenue.",
    bulletPoints: [
      "Privacy score: you 47 vs. VSCO 73",
      "User trust gap 13.9x (12,483 vs. 892 reports)",
      "Emotional cost 2.1x vs. competitor 0.8x",
    ],
    proof: [
      "$47M revenue at risk",
      "$2M fix cost",
      "ROI 23.5x in 12 months",
    ],
  },
  {
    name: "Real-Time Monitoring",
    price: "$150K / yr",
    description:
      "Live feed of user violations with ElevenLabs alerts when spikes hit. Triage PR disasters before regulators or press notice.",
    bulletPoints: [
      "2,000 breach reports in the last hour",
      "Spike 400% post-update with clause reference",
      "Voice + push alerts to legal, comms, trust & safety",
    ],
    proof: [
      "Incident response 6x faster",
      "Avoided two class actions",
      "Saved $4M in crisis comms",
    ],
  },
];

const abVariants: AbVariant[] = [
  {
    version: "Version A (Current)",
    stats: [
      { label: "Acceptance", value: "73%" },
      { label: "Stress", value: "0.68" },
      { label: "Violations", value: "142" },
      { label: "Decision time", value: "8s" },
    ],
    highlight: "Users skip reading, violations remain high",
  },
  {
    version: "Version B (Simplified)",
    stats: [
      { label: "Acceptance", value: "89% (+16%)" },
      { label: "Stress", value: "0.34 (-50%)" },
      { label: "Violations", value: "23 (-84%)" },
      { label: "Decision time", value: "45s" },
    ],
    highlight: "Deploy B → trust-driven revenue +$15M",
  },
];

const competitorMetrics: CompetitorMetric[] = [
  {
    label: "Privacy score",
    you: "47/100",
    competitorA: "VSCO 73/100",
    competitorB: "Snapchat 41/100",
    industry: "62/100",
  },
  {
    label: "User trust",
    you: "12,483 reports",
    competitorA: "BeReal 892",
    competitorB: "Snapchat 15,202",
    industry: "4,110",
  },
  {
    label: "Emotional cost",
    you: "2.1x stress",
    competitorA: "0.8x",
    competitorB: "1.6x",
    industry: "1.0x",
  },
  {
    label: "Revenue at risk",
    you: "$47M",
    competitorA: "$12M",
    competitorB: "$51M",
    industry: "$18M",
  },
];


export default function BusinessLanding() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUserEmail(currentUser.email);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen bg-[#020817] text-[#e4f1ff]`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(43,123,255,0.35),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(43,123,255,0.25),_transparent_55%)]" />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
        <section className="rounded-[36px] border border-[#2b7bff]/30 bg-gradient-to-br from-[#01204e] via-[#010b23] to-transparent p-10 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.4em] text-[#8fc5ff]">Your personalized</p>
              <h1 className="font-[var(--font-heading)] text-4xl leading-tight text-white lg:text-5xl">
                Violation Intelligence Dashboard
              </h1>
              <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-wide text-white/80">
                <span className="rounded-full border border-[#2b7bff]/50 px-3 py-1">
                  Welcome back, {userEmail ?? "team"}
                </span>
                <span className="rounded-full border border-[#2b7bff]/50 px-3 py-1">Last sync • 4 min ago</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-row gap-4">
          <div className="rounded-2xl border border-[#2b7bff]/30 bg-[#02122c]/80 p-6 grow">
              <p className="text-xs uppercase tracking-widest text-sky-300">Number of violations</p>
              <h1 className="text-lg font-semibold text-white">0</h1>
            </div>
            <div className="rounded-2xl border border-[#2b7bff]/30 bg-[#02122c]/80 p-6 grow">
              <p className="text-xs uppercase tracking-widest text-sky-300">Trust score</p>
              <h3 className="text-lg font-semibold text-white">68</h3>
            </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-sky-200/20 bg-[#04132a]/85 p-6 lg:col-span-2">
            <p className="text-xs uppercase tracking-widest text-sky-300">Competitive intelligence</p>
            <h2 className="font-[var(--font-heading)] text-2xl text-sky-50">Know where you lose to your competitors</h2>
            <div className="mt-4 space-y-4 text-sm text-sky-100">
              {competitorMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-sky-200/20 bg-[#081c36]/85 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs uppercase tracking-wide text-sky-300">{metric.label}</p>
                    <span className="rounded-full border border-sky-200/25 px-3 py-1 text-xs text-sky-200">Industry {metric.industry}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sky-50 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-sky-300/80">You</p>
                      <p className="text-lg font-semibold">{metric.you}</p>
                    </div>
                    <div>
                      <p className="text-xs text-sky-300/80">Competitor A</p>
                      <p className="text-lg font-semibold">{metric.competitorA}</p>
                    </div>
                    <div>
                      <p className="text-xs text-sky-300/80">Competitor B</p>
                      <p className="text-lg font-semibold">{metric.competitorB}</p>
                    </div>
                    <div>
                      <p className="text-xs text-sky-300/80">Industry avg</p>
                      <p className="text-lg font-semibold">{metric.industry}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-sky-200/20 bg-gradient-to-b from-[#031432] to-transparent p-6 gap-2">
            <p className="text-xs uppercase tracking-widest text-sky-300 mb-3">Concerned About A Draft?</p>
            <div className="rounded-2xl border border-sky-200/25 bg-[#071a33]/80 p-4 hover:bg-blue-600">
                <Link href="/business-dashboard/add-tos-business">Analyze Your ToS</Link>
              </div>
          </div>
        </section>
      </main>
    </div>
  );
}
