"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { type User, api } from "@/lib/api";

/** Phone → 6-digit code → (new users) name. Calls onDone with the signed-in user. */
export function AuthPanel({ title, subtitle, onDone }: { title: string; subtitle: string; onDone: (user: User) => void }) {
  const [step, setStep] = useState<"phone" | "code" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const user = useRef<User | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await api<{ phone: string; devCode?: string }>("/auth/otp", { phone });
      setDevCode(result.devCode ?? null);
      if (result.devCode) setCode(result.devCode);
      setStep("code");
      setResendIn(30);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await api<{ user: User }>("/auth/verify", { phone, code });
      user.current = result.user;
      if (result.user.name) onDone(result.user);
      else setStep("name");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveName(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onDone((await api<{ user: User }>("/me", { name })).user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <h1 className="auth__title">{step === "name" ? "What’s your name?" : title}</h1>
      <p className="auth__sub">{step === "phone" ? subtitle : step === "code" ? `Enter the 6-digit code sent to +91 ${phone.replace(/\D/g, "").slice(-10)}` : "Drivers will see this when you book."}</p>

      {step === "phone" && (
        <form onSubmit={sendCode}>
          <label className="sr-only" htmlFor="auth-phone">
            Mobile number
          </label>
          <div className="phone-field">
            <span className="phone-field__cc">🇮🇳 +91</span>
            <input id="auth-phone" className="input" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Mobile number" value={phone} onChange={(event) => setPhone(event.target.value.replace(/[^\d ]/g, "").slice(0, 12))} autoFocus required />
          </div>
          <button className="btn btn-black btn-block btn-lg" disabled={busy || phone.replace(/\D/g, "").length < 10}>
            {busy ? "Sending…" : "Continue"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verify}>
          <label className="sr-only" htmlFor="auth-code">
            6-digit code
          </label>
          <input id="auth-code" className="input input--code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} autoFocus required />
          {devCode && <p className="auth__dev">Test mode: code {devCode} filled in for you (no SMS is sent).</p>}
          <button className="btn btn-black btn-block btn-lg" disabled={busy || code.length !== 6}>
            {busy ? "Verifying…" : "Verify"}
          </button>
          <div className="auth__row">
            <button type="button" className="link-btn" onClick={() => { setStep("phone"); setCode(""); setError(null); }}>
              Change number
            </button>
            <button type="button" className="link-btn" disabled={resendIn > 0 || busy} onClick={() => sendCode()}>
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}

      {step === "name" && (
        <form onSubmit={saveName}>
          <label className="sr-only" htmlFor="auth-name">
            Full name
          </label>
          <input id="auth-name" className="input" autoComplete="name" placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} autoFocus required maxLength={80} />
          <button className="btn btn-black btn-block btn-lg" disabled={busy || !name.trim()}>
            {busy ? "Saving…" : "Continue"}
          </button>
        </form>
      )}

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      <p className="auth__legal">
        By continuing you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy notice</Link>, and to receive an SMS with your login code.
      </p>
    </div>
  );
}
