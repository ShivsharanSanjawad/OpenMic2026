"use client";

import { useState } from "react";
import { DynamicField } from "@/types";

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function FormFieldEditor({ basePath, initialFields }: { basePath: string; initialFields: DynamicField[] }) {
  const [fields, setFields] = useState<DynamicField[]>(initialFields);
  const [saving, setSaving] = useState(false);

  function addField() {
    setFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "New Field", type: "text", required: false, options: [] },
    ]);
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    const formData = new FormData();
    formData.set("form_fields", JSON.stringify(fields));

    await fetch(`/api/${basePath}/settings`, {
      method: "PUT",
      body: formData,
    });
    setSaving(false);
  }

  const inputCls = "w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-colors";

  return (
    <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-gradient-to-r from-violet-500/10 to-purple-500/5 px-5 py-4">
        <div>
          <h3 className="font-semibold text-violet-300">Dynamic Form Fields</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Extra fields shown on the public registration form</p>
        </div>
        <button onClick={addField} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500/20 border border-violet-500/30 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/30 transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Field
        </button>
      </div>
      <div className="p-5 grid gap-3">
        {fields.length === 0 && (
          <p className="text-center py-6 text-sm text-zinc-500">No custom fields yet. Click &quot;Add Field&quot; to create one.</p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-2 rounded-xl border border-zinc-700/60 bg-zinc-800/40 p-3 sm:grid-cols-4">
            <input
              value={field.label}
              onChange={(e) =>
                setFields((prev) => prev.map((x, i) => (i === index ? { ...x, label: e.target.value } : x)))
              }
              placeholder="Field label"
              className={inputCls}
            />
            <select
              value={field.type}
              onChange={(e) =>
                setFields((prev) =>
                  prev.map((x, i) =>
                    i === index ? { ...x, type: e.target.value as DynamicField["type"] } : x,
                  ),
                )
              }
              className={inputCls}
            >
              <option value="text">Text</option>
              <option value="select">Select</option>
              <option value="textarea">Textarea</option>
              <option value="checkbox">Checkbox</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer px-1">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  setFields((prev) => prev.map((x, i) => (i === index ? { ...x, required: e.target.checked } : x)))
                }
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
              />
              Required
            </label>
            <button
              onClick={() => setFields((prev) => prev.filter((x) => x.id !== field.id))}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-500/15 border border-red-500/30 px-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        ))}
        <button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-400 hover:to-purple-500 disabled:opacity-60 transition-all w-fit mt-2">
          {saving ? <><Spinner />Saving…</> : "Save Fields"}
        </button>
      </div>
    </div>
  );
}
