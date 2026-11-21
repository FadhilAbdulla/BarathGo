import type { RideTypeId } from "@/lib/fares";

/** Flat side-view vehicle illustrations (viewBox 120×60). */
function Wheel({ x, r = 8.5 }: { x: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={46} r={r} fill="#1b1d21" />
      <circle cx={x} cy={46} r={r * 0.45} fill="#c9ced6" />
    </g>
  );
}

const shadow = <ellipse cx="60" cy="55" rx="52" ry="3.5" fill="#000" opacity=".12" />;

const art: Record<RideTypeId, React.ReactNode> = {
  auto: (
    <>
      {shadow}
      <path d="M18 47V25C18 13 27 8 38 8h32c6 0 9 3 11 8l6 15 12 3c5 1 7 4 7 9v4Z" fill="#1d7a4a" />
      <path d="M20 23C20 13 28 9.5 38 9.5h32c5 0 8 2.5 9.5 6.5l2.6 7Z" fill="#f4c430" />
      <path d="M44 24h16v14H44z" fill="#14532f" />
      <path d="M64 24h13l4 12H64z" fill="#bfe3f5" />
      <path d="M86 31l-4-11" stroke="#14532f" strokeWidth="2" />
      <Wheel x={34} r={8} />
      <Wheel x={97} r={7} />
    </>
  ),
  mini: (
    <>
      {shadow}
      <path d="M14 43c0-7 4-10 10-11l13-2 10-12c2-3 5-4 9-4h27c6 0 8 3 10 7l6 9c7 1 10 5 10 11v3c0 2-1 3-3 3H17c-2 0-3-1-3-3Z" fill="#ffffff" stroke="#cfd5dd" strokeWidth="1.5" />
      <path d="M41 30l8-10c1.5-2 3-2.5 6-2.5h9V30Z" fill="#2a3340" />
      <path d="M68 17.5h14c4 0 6 2 7.5 4.5L95 30H68Z" fill="#2a3340" />
      <path d="M14 38h7M99 38h7" stroke="#cfd5dd" strokeWidth="2" />
      <Wheel x={34} />
      <Wheel x={90} />
    </>
  ),
  sedan: (
    <>
      {shadow}
      <path d="M7 41c0-6 4-9 10-10l18-3 13-12c3-2.5 6-3.5 10-3.5h21c5 0 9 1.5 12 4.5l12 11 9 1.5c5 1 7 4 7 9v6c0 1.5-1 2.5-2.5 2.5h-107C8 47 7 46 7 44.5Z" fill="#2b2f36" />
      <path d="M39 28l11-10c2-1.5 4-2 7-2h9v12Z" fill="#a9c7e8" />
      <path d="M70 16h9c4 0 7 1 9.5 3.5L98 28H70Z" fill="#a9c7e8" />
      <path d="M8 38h6M108 36h6" stroke="#f6c64a" strokeWidth="2.5" strokeLinecap="round" />
      <Wheel x={30} />
      <Wheel x={94} />
    </>
  ),
  suv: (
    <>
      {shadow}
      <path d="M6 44V32c0-4 2-6 7-7l15-2 9-13c2-2.5 4-3.5 8-3.5h50c5 0 7 2 9 5l6 11.5c5 1 7 4 7 8V44c0 2-1 3-3 3H9c-2 0-3-1-3-3Z" fill="#8e99a8" />
      <path d="M32 23l8-11c1.5-2 3-2.5 5.5-2.5H62V23Z" fill="#2a3340" />
      <path d="M66 9.5h19V23H66zM89 9.5h4c3 0 4.5 1 5.5 3l5 10.5H89Z" fill="#2a3340" />
      <path d="M40 4h58" stroke="#5d6775" strokeWidth="3" strokeLinecap="round" />
      <Wheel x={30} r={10} />
      <Wheel x={92} r={10} />
    </>
  ),
  ev: (
    <>
      {shadow}
      <path d="M7 41c0-6 4-9 10-10l18-3 13-12c3-2.5 6-3.5 10-3.5h21c5 0 9 1.5 12 4.5l12 11 9 1.5c5 1 7 4 7 9v6c0 1.5-1 2.5-2.5 2.5h-107C8 47 7 46 7 44.5Z" fill="#0459BF" />
      <path d="M39 28l11-10c2-1.5 4-2 7-2h9v12Z" fill="#cfe2fa" />
      <path d="M70 16h9c4 0 7 1 9.5 3.5L98 28H70Z" fill="#cfe2fa" />
      <path d="M64 31l-5 8h5l-3 7 8-10h-5l3-5Z" fill="#7ef0b0" />
      <Wheel x={30} />
      <Wheel x={94} />
    </>
  ),
};

export function VehicleArt({ type, className }: { type: RideTypeId; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" aria-hidden="true" focusable="false">
      {art[type]}
    </svg>
  );
}
