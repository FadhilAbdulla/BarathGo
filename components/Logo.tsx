/** BarathGo mark: a location pin with a forward chevron, in saffron with a green route dot. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="12" fill="var(--brand)" />
      <path d="M20 8.5c-5.3 0-9.5 4.1-9.5 9.3 0 6.6 9.5 13.7 9.5 13.7s9.5-7.1 9.5-13.7c0-5.2-4.2-9.3-9.5-9.3Z" fill="#fff" />
      <path d="m17.6 13.6 4.6 4.3-4.6 4.3" fill="none" stroke="var(--brand-deep)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="31.5" cy="31.5" r="3.5" fill="var(--green)" stroke="#fff" strokeWidth="1.6" />
    </svg>
  );
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
