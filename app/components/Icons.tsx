/** Thin line-art icons, navy strokes with a peach accent, like the reference's quiz cards. */
const S = { fill: "none", stroke: "#11223f", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const PEACH = "#f6bba4";

const ICONS: Record<string, React.ReactNode> = {
  footprints: (
    <>
      <ellipse cx="24" cy="36" rx="7" ry="11" fill={PEACH} transform="rotate(-12 24 36)" />
      <ellipse cx="42" cy="22" rx="7" ry="11" fill={PEACH} transform="rotate(14 42 22)" />
      <ellipse cx="22" cy="36" rx="7" ry="11" {...S} transform="rotate(-12 22 36)" />
      <ellipse cx="40" cy="22" rx="7" ry="11" {...S} transform="rotate(14 40 22)" />
      <circle cx="20" cy="50" r="3.5" {...S} /><circle cx="42" cy="37" r="3.5" {...S} />
    </>
  ),
  door: (
    <>
      <rect x="24" y="16" width="20" height="36" fill={PEACH} />
      <path d="M18 54 V20 a14 14 0 0 1 28 0 V54" {...S} />
      <path d="M12 54 H52" {...S} /><circle cx="39" cy="36" r="1.6" fill="#11223f" />
    </>
  ),
  bag: (
    <>
      <rect x="18" y="26" width="30" height="28" fill={PEACH} />
      <path d="M14 22 H50 L47 54 H17 Z" {...S} />
      <path d="M24 28 V18 a8 8 0 0 1 16 0 V28" {...S} />
    </>
  ),
  coins: (
    <>
      <ellipse cx="34" cy="22" rx="16" ry="6" fill={PEACH} />
      {[22, 30, 38, 46].map((y) => <path key={y} d={`M16 ${y} a16 6 0 0 0 32 0`} {...S} />)}
      <ellipse cx="32" cy="22" rx="16" ry="6" {...S} />
      <path d="M16 22 V46 M48 22 V46" {...S} />
    </>
  ),
  tag: (
    <>
      <path d="M34 14 H52 V32 L30 54 L14 38 Z" fill={PEACH} transform="translate(-2 2)" />
      <path d="M34 12 H52 V30 L30 52 L12 34 Z" {...S} />
      <circle cx="44" cy="20" r="3" {...S} />
      <path d="M44 20 C38 8 26 8 22 16" {...S} />
    </>
  ),
  cart: (
    <>
      <path d="M22 22 H52 L48 38 H25 Z" fill={PEACH} />
      <path d="M10 14 H18 L24 42 H48 L53 22 H20" {...S} />
      <circle cx="27" cy="50" r="3" {...S} /><circle cx="45" cy="50" r="3" {...S} />
    </>
  ),
};

export function Icon({ name, size = 64 }: { name: keyof typeof ICONS | string; size?: number }) {
  return <svg aria-hidden width={size} height={size} viewBox="0 0 64 64">{ICONS[name]}</svg>;
}
