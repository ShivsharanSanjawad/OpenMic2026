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

  return (
    <div className="grid gap-4">
      <form
        ref={formRef}
        onSubmit={create}
        className="grid gap-3 rounded-xl border border-zinc-800 p-4"
      >
        <h3 className="text-lg font-semibold">Create Announcement</h3>
        <input name="title" required placeholder="Title" className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
        <textarea name="body" required rows={4} placeholder="Body / markdown" className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
        <select name="type" className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2">
          {Object.values(AnnouncementType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPinned" /> Pin
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" /> Publish now
        </label>
        <button disabled={creating} className="inline-flex items-center justify-center gap-2 rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-60">
          {creating ? <><Spinner />Creating…</> : "Create"}
        </button>
      </form>

      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-zinc-800 p-4">
            <p className="text-xs text-amber-300">{item.type}</p>
            <h4 className="text-lg font-semibold">{item.title}</h4>
            <p className="mt-2 text-sm text-zinc-300">{item.body}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => togglePublish(item.id, item.isPublished)} disabled={!!busyKey} className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-xs disabled:opacity-60">
                {busyKey === `${item.id}_publish` ? <><Spinner />{item.isPublished ? "Unpublishing…" : "Publishing…"}</> : (item.isPublished ? "Unpublish" : "Publish")}
              </button>
              <button onClick={() => remove(item.id)} disabled={!!busyKey} className="inline-flex items-center gap-1 rounded bg-red-700 px-2 py-1 text-xs disabled:opacity-60">
                {busyKey === `${item.id}_delete` ? <><Spinner />Deleting…</> : "Delete"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
