"use client";

import { Icon } from "./Icon";
import { VehicleArt } from "./Vehicles";
import { MapView, type MapMarker } from "./app/MapView";

const heroCars: MapMarker[] = [
  { id: "c1", kind: "car", lat: 28.6336, lng: 77.2205 },
  { id: "c2", kind: "car", lat: 28.6289, lng: 77.2128 },
  { id: "c3", kind: "car", lat: 28.6362, lng: 77.2131 },
  { id: "c4", kind: "car", lat: 28.6268, lng: 77.2232 },
  { id: "c5", kind: "car", lat: 28.6301, lng: 77.2262 },
  { id: "p", kind: "pickup", lat: 28.6315, lng: 77.2167, label: "Pickup" },
];

/** Hero visual: a real (non-interactive) map of Connaught Place with nearby cars and a ride card. */
export function HeroMap() {
  return (
    <div className="hero-map" role="img" aria-label="Map of central New Delhi showing BarathGo cars near a pickup point, and a Sedan arriving in 3 minutes for ₹125">
      <MapView markers={heroCars} fit={heroCars} fitKey="hero" interactive={false} padding={{ top: 40, right: 40, bottom: 140, left: 40 }} />
      <div className="hero-map__card" aria-hidden="true">
        <VehicleArt type="sedan" className="hero-map__car" />
        <div>
          <strong>Sedan</strong>
          <small>3 min away · 4 seats</small>
        </div>
        <strong className="hero-map__fare">₹125</strong>
      </div>
    </div>
  );
}

function Phone({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="phone-mock" role="img" aria-label={label}>
      <div className="phone-mock__screen" aria-hidden="true">
        <div className="phone-mock__bar">
          <span>9:41</span>
          <span className="phone-mock__notch" />
          <span>5G</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function DriverMock() {
  return (
    <Phone label="BarathGo driver app showing a new Sedan request: you earn ₹113, 0.8 km to pickup, from Connaught Place to India Gate">
      <div className="mock-pad">
        <div className="today">
          <div>
            <span>Today</span>
            <strong>₹1,840</strong>
          </div>
          <div>
            <span>Trips</span>
            <strong>11</strong>
          </div>
          <div>
            <span>Rating</span>
            <strong>★ 4.9</strong>
          </div>
        </div>
        <div className="offer">
          <div className="offer__head">
            <span className="offer__tag">New request · Sedan</span>
            <span className="offer__pay">UPI</span>
          </div>
          <div className="offer__money">
            <strong>₹113</strong>
            <span>you earn · fare ₹125</span>
          </div>
          <p className="offer__away">0.8 km to pickup · trip 4.7 km</p>
          <div className="tripcard__route">
            <span className="tripcard__line" />
            <p>
              <span className="place__mark place__mark--pickup" />
              Connaught Place
            </p>
            <p>
              <span className="place__mark place__mark--drop" />
              India Gate
            </p>
          </div>
          <div className="offer__actions">
            <span className="btn btn-gray">Decline</span>
            <span className="btn btn-brand">Accept</span>
          </div>
        </div>
      </div>
    </Phone>
  );
}

export function SafetyMock() {
  return (
    <Phone label="BarathGo rider app during a trip: verified driver card, 4-digit start PIN, and Call, Share trip and SOS buttons">
      <div className="mock-pad status">
        <h3 className="mock-title">Driver arriving in 3 min</h3>
        <div className="driver">
          <span className="avatar avatar--lg">R</span>
          <div className="driver__info">
            <strong>Ravi K.</strong>
            <small>★ 4.9 · 1,204 trips</small>
          </div>
          <div className="driver__car">
            <span className="plate">DL 3C 4821</span>
            <small>Dzire</small>
          </div>
        </div>
        <div className="pinbox">
          <span>Share PIN to start</span>
          <strong>
            <i>8</i>
            <i>5</i>
            <i>0</i>
            <i>3</i>
          </strong>
        </div>
        <div className="actions">
          <span className="action">
            <Icon name="phone" size={18} />
            Call
          </span>
          <span className="action">
            <Icon name="share" size={18} />
            Share
          </span>
          <span className="action action--sos">
            <Icon name="alert" size={18} />
            SOS
          </span>
        </div>
      </div>
    </Phone>
  );
}

export function BusinessMock() {
  const rows = [
    ["Priya S.", "Airport T3", "Sedan", "₹640"],
    ["Arjun M.", "Nehru Place", "Mini", "₹210"],
    ["Guest: Dr. Rao", "Hotel Ashok", "SUV", "₹480"],
    ["Neha T.", "Gurugram Cyber City", "EV", "₹520"],
  ];
  return (
    <div className="browser-mock" role="img" aria-label="BarathGo for Business dashboard showing monthly spend, trips by employee and a single invoice">
      <div className="browser-mock__bar" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="browser-mock__body" aria-hidden="true">
        <div className="kpis kpis--3">
          <div className="kpi">
            <span>This month</span>
            <strong>₹2.4L</strong>
          </div>
          <div className="kpi">
            <span>Trips</span>
            <strong>486</strong>
          </div>
          <div className="kpi">
            <span>Invoice</span>
            <strong>1</strong>
          </div>
        </div>
        <table className="table">
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td className="num">{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
