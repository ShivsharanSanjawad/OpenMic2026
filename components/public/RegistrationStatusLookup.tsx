"use client";

import { useState } from "react";

type LookupResponse = {
  id: string;
  name: string;
  phone: string;
  college: string | null;
  performanceType: string;
  performanceTitle: string | null;
  teamMembers: string | null;
  paymentStatus: "PENDING_REVIEW" | "PENDING_CORRECTION" | "VERIFIED" | "REJECTED";
  requiresReupload: boolean;
  allowedCorrectionFields: string[];
  canReupload: boolean;
  adminComment: string | null;
  commentHistory: Array<{
    message: string;
    status: string;
    requiresReupload: boolean;
    allowedCorrectionFields: string[];
    createdAt: string;
  }>;
  updatedAt: string;
};

export function RegistrationStatusLookup() {
  const [registrationId, setRegistrationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [reuploadLoading, setReuploadLoading] = useState(false);
  const [error, setError] = useState("");
  const [reuploadMessage, setReuploadMessage] = useState("");
  const [result, setResult] = useState<LookupResponse | null>(null);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(new Date(value));
  }

  function canEdit(field: string) {
    return (result?.allowedCorrectionFields ?? []).includes(field) ?? false;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReuploadMessage("");
    setResult(null);

    const id = registrationId.trim();
    if (!id) {
      setError("Please enter your registration ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/register/status?id=${encodeURIComponent(id)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to fetch registration status.");
        return;
      }

      setResult(data.registration as LookupResponse);
    } catch {
      setError("Network error while checking status. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onReupload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReuploadMessage("");

    if (!result) return;

    const formData = new FormData(event.currentTarget);
    formData.set("registrationId", result.id);

    const screenshot = formData.get("paymentScreenshot");
    const script = formData.get("scriptFile");
    const college = String(formData.get("college") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const performanceTitle = String(formData.get("performanceTitle") ?? "").trim();
    const teamMembers = String(formData.get("teamMembers") ?? "").trim();

    const hasScreenshot = screenshot instanceof File && screenshot.size > 0;
    const hasScript = script instanceof File && script.size > 0;
    const hasCollege = canEdit("college") && Boolean(college);
    const hasPhone = canEdit("phone") && Boolean(phone);
    const hasPerformanceTitle = canEdit("performanceTitle") && Boolean(performanceTitle);
    const hasTeamMembers = canEdit("teamMembers") && Boolean(teamMembers);

    if (!hasScreenshot && !hasScript && !hasCollege && !hasPhone && !hasPerformanceTitle && !hasTeamMembers) {
      setError("Please submit at least one allowed correction field.");
      return;
    }

    setReuploadLoading(true);
    try {
      const response = await fetch("/api/register/reupload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Reupload failed. Please try again.");
        return;
      }

      setResult(data.registration as LookupResponse);
      setReuploadMessage("Files updated successfully. Your registration is now back in pending review.");
      event.currentTarget.reset();
    } catch {
      setError("Network error during reupload. Please try again.");
    } finally {
      setReuploadLoading(false);
    }
  }

  const statusColor = result?.paymentStatus === "VERIFIED"
    ? "text-emerald-400"
    : result?.paymentStatus === "REJECTED"
      ? "text-red-400"
      : result?.paymentStatus === "PENDING_CORRECTION"
        ? "text-yellow-400"
        : "text-amber-300";

  return (
    <section className="card">
      <h2 className="text-2xl font-bold text-white mb-2">Check Registration Status</h2>
      <p className="text-zinc-400 mb-6">Enter your registration ID to view current status and admin comments.</p>

      <form onSubmit={onSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={registrationId}
          onChange={(e) => setRegistrationId(e.target.value)}
          placeholder="Enter registration ID"
          className="input-field flex-grow"
        />
        <button disabled={loading} className="btn-primary">
          {loading ? "Checking..." : "Check Status"}
        </button>
      </form>

      {error ? <div className="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-300">{error}</div> : null}

      {result ? (
        <div className="grid gap-6">
          <div className="card bg-zinc-900/70">
            <h3 className="text-lg font-semibold text-white mb-4">Registration Details</h3>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div><span className="text-zinc-400">ID:</span> <span className="text-zinc-200">{result.id}</span></div>
              <div><span className="text-zinc-400">Name:</span> <span className="text-zinc-200">{result.name}</span></div>
              <div><span className="text-zinc-400">Performance Type:</span> <span className="text-zinc-200">{result.performanceType}</span></div>
              <div><span className="text-zinc-400">Phone:</span> <span className="text-zinc-200">{result.phone}</span></div>
              <div><span className="text-zinc-400">College:</span> <span className="text-zinc-200">{result.college ?? "-"}</span></div>
              <div><span className="text-zinc-400">Performance Title:</span> <span className="text-zinc-200">{result.performanceTitle ?? "-"}</span></div>
              <div><span className="text-zinc-400">Team Members:</span> <span className="text-zinc-200">{result.teamMembers ?? "-"}</span></div>
              <div><span className="text-zinc-400">Status:</span> <span className={`font-medium ${statusColor}`}>{result.paymentStatus}</span></div>
              <div><span className="text-zinc-400">Admin Comment:</span> <span className="text-zinc-200">{result.adminComment ?? "No comment"}</span></div>
              {result.canReupload && (
                <div className="md:col-span-2"><span className="text-zinc-400">Editable Fields:</span> <span className="text-amber-300">{(result.allowedCorrectionFields ?? []).join(", ")}</span></div>
              )}
              <div className="md:col-span-2"><span className="text-zinc-400">Last Updated:</span> <span className="text-zinc-200">{formatDate(result.updatedAt)} UTC</span></div>
            </div>
          </div>

          {result.canReupload ? (
            <div className="card bg-emerald-900/20 border-emerald-800">
              <h3 className="text-lg font-semibold text-emerald-300 mb-3">Submit Corrections</h3>
              <p className="text-sm text-zinc-300 mb-4">
                You can update the fields selected by the admin. After submission, your status will return to pending review.
              </p>

              <form onSubmit={onReupload} className="grid gap-4">
                {canEdit("scriptFile") && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Updated Script File</label>
                    <input
                      name="scriptFile"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.rtf"
                      className="input-field file:mr-4 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1 file:text-zinc-200"
                    />
                  </div>
                )}
                {canEdit("paymentScreenshot") && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Updated Payment Screenshot</label>
                    <input
                      name="paymentScreenshot"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="input-field file:mr-4 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1 file:text-zinc-200"
                    />
                  </div>
                )}
                {canEdit("college") && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">College</label>
                    <input
                      name="college"
                      defaultValue={result.college ?? ""}
                      placeholder="College"
                      className="input-field"
                    />
                  </div>
                )}
                {canEdit("phone") && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Phone</label>
                    <input
                      name="phone"
                      defaultValue={result.phone}
                      placeholder="Phone"
                      className="input-field"
                    />
                  </div>
                )}
                {canEdit("performanceTitle") && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Performance Title</label>
                    <input
                      name="performanceTitle"
                      defaultValue={result.performanceTitle ?? ""}
                      placeholder="Performance Title"
                      className="input-field"
                    />
                  </div>
                )}
                {canEdit("teamMembers") && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Team Members</label>
                    <textarea
                      name="teamMembers"
                      defaultValue={result.teamMembers ?? ""}
                      placeholder="Team members (comma separated)"
                      rows={3}
                      className="input-field"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={reuploadLoading}
                  className="btn-primary"
                >
                  {reuploadLoading ? "Uploading..." : "Submit Corrections"}
                </button>

                {reuploadMessage && <div className="rounded-md bg-emerald-900/50 p-3 text-sm text-emerald-300">{reuploadMessage}</div>}
              </form>
            </div>
          ) : null}

          {result.paymentStatus === "REJECTED" && !result.canReupload && (
            <div className="card bg-red-900/20 border-red-800">
              <p className="text-red-300 text-sm">
                🚫 This registration has been permanently rejected and no further action can be taken.
              </p>
            </div>
          )}

          {(result.commentHistory ?? []).length > 0 && (
            <div className="card bg-zinc-900/70">
              <h3 className="text-lg font-semibold text-zinc-200 mb-4">Comment History</h3>
              <div className="space-y-3">
                {(result.commentHistory ?? [])
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <div key={`${item.createdAt}-${index}`} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                      <p className="text-zinc-200 mb-2">{item.message}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                        <span>Status: {item.status}</span>
                        <span>Reupload: {item.requiresReupload ? "Yes" : "No"}</span>
                        <span>{formatDate(item.createdAt)} UTC</span>
                      </div>
                      {item.requiresReupload && (item.allowedCorrectionFields ?? []).length > 0 && (
                        <p className="text-xs text-amber-400 mt-1">Editable: {(item.allowedCorrectionFields ?? []).join(", ")}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
