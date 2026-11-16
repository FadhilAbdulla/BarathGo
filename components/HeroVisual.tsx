import { Icon } from "./Icon";

/** Illustration of the BarathGo passenger app: live map, assigned driver and trip progress. */
export function HeroVisual() {
  return (
    <div className="hero-visual" role="img" aria-label="Illustration of the BarathGo app showing a live route on a map and an assigned, verified driver arriving in 3 minutes">
      <div className="hero-visual__glow" aria-hidden="true" />
      <div className="phone" aria-hidden="true">
        <div className="phone__notch" />
        <div className="phone__screen">
          <svg className="phone__map" viewBox="0 0 280 330" preserveAspectRatio="xMidYMid slice">
            <rect width="280" height="330" fill="#eef2ee" />
            <path d="M-10 250 C 70 225, 130 290, 290 235" stroke="#cfe3f0" strokeWidth="22" fill="none" />
            <rect x="160" y="22" width="86" height="56" rx="10" fill="#d5ead8" />
            <rect x="20" y="26" width="62" height="40" rx="8" fill="#e2e7e3" />
            <rect x="104" y="96" width="50" height="50" rx="8" fill="#e2e7e3" />
            <rect x="182" y="112" width="72" height="44" rx="8" fill="#e2e7e3" />
            <rect x="22" y="128" width="58" height="52" rx="8" fill="#e2e7e3" />
            <rect x="182" y="180" width="70" height="30" rx="8" fill="#d5ead8" />
            <g stroke="#fff" strokeLinecap="round" fill="none">
              <path d="M0 88 H280" strokeWidth="12" />
              <path d="M92 0 V330" strokeWidth="12" />
              <path d="M168 0 V330" strokeWidth="10" />
              <path d="M0 168 H280" strokeWidth="10" />
              <path d="M0 300 L280 280" strokeWidth="10" />
            </g>
            <path d="M48 286 L92 286 L92 168 L168 168 L168 88 L226 88" stroke="#fff" strokeWidth="11" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            <path className="phone__route" d="M48 286 L92 286 L92 168 L168 168 L168 88 L226 88" stroke="#0459BF" strokeWidth="5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx="48" cy="286" r="12" fill="#12805c" opacity=".18" />
            <circle cx="48" cy="286" r="6.5" fill="#12805c" stroke="#fff" strokeWidth="2.5" />
            <path d="M226 62c-8 0-14 6-14 13.5 0 10 14 21.5 14 21.5s14-11.5 14-21.5C240 68 234 62 226 62Z" fill="#0459BF" stroke="#fff" strokeWidth="2.5" />
            <circle cx="226" cy="75.5" r="4.6" fill="#fff" />
            <g transform="translate(130 168)">
              <rect x="-14" y="-9" width="28" height="18" rx="6" fill="#0c1b2b" />
              <rect x="-7" y="-6" width="9" height="12" rx="2" fill="#9ccbe8" />
            </g>
          </svg>
          <div className="phone__eta">
            <strong>3 min</strong>
            <span>Driver arriving</span>
          </div>
          <div className="phone__sheet">
            <div className="phone__driver">
              <span className="phone__avatar">RK</span>
              <span className="phone__driver-copy">
                <strong>Driver · Sedan</strong>
                <small>
                  <Icon name="star" size={12} /> 4.9 · Verified
                </small>
              </span>
              <span className="phone__plate">DL 3C 4821</span>
            </div>
            <div className="phone__actions">
              <span>
                <Icon name="share" size={15} /> Share trip
              </span>
              <span className="phone__sos">SOS</span>
            </div>
          </div>
        </div>
      </div>
      <div className="chip chip--top" aria-hidden="true">
        <span className="chip__icon chip__icon--green">₹</span>
        <span>
          <strong>Fare confirmed</strong>
          <small>before you ride</small>
        </span>
      </div>
      <div className="chip chip--bottom" aria-hidden="true">
        <span className="chip__icon">
          <Icon name="users" size={18} />
        </span>
        <span>
          <strong>Driver-owned</strong>
          <small>Fairer earnings</small>
        </span>
      </div>
    </div>
  );
}
