/**
 * Flat, hand-cut botanical shapes in the illustration palette. Outlines come from a small generator:
 * points around an ellipse, nudged in and out by a few fixed sine waves (the "hand-cut" wobble),
 * optionally carved into lobes or petals, then joined with smooth curves. Everything is fixed (no
 * randomness), so the server and the browser draw the same garden.
 */
const C = { forest: "#193c35", olive: "#7e813c", mustard: "#e5ba2b", ember: "#ec4f22", sage: "#c6d7d0", peach: "#f6bba4", ink: "#11223f", ground: "#efe3dc" };

type Shape = { cx: number; cy: number; rx: number; ry: number; rot?: number; seed?: number; wob?: number; lobes?: number; lobeDepth?: number; petals?: number; n?: number };

const r1 = (v: number) => Math.round(v * 10) / 10;

/** A closed, smooth, slightly irregular outline (Catmull-Rom through the points, as cubic Béziers). */
function outline({ cx, cy, rx, ry, rot = 0, seed = 1, wob = 0.08, lobes = 0, lobeDepth = 0, petals = 0, n }: Shape): string {
  const count = n ?? Math.max(28, (lobes || petals) * 10);
  const a = (rot * Math.PI) / 180;
  const pts: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const th = (2 * Math.PI * i) / count;
    let r = 1 + wob * (0.6 * Math.sin(2 * th + seed) + 0.4 * Math.sin(3 * th + seed * 1.7) + 0.25 * Math.sin(5 * th + seed * 2.3));
    if (lobes) r *= 1 - lobeDepth * (0.5 - 0.5 * Math.cos(lobes * th + seed));            // notches between lobes
    if (petals) r *= 0.32 + 0.68 * Math.pow(Math.abs(Math.cos((petals * th) / 2)), 1.6);   // long rounded petals
    const x = rx * r * Math.cos(th), y = ry * r * Math.sin(th);
    pts.push([cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]);
  }
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < count; i++) {
    const p0 = pts[(i - 1 + count) % count], p1 = pts[i], p2 = pts[(i + 1) % count], p3 = pts[(i + 2) % count];
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + "Z";
}

/** A leaf: pointed at both ends, from (x, y) along an angle. */
function leaf(x: number, y: number, len: number, width: number, angle: number, bend = 0.15): string {
  const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const P = (u: number, v: number) => `${r1(x + u * ca - v * sa)} ${r1(y + u * sa + v * ca)}`;
  return `M${P(0, 0)} C${P(len * 0.25, -width * (0.7 + bend))} ${P(len * 0.75, -width * (0.55 + bend))} ${P(len, 0)} C${P(len * 0.7, width * (0.6 - bend))} ${P(len * 0.3, width * (0.75 - bend))} ${P(0, 0)}Z`;
}

function Fill({ d, fill, delay = 0 }: { d: string; fill: string; delay?: number }) {
  return <path className="grow" d={d} fill={fill} style={{ animationDelay: `${delay}s` }} />;
}
function Line({ d, stroke, w = 2 }: { d: string; stroke: string; w?: number }) {
  return <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />;
}

/** Small irregular dots, as scattered on the reference's leaves. */
function Dots({ at, fill, size = 9 }: { at: [number, number][]; fill: string; size?: number }) {
  return <>{at.map(([x, y], i) => <path key={i} d={outline({ cx: x, cy: y, rx: size * (0.8 + 0.15 * (i % 3)), ry: size * (1.05 - 0.1 * (i % 2)), rot: i * 37, seed: i + 2, wob: 0.18, n: 10 })} fill={fill} />)}</>;
}

/** The hero's artwork in a 1440 x 900 space: a cluster on each side, a plant growing up under the title, the middle left clear. */
function GardenArt() {
  return (
    <>
      {/* ground shadows */}
      <ellipse cx={210} cy={905} rx={230} ry={18} fill={C.ground} />
      <ellipse cx={600} cy={905} rx={120} ry={16} fill={C.ground} />
      <ellipse cx={1240} cy={905} rx={240} ry={18} fill={C.ground} />

      {/* LEFT: sage outline leaf behind, a knobbly cactus, peach sprig, olive outline leaf across */}
      <Line d={leaf(-30, 150, 470, 120, -12, 0.25)} stroke={C.sage} w={2.5} />
      <Fill d={outline({ cx: 120, cy: 760, rx: 125, ry: 260, seed: 1, wob: 0.07 })} fill={C.forest} />
      <Fill d={outline({ cx: 70, cy: 460, rx: 72, ry: 150, rot: -10, seed: 2, wob: 0.1 })} fill={C.forest} delay={0.05} />
      <Fill d={outline({ cx: 86, cy: 245, rx: 46, ry: 110, rot: -8, seed: 3, wob: 0.12 })} fill={C.forest} delay={0.1} />
      <Fill d={outline({ cx: 178, cy: 360, rx: 46, ry: 104, rot: 26, seed: 4, wob: 0.12 })} fill={C.forest} delay={0.15} />
      <Fill d={outline({ cx: 250, cy: 505, rx: 42, ry: 78, rot: 38, seed: 5, wob: 0.14 })} fill={C.forest} delay={0.2} />
      <Fill d={outline({ cx: -15, cy: 360, rx: 42, ry: 86, rot: -24, seed: 6, wob: 0.12 })} fill={C.forest} delay={0.1} />
      <Fill d={outline({ cx: 245, cy: 760, rx: 78, ry: 125, rot: 12, seed: 7, wob: 0.1 })} fill={C.forest} delay={0.25} />
      <Fill d={outline({ cx: 205, cy: 520, rx: 46, ry: 46, petals: 6, seed: 1.3, wob: 0.12 })} fill={C.ember} delay={0.5} />
      <Line d={leaf(70, 900, 560, 150, -58, 0.2)} stroke={C.olive} w={2} />
      <Line d="M150 905 C170 820 205 740 268 660" stroke={C.peach} w={5} />
      {([[168, 845, -150], [185, 800, -20], [200, 760, -160], [215, 720, -30], [232, 690, -150], [248, 665, -40], [176, 870, -30]] as const).map(([x, y, ang], i) => (
        <Fill key={i} d={leaf(x, y, 66 - (i % 3) * 6, 26, ang, 0.05)} fill={C.peach} delay={0.35 + i * 0.05} />
      ))}
      <Fill d={outline({ cx: 505, cy: 140, rx: 82, ry: 82, petals: 8, seed: 2.2, wob: 0.1 })} fill={C.mustard} delay={0.4} />
      <circle cx={505} cy={140} r={13} fill="#fef1ec" />

      {/* CENTER: a mustard plant growing up beneath the title, with dark speckles and a curling stem */}
      <Line d="M400 905 C470 860 560 790 640 772" stroke={C.olive} w={2} />
      <Fill d={outline({ cx: 598, cy: 790, rx: 34, ry: 160, rot: -3, seed: 8, wob: 0.07 })} fill={C.mustard} delay={0.45} />
      <Fill d={outline({ cx: 515, cy: 835, rx: 30, ry: 112, rot: -30, seed: 9, wob: 0.09 })} fill={C.mustard} delay={0.5} />
      <Fill d={outline({ cx: 676, cy: 825, rx: 26, ry: 118, rot: 24, seed: 10, wob: 0.09 })} fill={C.mustard} delay={0.55} />
      <Fill d={outline({ cx: 598, cy: 885, rx: 82, ry: 34, seed: 11, wob: 0.08 })} fill={C.mustard} delay={0.4} />
      <Dots fill={C.forest} at={[[520, 765], [548, 752], [578, 770], [536, 800], [566, 812], [603, 795], [512, 832], [590, 840], [630, 820]]} />

      {/* RIGHT: peach star flower spilling from the top, a dark hill with a coral outline flourish,
          an olive lobed leaf, a navy outline blob with sage speckles */}
      <Fill d={outline({ cx: 1215, cy: 60, rx: 250, ry: 250, petals: 6, seed: 0.4, wob: 0.06 })} fill={C.peach} delay={0.1} />
      <Dots fill={C.ember} size={11} at={[[1130, 110], [1160, 150], [1190, 95], [1215, 140], [1245, 105], [1150, 190], [1200, 180], [1250, 165], [1110, 160], [1235, 210]]} />
      <Fill d={outline({ cx: 1400, cy: 300, rx: 230, ry: 90, rot: -14, seed: 12, wob: 0.12 })} fill={C.forest} delay={0.2} />
      <Fill d={outline({ cx: 1370, cy: 500, rx: 190, ry: 175, seed: 13, wob: 0.13 })} fill={C.forest} delay={0.25} />
      <Line d={outline({ cx: 1365, cy: 470, rx: 120, ry: 110, lobes: 7, lobeDepth: 0.55, seed: 0.7, wob: 0.08 })} stroke={C.ember} w={3} />
      <Line d="M1300 290 C1320 360 1380 380 1450 372" stroke={C.olive} w={2} />
      <Line d={outline({ cx: 1180, cy: 735, rx: 175, ry: 160, rot: -8, seed: 14, wob: 0.18 })} stroke={C.forest} w={2.2} />
      <Fill d={outline({ cx: 1320, cy: 715, rx: 175, ry: 200, rot: -28, lobes: 5, lobeDepth: 0.45, seed: 0.9, wob: 0.08 })} fill={C.olive} delay={0.35} />
      <Dots fill={C.sage} size={8} at={[[1080, 700], [1105, 680], [1130, 705], [1095, 730], [1125, 745], [1155, 690], [1150, 725], [1070, 745]]} />
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
      <svg aria-hidden className="pointer-events-none absolute right-0 top-[48px] h-[220px] w-[250px] sm:hidden" viewBox="0 0 300 264">
        <Fill d={outline({ cx: 255, cy: 0, rx: 130, ry: 130, petals: 6, seed: 0.4, wob: 0.06 })} fill={C.peach} />
        <Dots fill={C.ember} size={7} at={[[200, 30], [222, 55], [245, 28], [262, 60], [212, 85], [240, 92], [190, 60]]} />
        <Fill d={outline({ cx: 300, cy: 178, rx: 105, ry: 62, rot: -12, seed: 13, wob: 0.13 })} fill={C.forest} />
        <Line d={outline({ cx: 285, cy: 180, rx: 48, ry: 40, lobes: 7, lobeDepth: 0.55, seed: 0.7, wob: 0.08 })} stroke={C.ember} w={2} />
      </svg>
      <svg aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-[290px] w-[270px] sm:hidden" viewBox="0 0 300 330">
        <Line d={leaf(14, 330, 280, 80, -62, 0.2)} stroke={C.olive} w={1.6} />
        <Fill d={outline({ cx: 55, cy: 300, rx: 70, ry: 150, seed: 1, wob: 0.07 })} fill={C.forest} />
        <Fill d={outline({ cx: 28, cy: 158, rx: 38, ry: 78, rot: -12, seed: 3, wob: 0.12 })} fill={C.forest} />
        <Fill d={outline({ cx: 118, cy: 196, rx: 30, ry: 64, rot: 26, seed: 4, wob: 0.12 })} fill={C.forest} />
        <Fill d={outline({ cx: 112, cy: 236, rx: 26, ry: 26, petals: 6, seed: 1.3, wob: 0.12 })} fill={C.ember} />
        <Line d="M96 330 C110 290 135 250 170 214" stroke={C.peach} w={3.5} />
        {([[104, 305, -150], [114, 282, -20], [126, 258, -160], [140, 240, -30], [154, 224, -150]] as const).map(([x, y, a], i) => <Fill key={i} d={leaf(x, y, 38, 15, a, 0.05)} fill={C.peach} />)}
        <Fill d={outline({ cx: 252, cy: 300, rx: 17, ry: 70, rot: -4, seed: 8, wob: 0.07 })} fill={C.mustard} />
        <Fill d={outline({ cx: 222, cy: 318, rx: 15, ry: 48, rot: -30, seed: 9, wob: 0.09 })} fill={C.mustard} />
        <Fill d={outline({ cx: 280, cy: 316, rx: 13, ry: 50, rot: 24, seed: 10, wob: 0.09 })} fill={C.mustard} />
        <Dots fill={C.forest} size={4.5} at={[[236, 300], [250, 290], [263, 305], [244, 318], [270, 322]]} />
      </svg>
    </>
  );
}

/** A small cluster for the edge of a section: side picks which edge it bleeds off. */
export function EdgeGarden({ side, variant = 0, className = "" }: { side: "left" | "right"; variant?: number; className?: string }) {
  const flip = side === "right" ? "scale(-1 1) translate(-320 0)" : undefined;
  const sets = [
    <g key="a">
      <Line d={outline({ cx: 70, cy: 190, rx: 110, ry: 100, seed: 3, wob: 0.18 })} stroke={C.sage} w={2} />
      <Fill d={outline({ cx: 10, cy: 140, rx: 110, ry: 120, rot: -20, lobes: 5, lobeDepth: 0.45, seed: 1.1, wob: 0.08 })} fill={C.forest} />
      <Dots fill={C.peach} size={7} at={[[120, 250], [140, 232], [150, 262], [128, 280]]} />
    </g>,
    <g key="b">
      <Line d="M0 330 C60 290 120 230 170 150" stroke={C.peach} w={4} />
      {([[30, 312, -160], [55, 292, -40], [85, 262, -170], [110, 232, -50], [135, 200, -165], [158, 170, -55]] as const).map(([x, y, a], i) => <Fill key={i} d={leaf(x, y, 60, 24, a, 0.05)} fill={C.peach} />)}
      <Line d={leaf(-40, 120, 260, 70, -30, 0.2)} stroke={C.olive} w={2} />
    </g>,
    <g key="c">
      <Fill d={outline({ cx: 20, cy: 180, rx: 34, ry: 140, rot: 14, seed: 4, wob: 0.08 })} fill={C.mustard} />
      <Fill d={outline({ cx: 80, cy: 230, rx: 26, ry: 90, rot: 34, seed: 5, wob: 0.1 })} fill={C.mustard} />
      <Dots fill={C.forest} size={6} at={[[18, 160], [36, 190], [14, 215], [70, 225], [86, 250]]} />
      <Fill d={outline({ cx: 150, cy: 90, rx: 40, ry: 40, petals: 6, seed: 2, wob: 0.1 })} fill={C.ember} />
    </g>,
  ];
  return (
    <svg aria-hidden className={`pointer-events-none absolute hidden h-[360px] w-[320px] sm:block ${side === "left" ? "-left-[40px]" : "-right-[40px]"} ${className}`} viewBox="0 0 320 360">
      <g transform={flip}>{sets[variant % sets.length]}</g>
    </svg>
  );
}
