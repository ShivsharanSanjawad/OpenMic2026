"use client";

import { useState } from "react";

type AdminComment = {
  id: string;
  registrationId: string;
  message: string;
  status: string;
  requiresReupload: boolean;
  allowedFields: unknown;
  createdAt: string;
};

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string | null;
  performanceType: string;
  performanceTitle: string | null;
  teamMembers: string[] | null;
  paymentStatus: "PENDING_REVIEW" | "PENDING_CORRECTION" | "VERIFIED" | "REJECTED";
  paymentScreenshot: string;
  scriptFile: string | null;
  adminComment: string | null;
  requiresReupload: boolean;
  allowedCorrectionFields: unknown;
  adminComments: AdminComment[];
  extraFields: unknown;
  emailSent: boolean;
  emailError: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABELS: Record<Row["paymentStatus"], string> = {
  PENDING_REVIEW: "Pending Review",
  PENDING_CORRECTION: "Needs Correction",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

const STATUS_BADGE: Record<Row["paymentStatus"], string> = {
  PENDING_REVIEW: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  PENDING_CORRECTION: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  VERIFIED: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  REJECTED: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const PERF_LABELS: Record<string, string> = {
  solo: "Solo",
  group: "Group",
};

function StatusBadge({ status }: { status: Row["paymentStatus"] }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? "bg-zinc-700 text-zinc-300 border border-zinc-600"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function formatStableDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

function formatDateTime(dateValue: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(dateValue)) + " UTC";
}

type UpdateResponse = {
  error?: string;
  registration?: Partial<Row>;
};

export function RegistrationsTable({ basePath, rows }: { basePath: string; rows: Row[] }) {
  const [items, setItems] = useState(rows);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(rows[0]?.id ?? null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAllowedFields, setReviewAllowedFields] = useState<string[]>([]);
  const [showFieldSelection, setShowFieldSelection] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Row["paymentStatus"] | "ALL">("ALL");

  const correctionFieldOptions: Array<{ key: string; label: string }> = [
    { key: "paymentScreenshot", label: "Payment Screenshot" },
    { key: "scriptFile", label: "Script File" },
    { key: "college", label: "College" },
    { key: "phone", label: "Phone" },
    { key: "performanceTitle", label: "Performance Title" },
    { key: "teamMembers", label: "Team Members" },
  ];

  function parseStringList(value: unknown) {
    if (!Array.isArray(value)) return [] as string[];
    return value.filter((item): item is string => typeof item === "string");
  }

  const activeRegistration = items.find((item) => item.id === activeId) ?? null;

  const filteredItems = items.filter((row) => {
    const q = search.toLowerCase();
    const matchSearch = !search || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q) || row.phone.includes(search);
    const matchStatus = filterStatus === "ALL" || row.paymentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: items.length,
    PENDING_REVIEW: items.filter((r) => r.paymentStatus === "PENDING_REVIEW").length,
    PENDING_CORRECTION: items.filter((r) => r.paymentStatus === "PENDING_CORRECTION").length,
    VERIFIED: items.filter((r) => r.paymentStatus === "VERIFIED").length,
    REJECTED: items.filter((r) => r.paymentStatus === "REJECTED").length,
  };

  async function updateStatus(
    id: string,
    status: Row["paymentStatus"],
    adminComment?: string,
    requiresReupload?: boolean,
  ) {
    setActionError("");
    setBusyId(id);
    const response = await fetch(`/api/${basePath}/registrations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        paymentStatus: status,
        adminComment,
        requiresReupload,
        allowedCorrectionFields: requiresReupload ? reviewAllowedFields : [],
      }),
    });

    const data = (await response.json().catch(() => ({}))) as UpdateResponse;

    if (response.ok && data.registration) {
      // Spread ALL fields returned from server so the detail panel stays current
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, ...data.registration } : item,
        ),
      );
    } else if (!response.ok) {
      setActionError(data.error ?? "Failed to update registration.");
    }
    setBusyId(null);
  }

  async function handleDecision(id: string, status: "PENDING_CORRECTION" | "REJECTED") {
    const comment = reviewComment.trim();
    if (!comment) {
      setActionError("A comment is required for this decision.");
      return;
    }

    const requiresReupload = status === "PENDING_CORRECTION";

    if (requiresReupload && reviewAllowedFields.length === 0) {
      setActionError("Select at least one editable field when requesting corrections.");
      return;
    }

    await updateStatus(id, status, comment, requiresReupload);
    setReviewComment("");
    setReviewAllowedFields([]);
    setShowFieldSelection(false);
  }

  function parseTeamMembers(value: string[] | null): string[] {
    if (Array.isArray(value)) return value.filter((s): s is string => typeof s === "string");
    return [];
  }

  function renderExtraFields(extraFields: unknown) {
    if (!extraFields || typeof extraFields !== "object") return null;
    const entries = Object.entries(extraFields as Record<string, unknown>);
    if (entries.length === 0) return null;

    return (
      <div className="grid gap-1">
        <p className="font-semibold text-zinc-200">Extra Fields</p>
        {entries.map(([key, value]) => (
          <p key={key}>
            <span className="text-zinc-400">{key}:</span> {String(value ?? "")}
          </p>
        ))}
      </div>
    );
  }

  function setActiveRegistration(id: string) {
    setActiveId(id);
    const selected = items.find((item) => item.id === id);
    if (!selected) return;
    setReviewComment("");
    setReviewAllowedFields(parseStringList(selected.allowedCorrectionFields));
    setShowFieldSelection(false);
    setActionError("");
  }

  return (
    <div className="grid gap-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {(["ALL", "PENDING_REVIEW", "PENDING_CORRECTION", "VERIFIED", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                filterStatus === s ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s === "ALL" ? "All" : STATUS_LABELS[s]} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="px-4 py-3 font-semibold text-zinc-400">Registrant</th>
              <th className="px-4 py-3 font-semibold text-zinc-400">Performance</th>
              <th className="px-4 py-3 font-semibold text-zinc-400">Status</th>
              <th className="px-4 py-3 font-semibold text-zinc-400">Email Sent</th>
              <th className="px-4 py-3 font-semibold text-zinc-400">Registered</th>
              <th className="px-4 py-3 font-semibold text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No registrations found.</td>
              </tr>
            ) : (
              filteredItems.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setActiveRegistration(row.id)}
                  className={`cursor-pointer transition-colors hover:bg-zinc-800/40 ${activeId === row.id ? "bg-zinc-800/60" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{row.name}</p>
                    <p className="text-xs text-zinc-400">{row.email}</p>
                    <p className="text-xs text-zinc-500">{row.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{row.performanceTitle ?? "—"}</p>
                    <p className="text-xs text-zinc-400">{PERF_LABELS[row.performanceType] ?? row.performanceType}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    {row.emailSent ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Sent
                      </span>
                    ) : row.emailError ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-400" title={row.emailError}>
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" /> Not sent
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{formatStableDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <a
                        href={row.paymentScreenshot}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20 transition-colors"
                      >
                        Payment
                      </a>
                      {row.scriptFile && (
                        <a
                          href={row.scriptFile}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-300 hover:bg-blue-500/20 transition-colors"
                        >
                          Script
                        </a>
                      )}
                      {row.paymentStatus !== "VERIFIED" && (
                        <button
                          disabled={busyId === row.id}
                          onClick={(e) => { e.stopPropagation(); void updateStatus(row.id, "VERIFIED"); }}
                          className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                        >
                          {busyId === row.id ? <><Spinner />Verifying…</> : "Verify"}
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveRegistration(row.id); }}
                        className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {activeRegistration && (
        <section className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-white">{activeRegistration.name}</h3>
              <StatusBadge status={activeRegistration.paymentStatus} />
            </div>
            <p className="text-xs text-zinc-500">ID: {activeRegistration.id}</p>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-2">
            {/* Left: info */}
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact</p>
                <div className="space-y-1.5">
                  <p><span className="inline-block w-20 text-zinc-400">Email</span><span className="text-white">{activeRegistration.email}</span></p>
                  <p><span className="inline-block w-20 text-zinc-400">Phone</span><span className="text-white">{activeRegistration.phone}</span></p>
                  <p><span className="inline-block w-20 text-zinc-400">College</span><span className="text-white">{activeRegistration.college ?? "—"}</span></p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Performance</p>
                <div className="space-y-1.5">
                  <p><span className="inline-block w-20 text-zinc-400">Type</span><span className="text-white">{PERF_LABELS[activeRegistration.performanceType] ?? activeRegistration.performanceType}</span></p>
                  <p><span className="inline-block w-20 text-zinc-400">Title</span><span className="text-white">{activeRegistration.performanceTitle ?? "—"}</span></p>
                </div>
              </div>
              {parseTeamMembers(activeRegistration.teamMembers).length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Team Members</p>
                  <ul className="list-inside list-disc space-y-0.5 text-white">
                    {parseTeamMembers(activeRegistration.teamMembers).map((m, i) => <li key={`${i}-${m}`}>{m}</li>)}
                  </ul>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Timeline</p>
                <div className="space-y-1.5">
                  <p><span className="inline-block w-28 text-zinc-400">Registered</span><span className="text-white">{formatStableDate(activeRegistration.createdAt)}</span></p>
                  <p><span className="inline-block w-28 text-zinc-400">Last updated</span><span className="text-white">{formatDateTime(activeRegistration.updatedAt)}</span></p>
                </div>
              </div>
              {activeRegistration.adminComment && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Admin Comment</p>
                  <p className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-zinc-200">{activeRegistration.adminComment}</p>
                </div>
              )}
              {renderExtraFields(activeRegistration.extraFields)}
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={activeRegistration.paymentScreenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
                >
                  View Payment Screenshot
                </a>
                {activeRegistration.scriptFile && (
                  <a
                    href={activeRegistration.scriptFile}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-300 hover:bg-blue-500/20 transition-colors"
                  >
                    View Script File
                  </a>
                )}
              </div>
              {activeRegistration.emailError && (
                <p className="text-xs text-red-400"><span className="font-semibold">Email error:</span> {activeRegistration.emailError}</p>
              )}
            </div>

            {/* Right: actions */}
            <div className="space-y-4">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Admin Actions</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-zinc-400">Comment / Reason</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write a comment for this decision..."
                      className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                  {showFieldSelection && (
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                      <p className="mb-2 text-xs font-semibold text-yellow-300">Editable fields for participant:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {correctionFieldOptions.map((opt) => (
                          <label key={opt.key} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300 hover:text-white">
                            <input
                              type="checkbox"
                              checked={reviewAllowedFields.includes(opt.key)}
                              onChange={(e) =>
                                setReviewAllowedFields((cur) =>
                                  e.target.checked
                                    ? Array.from(new Set([...cur, opt.key]))
                                    : cur.filter((f) => f !== opt.key)
                                )
                              }
                              className="rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={busyId === activeRegistration.id}
                      onClick={() => void updateStatus(activeRegistration.id, "VERIFIED", reviewComment || undefined)}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                    >
                      {busyId === activeRegistration.id ? <><Spinner />Updating…</> : "Mark Verified"}
                    </button>
                    <button
                      disabled={busyId === activeRegistration.id || !reviewComment}
                      onClick={() => {
                        setShowFieldSelection(true);
                        if (reviewAllowedFields.length === 0) {
                          setActionError("Select at least one editable field when requesting corrections.");
                          return;
                        }
                        void handleDecision(activeRegistration.id, "PENDING_CORRECTION");
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-500 disabled:opacity-40"
                    >
                      {busyId === activeRegistration.id ? <><Spinner />Updating…</> : "Request Corrections"}
                    </button>
                    <button
                      disabled={busyId === activeRegistration.id || !reviewComment}
                      onClick={() => void handleDecision(activeRegistration.id, "REJECTED")}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-40"
                    >
                      {busyId === activeRegistration.id ? <><Spinner />Updating…</> : "Reject"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Comment History */}
              {activeRegistration.adminComments.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">History</p>
                  <ul className="max-h-64 space-y-2 overflow-y-auto">
                    {activeRegistration.adminComments
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <li key={entry.id} className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-3">
                          <div className="mb-1 flex items-center gap-2">
                            {STATUS_LABELS[entry.status as Row["paymentStatus"]] ? (
                              <StatusBadge status={entry.status as Row["paymentStatus"]} />
                            ) : (
                              <span className="text-xs text-zinc-400">{entry.status}</span>
                            )}
                            <span className="text-xs text-zinc-500">{formatDateTime(entry.createdAt)}</span>
                          </div>
                          <p className="text-sm text-zinc-200">{entry.message}</p>
                          {entry.requiresReupload && parseStringList(entry.allowedFields).length > 0 && (
                            <p className="mt-1 text-xs text-yellow-400">Editable: {parseStringList(entry.allowedFields).join(", ")}</p>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}