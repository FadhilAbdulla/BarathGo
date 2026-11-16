/** BarathGo emblem (official logo without the wordmark), from public/brand/barathgo-mark.svg. */
export function LogoMark({ size = 40 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/barathgo-mark.svg" width={size} height={size} alt="" className="logo__mark" />;
}

export function Logo({ invert = false }: { invert?: boolean }) {
  return (
    <span className={`logo${invert ? " logo--invert" : ""}`}>
      <LogoMark />
      <span className="logo__text">
        <span className="logo__name">
          Barath<span>Go</span>
        </span>
        <span className="logo__sub">An NFTCI initiative</span>
      </span>
    </span>
  );
}
