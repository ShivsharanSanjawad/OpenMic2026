"use client";

import { useState } from "react";

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function QRUploader({ basePath, initialQr }: { basePath: string; initialQr: string }) {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(initialQr);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/${basePath}/settings`, { method: "PUT", body: formData });
    const raw = await response.text();
    let data: { error?: string; settings?: { upi_qr_url?: string } } = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (response.ok) {
      setPreview(data.settings?.upi_qr_url ?? preview);
      setMessage("Settings updated");
    } else {
      setMessage(data.error ?? "Update failed");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-zinc-800 p-4">
      <h3 className="text-lg font-semibold">QR + UPI Settings</h3>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Current QR" className="h-40 w-40 rounded-md object-cover" />
      ) : null}
      <input name="upi_id" placeholder="UPI ID" className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
      <input name="payment_amount" placeholder="Amount" className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
      <input name="event_date" placeholder="Event Date" className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
      <input name="event_venue" placeholder="Event Venue" className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
      <input name="qrImage" type="file" accept="image/*" className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
      <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-60">
        {saving ? <><Spinner />Saving…</> : "Save"}
      </button>
      {message ? <p className="text-sm text-amber-300">{message}</p> : null}
    </form>
  );
}
