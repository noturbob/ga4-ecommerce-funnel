"use client";

import { useState } from "react";

type Step = { key: string; label: string; n: number };
type Segment = { steps: Step[]; any_purchase: number };

const SEGMENTS: [string, string][] = [["all", "Everyone"], ["desktop", "Desktop"], ["mobile", "Mobile"], ["holiday", "Holiday visitors"], ["january", "January visitors"]];
const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (x: number) => `${(x * 100).toFixed(x < 0.1 ? 1 : 0)}%`;
const MAX = 168; // px diameter of the first step's circle

/**
 * The funnel as a list of "events": each step with what reached it, what carried on and what left,
 * and a circle whose area is the share of visitors still here. The outline ring is the step before.
 */
export function Funnel({ data }: { data: Record<string, Segment> }) {
  const [seg, setSeg] = useState("all");
  const { steps, any_purchase } = data[seg];
  const d = (n: number) => Math.max(4, Math.round(MAX * Math.sqrt(n / steps[0].n)));
  return (
    <div>
      <div role="group" aria-label="Show the funnel for" className="flex flex-wrap justify-center gap-12">
        {SEGMENTS.map(([k, label]) => (
          <button key={k} type="button" className="pill" aria-pressed={seg === k} onClick={() => setSeg(k)}>{label}</button>
        ))}
      </div>

      <ol className="mt-64 border-t border-coral-vermillion/60">
        {steps.map((s, i) => {
          const prev = steps[i - 1];
          return (
            <li key={s.key} className="grid grid-cols-[1fr] items-center gap-24 border-b border-coral-vermillion/60 py-32 sm:grid-cols-[220px_1fr_200px]">
              <div className="flex items-baseline gap-12">
                <span className="label text-[10px] text-ink-navy/60">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display text-[34px] leading-[1.05]">{s.label}</h3>
              </div>
              <dl className="grid grid-cols-[110px_1fr] gap-x-24 gap-y-8 text-[17px]">
                <dt className="label pt-4 text-[10px]">Visitors</dt><dd className="num">{fmt(s.n)}</dd>
                {prev && (<>
                  <dt className="label pt-4 text-[10px]">Carried on</dt>
                  <dd className="num">{pct(s.n / prev.n)} of those who {prev.label.toLowerCase()}</dd>
                  <dt className="label pt-4 text-[10px]">Left here</dt>
                  <dd className="num">{fmt(prev.n - s.n)}</dd>
                </>)}
                {s.key === "purchase" && (<>
                  <dt className="label pt-4 text-[10px]">Note</dt>
                  <dd>{fmt(any_purchase)} people bought in all; {fmt(any_purchase - s.n)} skipped a step the tracking missed.</dd>
                </>)}
              </dl>
              <div className="relative mx-auto flex h-[176px] w-[176px] items-center justify-center" role="img"
                aria-label={`${pct(s.n / steps[0].n)} of visitors reached this step`}>
                {prev && <span className="absolute rounded-full border border-ink-navy/40 transition-all duration-500" style={{ width: d(prev.n), height: d(prev.n) }} />}
                <span className="rounded-full bg-forest-ink transition-all duration-500" style={{ width: d(s.n), height: d(s.n), background: i === 0 ? "#f6bba4" : undefined }} />
                <span className="label absolute -bottom-8 text-[10px]">{pct(s.n / steps[0].n)} of visitors</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
