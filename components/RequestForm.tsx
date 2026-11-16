"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { submitRequest, type SubmitKind } from "@/lib/submit";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "textarea" | "select";
  options?: readonly string[];
  required?: boolean;
  full?: boolean;
  autoComplete?: string;
  placeholder?: string;
};

type Status = { kind: "idle" | "sending" | "sent" | "mailto" | "error"; message?: string };

export function RequestForm({ id, kind, subject, fields, submitLabel, successMessage }: { id: string; kind: SubmitKind; subject: string; fields: Field[]; submitLabel: string; successMessage: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setStatus({ kind: "sending" });
    const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const result = await submitRequest(kind, subject, values);
    if (result.kind === "sent") form.reset();
    setStatus(result.kind === "error" ? { kind: "error", message: result.message } : { kind: result.kind });
  }

  return (
    <form className="form-card" onSubmit={onSubmit} aria-describedby={`${id}-status`}>
      <div className="form-grid">
        {fields.map((field) => {
          const fieldId = `${id}-${field.name}`;
          const common = { className: "field", id: fieldId, name: field.name, required: field.required, autoComplete: field.autoComplete, placeholder: field.placeholder };
          return (
            <div key={field.name} className={`field-group${field.full ? " full" : ""}`}>
              <label htmlFor={fieldId}>
                {field.label}
                {field.required ? "" : <span className="optional"> (optional)</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea {...common} rows={4} maxLength={4000} />
              ) : field.type === "select" ? (
                <select {...common} defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {field.options?.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input {...common} type={field.type ?? "text"} maxLength={200} inputMode={field.type === "tel" ? "tel" : undefined} min={field.type === "number" ? 0 : undefined} />
              )}
            </div>
          );
        })}
        <div className="hp" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Website</label>
          <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      <p className="form-note">
        By submitting you agree to be contacted about this request. See our <Link href="/privacy">privacy notice</Link>.
      </p>
      <button className="btn btn-primary btn-lg" type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : submitLabel}
      </button>
      <div id={`${id}-status`} className={`form-status form-status--${status.kind}`} role="status" aria-live="polite">
        {status.kind === "sent" && successMessage}
        {status.kind === "mailto" && "We’ve opened your email app with your details filled in. Press send to reach the BarathGo team."}
        {status.kind === "error" && status.message}
      </div>
    </form>
  );
}
