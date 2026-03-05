"use client";

import { Announcement, AnnouncementType } from "@prisma/client";
import { useState } from "react";

type Props = {
  basePath: string;
  initial: Announcement[];
};

export function AnnouncementEditor({ basePath, initial }: Props) {
  const [items, setItems] = useState(initial);

  async function create(formData: FormData) {
    const response = await fetch(`/api/${basePath}/announcements`, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      setItems((prev) => [data.announcement, ...prev]);
    }
  }

  async function togglePublish(id: string, isPublished: boolean) {
    const response = await fetch(`/api/${basePath}/announcements`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublished: !isPublished }),
    });

    if (response.ok) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isPublished: !isPublished } : item)));
    }
  }

  async function remove(id: string) {
    const response = await fetch(`/api/${basePath}/announcements`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="grid gap-4">
      <form
        action={create}
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
        <button className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">Create</button>
      </form>

      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-zinc-800 p-4">
            <p className="text-xs text-amber-300">{item.type}</p>
            <h4 className="text-lg font-semibold">{item.title}</h4>
            <p className="mt-2 text-sm text-zinc-300">{item.body}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => togglePublish(item.id, item.isPublished)} className="rounded bg-zinc-800 px-2 py-1 text-xs">
                {item.isPublished ? "Unpublish" : "Publish"}
              </button>
              <button onClick={() => remove(item.id)} className="rounded bg-red-700 px-2 py-1 text-xs">
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
