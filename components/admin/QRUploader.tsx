"use client";

import { useState } from "react";

export function QRUploader({ basePath, initialQr }: { basePath: string; initialQr: string }) {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(initialQr);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      <button className="rounded-md bg-amber-500 px-3 py-2 font-semibold text-black">Save</button>
      {message ? <p className="text-sm text-amber-300">{message}</p> : null}
    </form>
  );
}
