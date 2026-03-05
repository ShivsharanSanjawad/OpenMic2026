"use client";

import { useEffect, useState } from "react";

type Props = {
  qrUrl: string;
  upiId: string;
  amount: string;
};

export function UPIPaymentCard({ qrUrl, upiId, amount }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen]);

  return (
    <>
      {/* Lightbox overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="rounded-3xl bg-white p-6 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="UPI QR Code" className="h-72 w-72 rounded-xl sm:h-96 sm:w-96" />
            </div>
            <p className="text-sm text-white/60">Tap outside or press Esc to close</p>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-950/40 to-orange-950/40 p-6 shadow-2xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-orange-600/10"></div>
        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-2">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Make Payment</h3>
              <p className="text-amber-200/80">Scan QR code or use UPI ID</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="relative">
              {qrUrl ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group rounded-2xl bg-white p-4 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  title="Click to enlarge QR code"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="UPI QR Code" className="h-48 w-48 rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 transition-colors group-hover:bg-black/10">
                    <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Enlarge
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex h-56 w-56 items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-950/20">
                  <p className="text-center text-sm text-amber-300/60">QR Code{"\n"}Not Available</p>
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                ₹{amount || "0"}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-medium text-amber-200">UPI ID</p>
                <p className="text-lg font-mono text-white">{upiId || "Not configured"}</p>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 p-4">
                <p className="text-sm font-medium text-emerald-200">Payment Amount</p>
                <p className="text-2xl font-bold text-white">₹{amount || "0"}</p>
              </div>

              <div className="rounded-xl bg-blue-500/20 p-4">
                <p className="text-xs text-blue-200">📸 After payment, upload a clear screenshot below</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
