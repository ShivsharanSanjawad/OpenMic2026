"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  qrUrl: string;
  upiId: string;
  amount: string;
};

export function UPIPaymentCard({ qrUrl, upiId, amount }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close on Escape + lock scroll
  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handler);
    };
  }, [lightboxOpen]);

  const lightbox = lightboxOpen && mounted ? createPortal(
    <div
      onClick={() => setLightboxOpen(false)}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        width: "100vw", height: "100vh",
        zIndex: 99999,
        backgroundColor: "rgba(0,0,0,0.93)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Close button — screen-level top-right */}
      <button
        onClick={() => setLightboxOpen(false)}
        style={{
          position: "fixed", top: "14px", right: "14px",
          zIndex: 100000,
          background: "#3f3f46", border: "2px solid rgba(255,255,255,0.2)",
          borderRadius: "50%", width: "36px", height: "36px",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: "white",
        }}
        aria-label="Close"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* QR image card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: "16px", padding: "12px",
          width: "min(85vw, 300px)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt="UPI QR Code"
          style={{ display: "block", width: "100%", height: "auto", maxHeight: "65vh", objectFit: "contain", borderRadius: "8px" }}
        />
      </div>
      <p style={{ marginTop: "12px", fontSize: "12px", color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
        Tap outside or press Esc to close
      </p>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {lightbox}

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/[0.08]">
              <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Make Payment</h3>
              <p className="text-sm text-zinc-500">Scan QR code or use UPI ID</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* QR code — smaller on mobile, larger on sm+ */}
            <div className="relative flex-shrink-0">
              {qrUrl ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group rounded-xl bg-white p-2 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 sm:rounded-2xl sm:p-4"
                  title="Tap to enlarge QR code"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="UPI QR Code" className="h-28 w-28 rounded-lg sm:h-44 sm:w-44" />
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <div className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white sm:text-xs">
                      Tap to enlarge
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-amber-400/40 bg-amber-950/20 sm:h-48 sm:w-48">
                  <p className="text-center text-xs text-amber-300/60">QR Not{"\n"}Available</p>
                </div>
              )}
            </div>

            {/* UPI info — fills remaining space */}
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-1">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">UPI ID</p>
                <p className="mt-1 truncate font-mono text-sm font-semibold text-white sm:text-base">{upiId || "Not configured"}</p>
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4 text-center sm:text-left">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Amount to Pay</p>
                <p className="mt-1 font-heading text-3xl text-amber-400 sm:text-4xl">₹{amount || "0"}</p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                <p className="text-xs text-zinc-400">After payment, upload a clear screenshot below.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
