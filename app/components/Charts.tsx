/** Thin horizontal bars: a label, a line of ink and the value, one row each. */
export function Bars({ rows, max, label }: { rows: { label: string; value: number; display: string; hi?: boolean; note?: string }[]; max?: number; label: string }) {
  const top = max ?? Math.max(...rows.map((r) => r.value));
  return (
    <div role="list" aria-label={label} className="flex flex-col gap-16">
      {rows.map((r) => (
        <div role="listitem" key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-16 gap-y-4 sm:grid-cols-[200px_minmax(0,1fr)_96px] sm:items-center">
          <p className="text-[16px] leading-[1.3]">{r.label}{r.note && <span className="block text-[13px] text-ink-navy/60">{r.note}</span>}</p>
          <div className="order-3 col-span-2 h-[10px] bg-blush-canvas sm:order-none sm:col-span-1" title={`${r.label}: ${r.display}`}>
            <div className={`h-full ${r.hi ? "bg-ember-orange" : "bg-forest-ink"}`} style={{ width: `${(100 * Math.max(0, r.value)) / top}%` }} />
          </div>
          <p className="num text-right text-[16px]">{r.display}</p>
        </div>
      ))}
    </div>
  );
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const week = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/**
 * Weekly cohorts: rows are the week people first came, columns how many weeks later, cells the
 * share who visited again. One hue, light to dark; every cell's value is in its hover note.
 */
export function Heatmap({ cohorts }: { cohorts: { week: string; size: number; share: number[] }[] }) {
  const cols = Math.max(...cohorts.map((c) => c.share.length));
  const top = 0.07;
  const shade = (v: number) => {
    const t = Math.min(1, v / top);
    const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
    return `rgb(${mix(222, 25)} ${mix(233, 60)} ${mix(228, 53)})`; // sage mist to forest ink
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-[3px] text-[13px]" aria-label="Share of each weekly cohort who visited again, by weeks since their first visit">
        <thead>
          <tr>
            <th className="label pb-8 text-left text-[10px] font-normal">First came</th>
            {Array.from({ length: cols }, (_, i) => <th key={i} className="label pb-8 text-[10px] font-normal">+{i + 1}</th>)}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.week}>
              <th className="whitespace-nowrap pr-12 text-left font-normal"><span className="num">{week(c.week)}</span> <span className="text-ink-navy/50">· {c.size.toLocaleString("en-US")}</span></th>
              {Array.from({ length: cols }, (_, i) => {
                const v = c.share[i];
                return v === undefined ? <td key={i} /> : (
                  <td key={i} className="num h-[30px] text-center text-[11px]" style={{ background: shade(v), color: v > top * 0.55 ? "#fff" : "#11223f" }}
                    title={`First came the week of ${week(c.week)}: ${pct(v)} visited again ${i + 1} week${i ? "s" : ""} later`}>
                    {i === 0 ? pct(v) : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
