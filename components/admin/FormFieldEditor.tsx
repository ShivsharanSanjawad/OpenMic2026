"use client";

import { useState } from "react";
import { DynamicField } from "@/types";

export function FormFieldEditor({ basePath, initialFields }: { basePath: string; initialFields: DynamicField[] }) {
  const [fields, setFields] = useState<DynamicField[]>(initialFields);

  function addField() {
    setFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "New Field", type: "text", required: false, options: [] },
    ]);
  }

  async function save() {
    const formData = new FormData();
    formData.set("form_fields", JSON.stringify(fields));

    await fetch(`/api/${basePath}/settings`, {
      method: "PUT",
      body: formData,
    });
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
      <button onClick={save} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">
        Save Fields
      </button>
    </div>
  );
}
