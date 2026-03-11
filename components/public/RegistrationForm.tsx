"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DynamicField, PublicSettings } from "@/types";
import { UPIPaymentCard } from "@/components/public/UPIPaymentCard";

type Props = {
  settings: PublicSettings;
};

export function RegistrationForm({ settings }: Props) {
  const [performanceType, setPerformanceType] = useState("solo");
  const [teamMembers, setTeamMembers] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [copied, setCopied] = useState(false);
  const maxScriptBytes = 2 * 1024 * 1024;
  const maxScreenshotBytes = 1 * 1024 * 1024;

  const showTeamField = useMemo(() => performanceType === "duo" || performanceType === "group", [performanceType]);

  useEffect(() => {
    if (!showTeamField) {
      setTeamMembers([""]);
    } else if (performanceType === "duo" && teamMembers.length < 2) {
      setTeamMembers(["", ""]);
    }
  }, [showTeamField, performanceType, teamMembers.length]);

  function getMitigation(message: string) {
    const value = message.toLowerCase();

    if (value.includes("script") && (value.includes("1mb") || value.includes("2mb"))) {
      return "Compress the script or upload a shorter file under 2MB.";
    }

    if (value.includes("payment screenshot") || value.includes("image")) {
      return "Upload a clear image file (JPG/PNG/WebP) and retry.";
    }

    if (value.includes("rate limit")) {
      return "Please wait for some time before trying again.";
    }

    if (value.includes("invalid registration data")) {
      return "Check required fields, phone number, and format, then submit again.";
    }

    if (value.includes("network") || value.includes("unable to submit")) {
      return "Check your internet connection and refresh the page before retrying.";
    }

    return "Retry once. If it still fails, contact support with your issue details.";
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const cleanedMembers = teamMembers.map((member) => member.trim()).filter(Boolean);

    if (performanceType === "duo" && cleanedMembers.length < 2) {
      setError("Duo performance requires both members' names.");
      setLoading(false);
      return;
    }

    if (showTeamField && cleanedMembers.length === 0) {
      setError("Please add at least one team member name for group performance.");
      setLoading(false);
      return;
    }

    if (showTeamField) {
      formData.set("teamMembers", cleanedMembers.join(", "));
    } else {
      formData.delete("teamMembers");
    }

    const screenshotFile = formData.get("paymentScreenshot");
    if (screenshotFile instanceof File && screenshotFile.size > maxScreenshotBytes) {
      setError("Payment screenshot must be 1MB or smaller.");
      setLoading(false);
      return;
    }
    const allowedScreenshotTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
    if (screenshotFile instanceof File && screenshotFile.size > 0 && !allowedScreenshotTypes.has(screenshotFile.type)) {
      setError("Payment screenshot must be a JPG, PNG, or WebP image.");
      setLoading(false);
      return;
    }

    const scriptFile = formData.get("scriptFile");
    if (scriptFile instanceof File && scriptFile.size > maxScriptBytes) {
      setError("Script file must be 2MB or smaller.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        const detailMessage = Array.isArray(data.details)
          ? data.details
              .map((item: { field?: string; message?: string }) => `${item.field ?? "field"}: ${item.message ?? "invalid"}`)
              .join(" | ")
          : "";
        const baseError = detailMessage
          ? `${data.error ?? "Registration failed"} (${detailMessage})`
          : (data.error ?? "Registration failed");
        setError(`${baseError} Mitigation: ${getMitigation(baseError)}`);
      } else {
        form.reset();
        setTeamMembers([""]);
        setSubmittedId(data.registrationId);
      }
    } catch {
      const message = "Unable to submit registration. Please try again.";
      setError(`${message} Mitigation: ${getMitigation(message)}`);
    } finally {
      setLoading(false);
    }
  }

  async function copyId() {
    await navigator.clipboard.writeText(submittedId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Success card (replaces form after submission) ─────────────────────────
  if (submittedId) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 text-center space-y-6 sm:p-8">
        {/* Checkmark */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/[0.08]">
          <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div>
          <h2 className="font-heading text-3xl tracking-wide text-white">You&apos;re Registered!</h2>
          <p className="mt-2 text-sm text-zinc-400">Your registration has been received and is pending payment verification.</p>
        </div>

        {/* Registration ID */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Your Registration ID</p>
          <p className="mt-2 font-heading text-2xl tracking-wider text-amber-400 break-all sm:text-3xl">{submittedId}</p>
          <button
            type="button"
            onClick={copyId}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/[0.08]"
          >
            {copied ? (
              <><svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied</>
            ) : (
              <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy ID</>
            )}
          </button>
        </div>

        {/* Info boxes — consistent style */}
        <div className="grid gap-3 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400 mb-1.5">Check Email</p>
            <p className="text-sm text-zinc-400">Confirmation sent to your inbox. Check <span className="font-semibold text-white">spam/junk</span> too.</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400 mb-1.5">Save Your ID</p>
            <p className="text-sm text-zinc-400">You&apos;ll need it to <span className="font-semibold text-white">check your status</span> and get updates.</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400 mb-1.5">Verification</p>
            <p className="text-sm text-zinc-400">You can <span className="font-semibold text-white">only perform once VERIFIED</span>. We&apos;ll review your payment soon.</p>
          </div>
        </div>

        {/* Next step */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-zinc-500">
          Use the <span className="font-semibold text-amber-400">Check Status</span> section below to track your verification anytime.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-10">
          {/* ── Step 1: Payment ── */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/[0.08] font-mono text-xs font-semibold text-amber-400">1</span>
              <h2 className="font-heading text-2xl tracking-wide text-white sm:text-3xl">Payment</h2>
            </div>
            <UPIPaymentCard
              qrUrl={settings.upi_qr_url}
              upiId={settings.upi_id}
              amount={
                performanceType === "duo"
                  ? settings.payment_amount_duo
                  : performanceType === "group"
                  ? settings.payment_amount_group
                  : settings.payment_amount_solo
              }
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* ── Step 2: Registration Details ── */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/[0.08] font-mono text-xs font-semibold text-amber-400">2</span>
              <h2 className="font-heading text-2xl tracking-wide text-white sm:text-3xl">Registration Details</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input name="name" label="Full Name" required />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Email Address *</label>
              <input name="email" type="email" required className="input-field" />
              <p className="text-xs text-amber-300/80">⚠️ Double-check this. Your Registration ID and all updates will be sent to this email.</p>
            </div>
            <Input name="phone" label="Phone Number" required maxLength={10} />
            <Input name="college" label="College / Institution" />

            <CustomSelect
              name="performanceType"
              label="Performance Type"
              required
              value={performanceType}
              onChange={setPerformanceType}
              options={[
                { value: "solo", label: "Solo Performance" },
                { value: "duo", label: "Duo Performance" },
                { value: "group", label: "Group Performance" },
              ]}
            />

            <Input name="performanceTitle" label="Performance Title" placeholder="e.g. My Amazing Song" />
            <Input name="duration" label="Performance Duration" placeholder="e.g. 3 minutes" />

            {/* Selection summary — fills the empty grid cell beside Duration */}
            <div className="flex flex-col justify-center rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] px-5 py-4 gap-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Selected</p>
              <p className="text-base font-semibold text-white">
                {performanceType === "solo" ? "Solo Performance" : performanceType === "duo" ? "Duo Performance" : "Group Performance"}
              </p>
              <p className="font-mono text-lg font-bold text-amber-400">
                ₹
                {performanceType === "duo"
                  ? settings.payment_amount_duo
                  : performanceType === "group"
                  ? settings.payment_amount_group
                  : settings.payment_amount_solo}
              </p>
              <p className="text-[11px] text-zinc-500">Registration fee</p>
            </div>
          </div>

          {showTeamField && (
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-white"> Team Members</h3>
              <input type="hidden" name="teamMembers" value={teamMembers.map((member) => member.trim()).filter(Boolean).join(", ")} />
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div key={`member-${index}`} className="flex items-center gap-3 rounded-xl bg-zinc-900/50 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <input
                      value={member}
                      onChange={(e) => {
                        setTeamMembers((current) => current.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)));
                      }}
                      placeholder={`Team member ${index + 1} name`}
                      required={performanceType === "duo" || undefined}
                      className="input-field flex-grow"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setTeamMembers((current) => {
                          const min = performanceType === "duo" ? 2 : 1;
                          if (current.length <= min) return current;
                          return current.filter((_, itemIndex) => itemIndex !== index);
                        });
                      }}
                      disabled={teamMembers.length <= (performanceType === "duo" ? 2 : 1)}
                      className="rounded-full bg-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setTeamMembers((current) => [...current, ""])}
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-300 transition-colors hover:border-amber-500/50 hover:bg-amber-500/20"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Team Member
              </button>
            </div>
          )}

          {(settings.form_fields ?? []).map((field) => (
            <DynamicFieldInput key={field.id} field={field} />
          ))}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent md:col-span-2" />

          {/* ── Step 3: Uploads ── */}
          <div className="md:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/[0.08] font-mono text-xs font-semibold text-amber-400">3</span>
              <h2 className="font-heading text-2xl tracking-wide text-white sm:text-3xl">Uploads</h2>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-white">Payment Screenshot *</h3>
                  <p className="mt-0.5 text-xs text-zinc-500">Upload your payment confirmation (JPG, PNG, or WebP)</p>
                </div>
                <input
                  name="paymentScreenshot"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  required
                  className="input-field file:mr-4 file:rounded-lg file:border-0 file:bg-amber-400/[0.08] file:px-4 file:py-2 file:text-amber-300 file:hover:bg-amber-400/[0.14]"
                />
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-white">Script Upload <span className="font-normal text-zinc-500">(Optional)</span></h3>
                  <p className="mt-0.5 text-xs text-zinc-500">Upload your performance script — max 2MB</p>
                </div>
                <input
                  name="scriptFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  className="input-field file:mr-4 file:rounded-lg file:border-0 file:bg-amber-400/[0.08] file:px-4 file:py-2 file:text-amber-300 file:hover:bg-amber-400/[0.14]"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-amber-400 py-3.5 font-mono text-sm uppercase tracking-widest text-slate-900 shadow-lg shadow-amber-400/20 transition-all duration-300 hover:scale-[1.02] hover:bg-amber-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Registration"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DynamicFieldInput({ field }: { field: DynamicField }) {
  if (field.type === "textarea") {
    return (
      <div className="space-y-2 md:col-span-2">
        <label className="block text-sm font-semibold text-white">
          {field.label}{field.required && " *"}
        </label>
        <textarea name={`dynamic_${field.id}`} required={field.required} className="input-field" rows={3} />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-zinc-900/30 p-4 md:col-span-2">
        <input 
          type="checkbox" 
          name={`dynamic_${field.id}`} 
          className="h-5 w-5 rounded bg-zinc-800 border-zinc-600 text-amber-500 focus:ring-amber-500" 
        />
        <label className="text-sm font-medium text-white">{field.label}</label>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <CustomSelect
        name={`dynamic_${field.id}`}
        label={field.label}
        required={field.required}
        options={(field.options ?? []).map((opt) => ({ value: opt, label: opt }))}
        placeholder="Select an option"
      />
    );
  }

  return <Input name={`dynamic_${field.id}`} label={field.label} required={field.required} />;
}

function Input({
  name,
  label,
  type = "text",
  required,
  className,
  placeholder,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <label className="block text-sm font-semibold text-white">
        {label}{required && " *"}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className="input-field"
      />
    </div>
  );
}

function CustomSelect({
  name,
  label,
  required,
  value: controlledValue,
  onChange: controlledOnChange,
  options,
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = controlledValue ?? internalValue;
  const selectedLabel = options.find((o) => o.value === selected)?.label ?? placeholder ?? "Select…";
  const isEmpty = !selected;

  const choose = useCallback(
    (val: string) => {
      if (controlledOnChange) controlledOnChange(val);
      else setInternalValue(val);
      setOpen(false);
    },
    [controlledOnChange],
  );

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={ref}>
      <label className="block text-sm font-semibold text-white">
        {label}{required && " *"}
      </label>

      {/* Hidden native input for form submission + validation */}
      <input type="hidden" name={name} value={selected} />
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          className="absolute opacity-0 h-0 w-0 pointer-events-none"
          value={selected}
          onChange={() => {}}
          required
        />
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative w-full rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
          open
            ? "border-amber-400/40 bg-white/[0.05] shadow-[0_0_0_3px_rgba(245,158,11,0.08)]"
            : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12]"
        }`}
      >
        <span className={isEmpty ? "text-zinc-500" : "text-zinc-100"}>{selectedLabel}</span>
        <svg
          className={`absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="relative z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c1021] shadow-2xl shadow-black/60">
          <ul className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => choose(opt.value)}
                  className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm transition-colors ${
                    opt.value === selected
                      ? "bg-amber-400/[0.10] text-amber-300"
                      : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {/* Indicator dot */}
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      opt.value === selected ? "bg-amber-400" : "bg-transparent"
                    }`}
                  />
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
