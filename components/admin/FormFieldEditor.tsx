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

  return (
    <div className="grid gap-3 rounded-xl border border-zinc-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dynamic Form Fields</h3>
        <button onClick={addField} className="rounded bg-zinc-800 px-3 py-1 text-sm">
          Add Field
        </button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-2 rounded-lg border border-zinc-800 p-3 md:grid-cols-4">
          <input
            value={field.label}
            onChange={(e) =>
              setFields((prev) => prev.map((x, i) => (i === index ? { ...x, label: e.target.value } : x)))
            }
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1"
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
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1"
          >
            <option value="text">Text</option>
            <option value="select">Select</option>
            <option value="textarea">Textarea</option>
            <option value="checkbox">Checkbox</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                setFields((prev) => prev.map((x, i) => (i === index ? { ...x, required: e.target.checked } : x)))
              }
            />
            Required
          </label>
          <button
            onClick={() => setFields((prev) => prev.filter((x) => x.id !== field.id))}
            className="rounded bg-red-700 px-2 py-1 text-sm"
          >
            Delete
          </button>
        </div>
      ))}
      <button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-60">
        {saving ? <><Spinner />Saving…</> : "Save Fields"}
      </button>
    </div>
  );
}
