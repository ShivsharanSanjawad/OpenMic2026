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

export function QRUploader({
  basePath,
  initialQr,
  initialOpen,
  initialLegacyEnabled,
  initialAmounts,
}: {
  basePath: string;
  initialQr: string;
  initialOpen: boolean;
  initialLegacyEnabled: boolean;
  initialAmounts: { solo: string; group: string };
}) {
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [preview, setPreview] = useState(initialQr);
  const [saving, setSaving] = useState(false);
  const [regOpen, setRegOpen] = useState(initialOpen);
  const [legacyEnabled, setLegacyEnabled] = useState(initialLegacyEnabled);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    // Explicitly send current toggle value (checkbox only sends when checked)
    formData.set("registrations_open", regOpen ? "true" : "false");
    formData.set("legacy_10_year_enabled", legacyEnabled ? "true" : "false");
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
      setMessage({ text: "Settings saved successfully.", ok: true });
    } else {
      setMessage({ text: data.error ?? "Update failed", ok: false });
    }
    setSaving(false);
  }

  const inputCls = "w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-colors";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-gradient-to-r from-amber-500/10 to-orange-500/5 px-5 py-4">
        <h3 className="font-semibold text-amber-300">Event &amp; Payment Settings</h3>
        <p className="text-xs text-zinc-400 mt-0.5">Configure UPI, QR code, and registration status</p>
      </div>

      <div className="p-5 grid gap-5">
        {/* Registration Open/Close toggle */}
        <div className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${regOpen ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"}`}>
          <div>
            <p className={`font-semibold text-sm ${regOpen ? "text-green-300" : "text-red-300"}`}>
              Registration {regOpen ? "Open" : "Closed"}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {regOpen ? "Users can currently submit registrations." : "New registrations are blocked."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRegOpen((v) => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${regOpen ? "bg-green-500" : "bg-zinc-600"}`}
            role="switch"
            aria-checked={regOpen}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${regOpen ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>

        {/* Legacy page visibility toggle */}
        <div className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${legacyEnabled ? "border-amber-500/40 bg-amber-500/10" : "border-zinc-600/60 bg-zinc-800/40"}`}>
          <div>
            <p className={`font-semibold text-sm ${legacyEnabled ? "text-amber-300" : "text-zinc-300"}`}>
              10-Year Legacy Page {legacyEnabled ? "Visible" : "Hidden"}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {legacyEnabled ? "Legacy section and page are available on the website." : "Legacy section and page are hidden from users."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLegacyEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${legacyEnabled ? "bg-amber-500" : "bg-zinc-600"}`}
            role="switch"
            aria-checked={legacyEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${legacyEnabled ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>

        {/* Payment inputs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">UPI ID</label>
            <input name="upi_id" placeholder="e.g. spark@upi" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">Event Date</label>
            <input name="event_date" placeholder="e.g. March 15, 2026" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">Event Venue</label>
            <input name="event_venue" placeholder="e.g. SPIT Auditorium" className={inputCls} />
          </div>
        </div>

        {/* Per-type payment amounts */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Registration Amount (₹) by Type</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500">Solo</label>
              <input
                name="payment_amount_solo"
                type="number"
                min="0"
                placeholder="e.g. 100"
                defaultValue={initialAmounts.solo}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500">Group</label>
              <input
                name="payment_amount_group"
                type="number"
                min="0"
                placeholder="e.g. 150"
                defaultValue={initialAmounts.group}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* QR Image */}
        <div className="space-y-3">
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">QR Code Image</label>
          {preview ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Current QR" className="h-32 w-32 rounded-xl border border-zinc-700 object-cover" />
              <p className="text-xs text-zinc-500">Upload a new image to replace</p>
            </div>
          ) : null}
          <input name="qrImage" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-amber-500/20 file:px-3 file:py-1 file:text-amber-300 file:text-xs file:font-medium hover:file:bg-amber-500/30" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-black hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 transition-all"
          >
            {saving ? <><Spinner />Saving…</> : "Save Settings"}
          </button>
          {message && (
            <p className={`text-sm font-medium ${message.ok ? "text-green-400" : "text-red-400"}`}>
              {message.ok ? "✓ " : "✕ "}{message.text}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
