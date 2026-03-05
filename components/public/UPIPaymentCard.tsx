type Props = {
  qrUrl: string;
  upiId: string;
  amount: string;
};

export function UPIPaymentCard({ qrUrl, upiId, amount }: Props) {
  return (
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
              <div className="rounded-2xl bg-white p-4 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="UPI QR Code" className="h-48 w-48 rounded-lg" />
              </div>
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-950/20">
                <p className="text-center text-sm text-amber-300/60">QR Code\nNot Available</p>
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
  );
}
