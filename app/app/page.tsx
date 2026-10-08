import type { ReactNode } from "react";
import story from "@/data/story.json";
import { HeroGarden, EdgeGarden } from "@/components/Botanical";
import { Icon } from "@/components/Icons";
import { Funnel } from "@/components/Funnel";
import { Bars, Heatmap } from "@/components/Charts";
import { SqlPanel } from "@/components/SqlPanel";

const all = story.overview.find((r) => r.month === "all")!;
const fmt = (n: number) => n.toLocaleString("en-US");
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const usdK = (n: number) => `$${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`;
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
const GH = "https://github.com/noturbob";

const NAV = [["#overview", "Overview"], ["#funnel", "Funnel"], ["#worth", "Worth"], ["#channels", "Channels"], ["#returns", "Returns"], ["#products", "Products"], ["#trust", "Trust"], ["#fix", "Fix first"]];

/** Small tracked label above a heading, optionally trailed by a hairline, as on the reference. */
function Eyebrow({ children, line = false, className = "" }: { children: ReactNode; line?: boolean; className?: string }) {
  return (
    <p className={`label flex items-center justify-center gap-16 ${className}`}>
      <span>{children}</span>{line && <span aria-hidden className="h-px w-[120px] bg-ink-navy/60 sm:w-[160px]" />}
    </p>
  );
}

/** Centered section: label, tracked-caps title, serif lede. */
function Section({ id, label, title, lede, children, garden }: { id: string; label: string; title: string; lede?: ReactNode; children: ReactNode; garden?: ReactNode }) {
  return (
    <section id={id} aria-label={title} className="relative scroll-mt-64 px-16 py-96 sm:px-24">
      {garden}
      <div className="relative mx-auto max-w-[1200px] text-center">
        <Eyebrow>{label}</Eyebrow>
        <h2 className="mt-24 text-[22px] font-normal uppercase tracking-[0.2em] sm:text-[28px]">{title}</h2>
        {lede && <div className="display mx-auto mt-32 max-w-[640px] text-left text-[21px] leading-[1.55] sm:text-[23px]">{lede}</div>}
        <div className="mt-64">{children}</div>
      </div>
    </section>
  );
}

/** The reference's oversized left-aligned display words, under an eyebrow with a line. */
function BigTitle({ eyebrow, lines }: { eyebrow: string; lines: string[] }) {
  return (
    <div className="mx-auto max-w-[1200px] px-16 pt-96 sm:px-24">
      <Eyebrow line className="!justify-start sm:pl-[12%]">{eyebrow}</Eyebrow>
      <h2 className="display mt-16 text-[64px] leading-[0.88] sm:text-[120px]">
        {lines.map((l, i) => <span key={l} className="block" style={{ paddingLeft: `${i * 14}%` }}>{l}</span>)}
      </h2>
    </div>
  );
}

export default function Home() {
  const f = story.funnel.all.steps;
  const visitors = f[0].n, viewed = f[1].n, carted = f[2].n, checkout = f[3].n;
  const ch = story.channels, dev = story.devices;
  const conv = ch.map((c) => c.conversion), rpv = ch.map((c) => c.revenue_per_visitor);
  const conflicting = story.quality.find((q) => q.issue.includes("traffic source"))!;
  const buyers = ch.reduce((t, c) => t + c.buyers, 0);
  const opp = story.opportunity, cart = opp.find((o) => o.step === 3)!;
  const ret = story.returns;
  const buyerRet = ret.filter((r) => r.first_day === "bought on first day").map((r) => r.return_rate);
  const browserRet = ret.filter((r) => r.first_day !== "bought on first day");
  const holidayBrowse = browserRet.find((r) => r.season.startsWith("Holiday"))!, preBrowse = browserRet.find((r) => r.season.startsWith("Before"))!;
  const wk1 = story.retention.filter((c) => c.share.length).map((c) => c.share[0]);
  const apparel = story.products[0];
  const desktop = dev.find((d) => d.segment === "desktop")!, mobile = dev.find((d) => d.segment === "mobile")!;

  const cards = [
    { icon: "footprints", q: "How many people visited?", a: fmt(all.users) },
    { icon: "door", q: "How many visits did they make?", a: fmt(all.sessions) },
    { icon: "bag", q: "How many of them bought?", a: `${fmt(buyers)} (${pct(buyers / all.users)})` },
    { icon: "cart", q: "How many orders?", a: fmt(all.orders) },
    { icon: "coins", q: "How much did they spend?", a: usd(all.revenue) },
    { icon: "tag", q: "What does a typical order cost?", a: `$${all.avg_order_value.toFixed(2)}` },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink-navy/70 bg-blush-canvas/95 backdrop-blur-sm">
        <nav aria-label="Sections" className="mx-auto flex h-[48px] max-w-[1200px] items-center justify-start gap-24 overflow-x-auto px-16 sm:justify-center sm:gap-40">
          {NAV.map(([h, l]) => <a key={h} href={h} className="link display shrink-0 text-[17px] sm:text-[19px]">{l}</a>)}
        </nav>
      </header>

      <main>
        {/* Hero: the store's two kinds of visitor, set like a couple's names */}
        <section id="top" aria-label="Browsers and buyers" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-16">
          <HeroGarden />
          <div className="relative text-center">
            <p className="label text-[13px] tracking-[0.3em]">Google Merchandise Store · Nov 2020 – Jan 2021</p>
            <h1 className="display relative mt-40 text-[76px] leading-[0.85] sm:text-[120px]">
              <svg aria-hidden className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 sm:h-[210px] sm:w-[210px]" viewBox="0 0 100 100">
                <path d="M18 18 L82 82 M82 18 L18 82" stroke="#f6a58c" strokeWidth="0.8" />
              </svg>
              <span className="relative block">Browsers</span>
              <span className="sr-only"> and </span>
              <span className="relative mt-[0.18em] block">Buyers</span>
            </h1>
          </div>
        </section>

        <Section id="story" label="The question" title="Window shopping, mostly"
          lede={<p>Google sells hoodies, mugs and stickers in its own online store, and it shares three months of that store&apos;s
            Google Analytics data with anyone: every page view, every cart, every order, {fmt(all.events)} events in all. {fmt(all.users)} people visited in those three months,
            and {pct(buyers / all.users)} of them bought something. That is normal for a store. The question is <em>where</em> they leave, which ones were worth keeping, and what the store
            should fix first.</p>}>
          <div id="overview" className="scroll-mt-80 border border-coral-vermillion/70 p-12 sm:p-24">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="col-span-2 flex flex-col justify-between p-20 text-left lg:col-span-1">
                <p className="label text-[10px]">The store in numbers</p>
                <p className="display mt-16 text-[34px] leading-[1.05]">Six numbers about the store</p>
                <p className="label mt-24 text-[10px] text-coral-vermillion"><span className="[@media(hover:none)]:hidden">Hover for the answer</span><span className="hidden [@media(hover:none)]:inline">Nov 2020 – Jan 2021</span></p>
              </div>
              {cards.map((c) => (
                <div key={c.q} tabIndex={0} className="group relative flex min-h-[200px] flex-col items-center justify-center gap-16 bg-pure-white p-24 text-center outline-offset-[-2px]">
                  <div className="flex h-[64px] items-center justify-center">
                    <span className="transition-opacity duration-300 group-hover:opacity-0 group-focus:opacity-0 [@media(hover:none)]:hidden"><Icon name={c.icon} /></span>
                    <span className="num display absolute text-[34px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100 [@media(hover:none)]:static [@media(hover:none)]:opacity-100">{c.a}</span>
                  </div>
                  <p className="text-[14px] leading-[1.4]">{c.q}</p>
                </div>
              ))}
              <div className="col-span-2 flex items-center justify-center bg-dusty-peach/60 p-24 lg:col-span-1">
                <p className="display text-[22px] leading-[1.3]">In US dollars, from Google&apos;s public sample of the store&apos;s data.</p>
              </div>
            </div>
          </div>
        </Section>

        {/* The funnel, laid out like the reference's weekend events */}
        <div id="funnel" className="relative scroll-mt-48 overflow-hidden">
          <EdgeGarden side="right" variant={0} className="top-[120px]" />
          <BigTitle eyebrow="25 Nov 2020 – 31 Jan 2021" lines={["Where they", "leave"]} />
          <div className="mx-auto max-w-[1000px] px-16 pb-96 sm:px-24">
            <div className="display mx-auto mt-48 max-w-[640px] text-[21px] leading-[1.55] sm:text-[23px]">
              <p>Each visitor is followed through the store&apos;s checkout, step by step. {pct(1 - viewed / visitors, 0)} never open a single
                product page. Of those who do, {pct(1 - carted / viewed, 0)} don&apos;t add anything to their cart, and {pct(1 - checkout / carted, 0)} of
                carts are abandoned before checkout. Once people start paying, most finish.</p>
              <p className="mt-16 text-[17px] leading-[1.6] text-ink-navy/75">Desktop and mobile visitors behave almost the same. Holiday
                visitors were twice as likely to buy as January ones. Switch between them below.</p>
            </div>
            <div className="mt-64"><Funnel data={story.funnel} /></div>
            <SqlPanel files={["01_funnel"]} className="mt-48" />
          </div>
        </div>

        <Section id="worth" label="If the store won back 1 in 10" title="What each leak is worth"
          garden={<EdgeGarden side="left" variant={1} className="top-[40px]" />}
          lede={<p>For each step, how much more the store would have sold over these ten weeks if it kept 1 in 10 of the people who leave
            there, and they then shopped like the people who stayed. The biggest numbers are at the top of the funnel, but those are about
            getting people interested at all. The cart is where interested people are lost.</p>}>
          <div className="bg-pure-white p-24 text-left sm:p-48">
            <Icon name="cart" />
            <ul className="mt-24">
              {opp.map((o) => (
                <li key={o.step} className={`grid grid-cols-[1fr_auto] items-baseline gap-x-24 gap-y-8 border-b border-blush-canvas py-20 sm:grid-cols-[1fr_140px_120px] ${o.step === 3 ? "bg-dusty-peach/25 sm:-mx-24 sm:px-24" : ""}`}>
                  <div>
                    <p className="display text-[26px] leading-[1.15]">{o.leak} {o.step === 3 && <span className="label ml-8 align-middle text-[10px] text-ember-orange">Start here</span>}</p>
                    <p className="mt-4 text-[14px] text-ink-navy/70">{fmt(o.lost)} people left here · {pct(o.pass_rate, 0)} carried on</p>
                  </div>
                  <p className="num text-[15px] text-ink-navy/70 sm:text-right">+{fmt(Math.round(o.extra_buyers))} buyers</p>
                  <p className="num display col-span-2 text-[30px] sm:col-span-1 sm:text-right">{usdK(o.extra_revenue)} <span aria-hidden className="text-[20px] text-coral-vermillion">→</span></p>
                </li>
              ))}
            </ul>
            <p className="mt-24 text-[14px] text-ink-navy/70">Average order {usd(cart.avg_order_value)}. Shipping details are logged together with the start of
              checkout, so the two are one step here. A scale, not a forecast.</p>
          </div>
          <SqlPanel files={["06_opportunity"]} className="mt-48" />
        </Section>

        <div id="channels" className="relative scroll-mt-48 overflow-hidden">
          <EdgeGarden side="left" variant={2} className="top-[80px]" />
          <BigTitle eyebrow="All three months" lines={["Who brings", "buyers"]} />
          <div className="mx-auto max-w-[1100px] px-16 pb-96 sm:px-24">
            <div className="display mx-auto mt-48 max-w-[640px] text-[21px] leading-[1.55] sm:text-[23px]">
              <p>Grouped by how people first found the store. No source stands out: between {pct(Math.min(...conv))} and {pct(Math.max(...conv))} of
                visitors buy, worth ${Math.min(...rpv).toFixed(2)} to ${Math.max(...rpv).toFixed(2)} each. Organic search simply brings the most people.</p>
              <p className="mt-16 text-[17px] leading-[1.6] text-ink-navy/75">Read these as rough. In this sample {fmt(conflicting.count)} visitors
                ({pct(conflicting.count / all.users, 0)}) carry more than one &ldquo;first&rdquo; source, which real tracking never would, so gaps this small
                can&apos;t rank the channels. A first draft of this chart picked one source at random and made paid search look worst; it wasn&apos;t.</p>
            </div>
            <div className="mt-64 grid gap-4 bg-coral-vermillion/0 lg:grid-cols-2">
              <div className="bg-pure-white p-24 sm:p-40">
                <p className="label text-[10px]">Chance a visitor buys</p>
                <div className="mt-24"><Bars label="Share of visitors who bought, by first traffic source" max={0.02}
                  rows={[...ch].sort((a, b) => b.conversion - a.conversion).map((c) => ({ label: c.segment, value: c.conversion, display: pct(c.conversion), note: `${fmt(c.visitors)} visitors` }))} /></div>
              </div>
              <div className="bg-pure-white p-24 sm:p-40">
                <p className="label text-[10px]">Revenue per visitor</p>
                <div className="mt-24"><Bars label="Revenue per visitor, by first traffic source"
                  rows={[...ch].sort((a, b) => b.revenue_per_visitor - a.revenue_per_visitor).map((c) => ({ label: c.segment, value: c.revenue_per_visitor, display: `$${c.revenue_per_visitor.toFixed(2)}`, note: `${usd(c.revenue)} in all` }))} /></div>
              </div>
            </div>
            <p className="mx-auto mt-32 max-w-[640px] text-[16px]">Device isn&apos;t the problem: {pct(desktop.conversion, 2)} of desktop visitors buy and {pct(mobile.conversion, 2)} of mobile ones.
              &ldquo;Unknown&rdquo; is traffic Google hid in this public sample.</p>
            <SqlPanel files={["02_channels"]} className="mt-48" />
          </div>
        </div>

        <Section id="returns" label="Within two weeks" title="Do they come back?"
          garden={<EdgeGarden side="right" variant={1} className="top-[60px]" />}
          lede={<p>People who buy on their first day come back: {pct(Math.min(...buyerRet), 0)} to {pct(Math.max(...buyerRet), 0)} visit again within two weeks.
            People who only browse mostly don&apos;t, and holiday browsers least of all ({pct(holidayBrowse.return_rate, 0)}, against{" "}
            {pct(preBrowse.return_rate, 0)} before the holidays): gift shoppers find what they came for and go.</p>}>
          <div className="bg-pure-white p-24 text-left sm:p-48">
            <p className="label text-[10px]">Came back within 14 days</p>
            <div className="mt-24"><Bars label="Share who returned within 14 days, by season and whether they bought on their first day" max={0.45}
              rows={ret.map((r) => ({ label: r.season.replace(/ \(.*\)/, ""), note: r.first_day === "bought on first day" ? `bought on day one · ${fmt(r.visitors)}` : `only browsed · ${fmt(r.visitors)}`, value: r.return_rate, display: pct(r.return_rate, 0), hi: r.first_day === "bought on first day" }))} /></div>
          </div>
          <div className="mt-4 bg-pure-white p-24 text-left sm:p-48">
            <p className="label text-[10px]">Every weekly group of first-time visitors, week by week</p>
            <p className="mt-8 text-[15px] text-ink-navy/70">The share who visited again one week later ran from {pct(Math.min(...wk1))} to {pct(Math.max(...wk1))}, and fell away from there.
              Hover a cell for its value.</p>
            <div className="mt-24"><Heatmap cohorts={story.retention} /></div>
          </div>
          <SqlPanel files={["04_return_rates", "03_retention"]} className="mt-48" />
        </Section>

        <Section id="products" label="Purchases only" title="What sells"
          lede={<p>Apparel is {pct(apparel.share_of_revenue, 0)} of everything the store sold, more than the next nine categories together. Views
            and carts can&apos;t be traced to products in this sample (Google scrambled product IDs differently on each event), so this counts
            sales alone.</p>}>
          <div className="bg-pure-white p-24 text-left sm:p-48">
            <Bars label="Share of revenue by product category"
              rows={story.products.map((p) => ({ label: p.category, value: p.share_of_revenue, display: pct(p.share_of_revenue, 0), hi: p === apparel, note: `${fmt(p.units)} units` }))} />
          </div>
          <SqlPanel files={["05_products"]} className="mt-48" />
        </Section>

        <Section id="trust" label="Data quality" title="How far to trust this"
          garden={<EdgeGarden side="left" variant={0} className="top-[80px]" />}
          lede={<p>Real tracking data is messy, and this sample more than most. Each of these was found by querying the data, and each
            choice above works around it.</p>}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col justify-center bg-dusty-peach/60 p-32 text-left">
              <p className="label text-[10px]">Found in the data</p>
              <p className="display mt-16 text-[32px] leading-[1.05]">{story.quality.length} things the tracking got wrong</p>
            </div>
            {story.quality.map((q) => (
              <div key={q.issue} className="bg-pure-white p-32 text-left">
                <p className="num display text-[44px] leading-none">{fmt(q.count)}</p>
                <p className="mt-16 text-[16px] font-normal leading-[1.4]">{q.issue}</p>
                <p className="mt-12 text-[14px] leading-[1.55] text-ink-navy/70">{q.handling}</p>
              </div>
            ))}
          </div>
          <SqlPanel files={["09_data_quality"]} className="mt-48" />
        </Section>

        <Section id="fix" label="The recommendation" title="What to fix first">
          <div className="bg-pure-white p-24 sm:p-64">
            <span className="inline-block"><Icon name="bag" /></span>
            <p className="display mt-16 text-[40px] leading-[1.1]">Four things, in order</p>
            <ol className="mt-48 grid gap-40 text-left md:grid-cols-2">
              {[
                ["Rescue the cart", `${fmt(carted - checkout)} visitors left a full cart. Winning back 1 in 10 is worth about ${usdK(cart.extra_revenue)} over ten weeks: cart reminders, and shipping costs shown before checkout.`],
                ["Get browsers to products", `${pct(1 - viewed / visitors, 0)} of visitors never open a product page, the largest leak by far. Better product links on the landing pages would test it.`],
                ["Bring buyers back", `First-day buyers come back three to five times as often as browsers. A follow-up after the first order is the cheapest repeat sale the store can make.`],
                ["Fix the tracking before the next season", `Carts went unrecorded for 18 days, checkout steps arrive out of order, and ${pct(conflicting.count / all.users, 0)} of visitors have conflicting sources. Until that's fixed, the channel question can't be answered.`],
              ].map(([h, t], i) => (
                <li key={h} className="border-t border-coral-vermillion/60 pt-20">
                  <p className="label text-[10px] text-ink-navy/60">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="display mt-8 text-[28px] leading-[1.15]">{h}</h3>
                  <p className="mt-12 text-[16px] leading-[1.6]">{t}</p>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      </main>

      <footer aria-label="Method and credits" className="relative overflow-hidden px-16 pb-64 pt-96 text-center sm:px-24">
        <EdgeGarden side="right" variant={2} className="bottom-0" />
        <div className="relative mx-auto max-w-[760px]">
          <p className="label">Method</p>
          <p className="mx-auto mt-24 max-w-[640px] text-left text-[15px] leading-[1.7]">
            Data: Google&apos;s public sample of the Google Merchandise Store&apos;s Google Analytics 4 events,{" "}
            <code className="text-[13px]">bigquery-public-data.ga4_obfuscated_sample_ecommerce</code>, 1 Nov 2020 to 31 Jan 2021. Every number comes
            from one of nine BigQuery SQL queries, run on {story.run.at.slice(0, 10)} ({story.run.gb_scanned} GB scanned, inside BigQuery&apos;s free tier);
            open &ldquo;Show the SQL&rdquo; under any chart to read it. The pipeline stops if the totals don&apos;t match the dataset. Google obfuscated
            parts of this sample, so some sources and product details are hidden.
          </p>
          <svg aria-hidden className="mx-auto mt-64 h-[120px] w-[120px] motion-safe:animate-[spin_40s_linear_infinite]" viewBox="0 0 120 120">
            <defs><path id="ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
            <text fontSize="8" letterSpacing="1.6" fill="#11223f" fontFamily="var(--font-hanken)">
              <textPath href="#ring" textLength="270" lengthAdjust="spacing">BROWSERS × BUYERS · MERCH STORE · 2020–21 ·</textPath>
            </text>
            <path d="M54 54 L66 66 M66 54 L54 66" stroke="#ff5734" strokeWidth="1" />
          </svg>
          <p className="mt-40 flex flex-wrap items-center justify-center gap-x-24 gap-y-8 text-[14px]">
            <span>Analysis by <span className="font-normal">Bobby Anthene</span></span>
            <a className="link" href={GH} target="_blank" rel="noreferrer">GitHub</a>
            <a className="link" href="mailto:bobbyanthene@gmail.com">bobbyanthene@gmail.com</a>
            <a className="link" href={`${GH}/ga4-ecommerce-funnel`} target="_blank" rel="noreferrer">Source code and SQL</a>
          </p>
        </div>
      </footer>
    </>
  );
}
