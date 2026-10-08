/**
 * Flat, hand-cut botanical shapes in the illustration palette: cactus pads, leaves, star flowers,
 * dot clusters and thin outline blobs. Every number is fixed (no randomness), so the server and the
 * browser draw the same garden.
 */
const C = { forest: "#193c35", olive: "#7e813c", mustard: "#e5ba2b", ember: "#ec4f22", sage: "#c6d7d0", peach: "#f6bba4", ink: "#11223f" };

type P = { x: number; y: number; s?: number; r?: number; fill?: string; d?: number };
const t = ({ x, y, s = 1, r = 0 }: P) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;

/** A long leaf pointing right from the origin. */
const LEAF = "M0 0 C28 -26 78 -30 120 0 C78 30 28 26 0 0Z";
/** An organic blob, about 200 x 180. */
const BLOB = "M96 4 C150 -6 204 38 198 98 C192 160 132 190 78 176 C22 162 -6 112 6 66 C14 32 52 10 96 4Z";
/** A notched, monstera-like leaf, about 220 x 220. */
const NOTCHED = "M110 0 C170 0 220 50 220 110 C220 140 205 168 182 188 L150 140 L160 196 C145 210 128 218 110 220 L104 160 L84 214 C40 200 8 168 2 124 L60 108 L0 92 C10 40 56 0 110 0Z";

export function Leaf({ fill = C.peach, ...p }: P) {
  return <path className="grow" d={LEAF} fill={fill} transform={t(p)} style={{ animationDelay: `${p.d ?? 0}s` }} />;
}

/** A fan of leaves from one stem, like the peach sprigs at the reference's edges. */
export function Sprig({ fill = C.peach, n = 5, spread = 70, len = 1, ...p }: P & { n?: number; spread?: number; len?: number }) {
  return (
    <g transform={t(p)}>
      <path d={`M0 0 L${-140 * len} 0`} stroke={C.olive} strokeWidth={1.4} fill="none" />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} className="grow" d={LEAF} fill={fill} style={{ animationDelay: `${(p.d ?? 0) + i * 0.06}s` }}
          transform={`translate(${-i * 26 * len} 0) rotate(${-spread / 2 + (spread * i) / Math.max(1, n - 1) - 90}) scale(${0.55 + 0.1 * (i % 3)})`} />
      ))}
    </g>
  );
}

/** An opuntia cactus: overlapping rounded pads. */
export function Cactus({ fill = C.forest, ...p }: P) {
  const pads: [number, number, number, number, number][] = [[0, 0, 64, 140, -4], [-58, -122, 46, 92, -28], [60, -114, 42, 84, 24], [-94, -222, 32, 66, -38], [16, -214, 28, 58, 10], [96, -196, 24, 50, 30]];
  return (
    <g transform={t(p)}>
      {pads.map(([x, y, rx, ry, r], i) => (
        <ellipse key={i} className="grow" cx={x} cy={y} rx={rx} ry={ry} fill={fill} transform={`rotate(${r} ${x} ${y})`} style={{ animationDelay: `${(p.d ?? 0) + i * 0.08}s` }} />
      ))}
    </g>
  );
}

/** A curving stem with leaves on alternate sides. */
export function Stem({ fill = C.olive, n = 6, len = 300, bend = 60, ...p }: P & { n?: number; len?: number; bend?: number }) {
  return (
    <g transform={t(p)}>
      <path d={`M0 0 Q${bend} ${-len / 2} 0 ${-len}`} stroke={C.forest} strokeWidth={1.6} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const y = -len * (0.18 + (0.78 * i) / n), x = bend * 0.5 * Math.sin(Math.PI * (-y / len));
        return <path key={i} className="grow" d={LEAF} fill={fill} style={{ animationDelay: `${(p.d ?? 0) + i * 0.07}s` }}
          transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${i % 2 ? -150 : -30}) scale(${(0.62 - i * 0.04).toFixed(2)})`} />;
      })}
    </g>
  );
}

/** A star flower: rounded petals around a centre. */
export function Flower({ fill = C.mustard, center, petals = 7, len = 34, wid = 13, ...p }: P & { center?: string; petals?: number; len?: number; wid?: number }) {
  return (
    <g className="grow" transform={t(p)} style={{ animationDelay: `${p.d ?? 0}s` }}>
      {Array.from({ length: petals }, (_, i) => (
        <ellipse key={i} cx={0} cy={-len} rx={wid} ry={len} fill={fill} transform={`rotate(${(360 / petals) * i})`} />
      ))}
      <circle r={len * 0.42} fill={center ?? fill} />
    </g>
  );
}

/** A cluster of dots, as on the reference's leaves. */
export function Dots({ fill = C.ink, ...p }: P) {
  const at: [number, number, number][] = [[0, 0, 5], [16, -8, 4], [30, 4, 5], [10, 16, 4], [-14, 10, 3.5], [24, 22, 3], [42, -10, 3.5], [-4, -18, 3]];
  return (
    <g transform={t(p)}>
      {at.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={fill} />)}
    </g>
  );
}

export function Blob({ fill = C.olive, outline, ...p }: P & { outline?: boolean }) {
  return <path className={outline ? undefined : "grow"} d={BLOB} transform={t(p)} fill={outline ? "none" : fill}
    stroke={outline ? fill : undefined} strokeWidth={outline ? 1.4 / (p.s ?? 1) : undefined} style={{ animationDelay: `${p.d ?? 0}s` }} />;
}

export function Notched({ fill = C.forest, ...p }: P) {
  return <path className="grow" d={NOTCHED} transform={t(p)} fill={fill} style={{ animationDelay: `${p.d ?? 0}s` }} />;
}

/** The hero's artwork, drawn in a 1440 x 900 space: a cluster bleeding off each side, the middle left clear. */
function GardenArt() {
  return (
    <>
      {/* left: sage outline, olive stem behind a cactus, peach fan, mustard bloom */}
      <Blob x={-80} y={-20} s={1.7} fill={C.sage} outline />
      <Stem x={250} y={900} s={1.2} r={8} n={7} len={420} bend={-70} d={0.15} />
      <Notched x={-150} y={250} s={0.9} r={40} fill={C.olive} d={0.05} />
      <Cactus x={110} y={760} s={1.35} d={0.1} />
      <Flower x={60} y={430} fill={C.ember} petals={6} len={24} wid={10} d={0.5} />
      <Flower x={170} y={360} fill={C.peach} petals={5} len={16} wid={8} d={0.55} />
      <Sprig x={330} y={960} r={-10} n={7} spread={90} len={1.2} d={0.3} />
      <Flower x={340} y={110} fill={C.mustard} petals={8} len={30} wid={12} center={C.mustard} d={0.4} />
      <Sprig x={470} y={930} r={-78} n={5} spread={46} len={0.9} fill={C.mustard} d={0.6} />
      <Dots x={420} y={810} d={0.7} />
      {/* right: peach star flower, dark notched leaf, olive leaf, navy outline */}
      <Flower x={1290} y={30} fill={C.peach} petals={6} len={105} wid={34} center={C.peach} d={0.2} />
      <Dots x={1190} y={70} fill={C.ember} />
      <Dots x={1320} y={150} fill={C.ember} s={0.8} />
      <Notched x={1250} y={190} s={1.15} r={12} d={0.3} />
      <Stem x={1180} y={930} s={1.1} r={-12} n={6} len={360} bend={60} fill={C.forest} d={0.35} />
      <Blob x={1090} y={540} s={1.6} fill={C.ink} outline />
      <Notched x={1230} y={590} s={1.25} r={-30} fill={C.olive} d={0.4} />
      <Dots x={1190} y={700} fill={C.sage} />
      <Leaf x={1470} y={440} s={1.6} r={160} fill={C.peach} d={0.5} />
      <Flower x={1110} y={830} fill={C.ember} petals={6} len={20} wid={8} d={0.6} />
      <Blob x={1010} y={-60} s={0.9} fill={C.olive} outline />
    </>
  );
}

/**
 * The hero's garden. Wide screens see the whole 1440 x 900 scene; on phones the same art is shown as
 * two corner crops (cactus bottom-left, flower top-right), since the full scene would crop to its empty middle.
 */
export function HeroGarden() {
  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <GardenArt />
      </svg>
      <svg aria-hidden className="pointer-events-none absolute -bottom-[10px] -left-[24px] h-[32vh] w-[46vw] sm:hidden" viewBox="-60 420 420 500" preserveAspectRatio="xMinYMax meet">
        <GardenArt />
      </svg>
      <svg aria-hidden className="pointer-events-none absolute -right-[24px] top-[48px] h-[22vh] w-[44vw] sm:hidden" viewBox="1080 -40 400 420" preserveAspectRatio="xMaxYMin meet">
        <GardenArt />
      </svg>
    </>
  );
}

/** A small cluster for the edge of a section: side picks which edge it bleeds off. */
export function EdgeGarden({ side, variant = 0, className = "" }: { side: "left" | "right"; variant?: number; className?: string }) {
  const flip = side === "right" ? "scale(-1 1) translate(-320 0)" : undefined;
  const sets = [
    <g key="a"><Notched x={-90} y={40} s={1.1} r={-20} /><Dots x={70} y={250} fill={C.peach} /><Blob x={-40} y={170} s={1.1} fill={C.sage} outline /></g>,
    <g key="b"><Sprig x={150} y={320} r={-55} n={6} spread={70} len={1} fill={C.peach} /><Blob x={-60} y={20} s={0.9} fill={C.olive} outline /></g>,
    <g key="c"><Leaf x={-40} y={150} s={1.6} r={-15} fill={C.mustard} /><Leaf x={-20} y={230} s={1.2} r={10} fill={C.olive} /><Dots x={90} y={120} /></g>,
  ];
  return (
    <svg aria-hidden className={`pointer-events-none absolute hidden h-[360px] w-[320px] sm:block ${side === "left" ? "-left-[40px]" : "-right-[40px]"} ${className}`} viewBox="0 0 320 360">
      <g transform={flip}>{sets[variant % sets.length]}</g>
    </svg>
  );
}
