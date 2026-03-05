"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [success, setSuccess] = useState("");
  const maxScriptBytes = 2 * 1024 * 1024;
  const maxScreenshotBytes = 1 * 1024 * 1024;

  const showTeamField = useMemo(() => performanceType === "duo" || performanceType === "group", [performanceType]);

  useEffect(() => {
    if (!showTeamField) {
      setTeamMembers([""]);
    }
  }, [showTeamField]);

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
    setSuccess("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const cleanedMembers = teamMembers.map((member) => member.trim()).filter(Boolean);

    if (showTeamField && cleanedMembers.length === 0) {
      setError("Please add at least one team member name for duo/group performance.");
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
        setSuccess(`Registration successful! Your ID is: ${data.registrationId}. Please save it to check your status later.`);
      }
    } catch {
      const message = "Unable to submit registration. Please try again.";
      setError(`${message} Mitigation: ${getMitigation(message)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-3xl"></div>
      <div className="card relative">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white">Registration Form</h2>
          <p className="mt-2 text-zinc-400">Fill in your details to secure your spot</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="rounded-2xl border border-gradient-to-r from-amber-500/20 to-orange-500/20 bg-gradient-to-br from-amber-950/20 to-orange-950/20 p-6">
            <UPIPaymentCard qrUrl={settings.upi_qr_url} upiId={settings.upi_id} amount={settings.payment_amount} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input name="name" label="Full Name" required />
            <Input name="email" label="Email Address" type="email" required />
            <Input name="phone" label="Phone Number" required maxLength={10} />
            <Input name="college" label="College / Institution" />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Performance Type *</label>
              <select
                name="performanceType"
                required
                value={performanceType}
                onChange={(e) => setPerformanceType(e.target.value)}
                className="input-field"
              >
                <option value="solo">🎤 Solo Performance</option>
                <option value="duo">👥 Duo Performance</option>
                <option value="group">🎭 Group Performance</option>
              </select>
            </div>

            <Input name="performanceTitle" label="Performance Title" placeholder="e.g. My Amazing Song" />
            <Input name="duration" label="Performance Duration" placeholder="e.g. 3 minutes" />
          </div>

          {showTeamField && (
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-white">👥 Team Members</h3>
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
                      className="input-field flex-grow"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setTeamMembers((current) => {
                          if (current.length <= 1) return current;
                          return current.filter((_, itemIndex) => itemIndex !== index);
                        });
                      }}
                      disabled={teamMembers.length <= 1}
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

          {settings.form_fields.map((field) => (
            <DynamicFieldInput key={field.id} field={field} />
          ))}

          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-950/30 to-emerald-950/30 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-300">Payment Screenshot *</h3>
                  <p className="text-sm text-green-200/70">Upload your payment confirmation</p>
                </div>
              </div>
              <input
                name="paymentScreenshot"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                required
                className="input-field file:mr-4 file:rounded-lg file:border-0 file:bg-green-600/20 file:px-4 file:py-2 file:text-green-300 file:hover:bg-green-600/30"
              />
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-indigo-950/30 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-blue-500/20 p-2">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-300">Script Upload (Optional)</h3>
                  <p className="text-sm text-blue-200/70">Upload your performance script (max 2MB)</p>
                </div>
              </div>
              <input
                name="scriptFile"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf"
                className="input-field file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600/20 file:px-4 file:py-2 file:text-blue-300 file:hover:bg-blue-600/30"
              />
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
            {success && (
              <div className="rounded-xl border border-green-500/30 bg-green-950/30 p-4">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-300">{success}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Registration...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🚀 Submit Registration
                </span>
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
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          {field.label}{field.required && " *"}
        </label>
        <select name={`dynamic_${field.id}`} required={field.required} className="input-field">
          <option value="">Select an option</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
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
