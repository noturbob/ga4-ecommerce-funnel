import story from "@/data/story.json";

const SQL = story.sql as Record<string, string>;
const KEYWORDS = new Set(("select from where group by order having with as and or not in is null case when then else end join left using on " +
  "union all distinct over partition create table copy between like coalesce sum count countif min max avg ifnull nullif if " +
  "array_agg logical_or limit offset unnest grouping sets rollup round safe_divide format_date parse_date date_trunc date_diff " +
  "date_add interval week month desc asc any_value approx_quantiles").split(" "));

/** Colour comments, quoted strings and keywords. Server-rendered, no client JS. */
function highlight(sql: string) {
  return sql.split(/(--[^\n]*|'[^']*'|`[^`]*`|\b[A-Za-z_]+\b)/g).map((part, i) => {
    if (part.startsWith("--")) return <span key={i} className="text-olive-grove">{part}</span>;
    if (part.startsWith("'") || part.startsWith("`")) return <span key={i} className="text-ember-orange">{part}</span>;
    if (KEYWORDS.has(part.toLowerCase())) return <span key={i} className="font-medium text-deep-indigo">{part}</span>;
    return part;
  });
}

/** "Show the SQL": the exact BigQuery query behind a chart, from sql/ via story.json. */
export function SqlPanel({ files, className = "" }: { files: string[]; className?: string }) {
  return (
    <details className={`group ${className}`}>
      <summary className="label flex cursor-pointer list-none items-center justify-center gap-12 text-coral-vermillion">
        <span className="link">Show the SQL</span>
        <span aria-hidden className="inline-block transition-transform group-open:rotate-90">→</span>
      </summary>
      <div className="mt-24 bg-pure-white text-left">
        {files.map((f) => (
          <div key={f} className="border-b border-blush-canvas last:border-b-0">
            <p className="label px-24 pt-20 text-[10px] text-ink-navy/60">sql/{f}.sql · BigQuery</p>
            <pre className="overflow-x-auto px-24 pb-24 pt-8 font-mono text-[12.5px] leading-[1.65] text-ink-navy"><code>{highlight(SQL[f].trim())}</code></pre>
          </div>
        ))}
      </div>
    </details>
  );
}
