"use client";

import { Announcement, AnnouncementType } from "@prisma/client";
import { useRef, useState } from "react";

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

type Props = {
  basePath: string;
  initial: Announcement[];
};

export function AnnouncementEditor({ basePath, initial }: Props) {
  const [items, setItems] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/${basePath}/announcements`, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      setItems((prev) => [data.announcement, ...prev]);
      formRef.current?.reset();
    }
    setCreating(false);
  }

  async function togglePublish(id: string, isPublished: boolean) {
    if (busyKey) return;
    setBusyKey(`${id}_publish`);
    const response = await fetch(`/api/${basePath}/announcements`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublished: !isPublished }),
    });

    if (response.ok) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isPublished: !isPublished } : item)));
    }
    setBusyKey(null);
  }

  async function remove(id: string) {
    if (busyKey) return;
    setBusyKey(`${id}_delete`);
    const response = await fetch(`/api/${basePath}/announcements`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) setItems((prev) => prev.filter((item) => item.id !== id));
    setBusyKey(null);
  }

  const inputCls = "w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-colors";

  const TYPE_COLORS: Record<string, string> = {
    INFO: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    WARNING: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    SUCCESS: "bg-green-500/15 text-green-300 border-green-500/30",
    ERROR: "bg-red-500/15 text-red-300 border-red-500/30",
  };

  return (
    <div className="grid gap-5">
      {/* Create form */}
      <form
        ref={formRef}
        onSubmit={create}
        className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden"
      >
        <div className="border-b border-zinc-800 bg-gradient-to-r from-amber-500/10 to-orange-500/5 px-5 py-4">
          <h3 className="font-semibold text-amber-300">Create Announcement</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Publish updates visible to all registered users</p>
        </div>
        <div className="p-5 grid gap-3">
          <input name="title" required placeholder="Announcement title…" className={inputCls} />
          <textarea name="body" required rows={3} placeholder="Body text…" className={inputCls} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select name="type" className={inputCls}>
              {Object.values(AnnouncementType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" name="isPinned" className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500" />
                Pin to top
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" name="isPublished" className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500" />
                Publish now
              </label>
            </div>
          </div>
          <button disabled={creating} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-black hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 transition-all w-fit">
            {creating ? <><Spinner />Creating…</> : "Post Announcement"}
          </button>
        </div>
      </form>

      {/* Existing announcements */}
      <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h3 className="font-semibold text-zinc-100">Existing Announcements</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{items.length} announcement{items.length !== 1 ? "s" : ""}</p>
        </div>
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">No announcements yet</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {items.map((item) => (
              <li key={item.id} className="p-4 hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[item.type] ?? "bg-zinc-800 text-zinc-300 border-zinc-700"}`}>
                        {item.type}
                      </span>
                      {item.isPinned && <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-medium text-amber-300">📌 Pinned</span>}
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${item.isPublished ? "bg-green-500/15 text-green-300 border-green-500/30" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{item.body}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => togglePublish(item.id, item.isPublished)} disabled={!!busyKey} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium disabled:opacity-60 transition-colors ${item.isPublished ? "bg-zinc-700/80 text-zinc-300 hover:bg-zinc-700" : "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"}`}>
                      {busyKey === `${item.id}_publish` ? <><Spinner />{item.isPublished ? "Unpublishing…" : "Publishing…"}</> : (item.isPublished ? "Unpublish" : "Publish")}
                    </button>
                    <button onClick={() => remove(item.id)} disabled={!!busyKey} className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 border border-red-500/30 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 disabled:opacity-60 transition-colors">
                      {busyKey === `${item.id}_delete` ? <><Spinner />Deleting…</> : "Delete"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
