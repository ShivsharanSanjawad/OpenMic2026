"use client";

export function ExportButtons({ basePath }: { basePath: string }) {
  return (
    <div className="flex gap-2">
      <a
        href={`/api/${basePath}/registrations?format=csv`}
        className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-black"
      >
        Export CSV
      </a>
      <a
        href={`/api/${basePath}/registrations?format=json`}
        className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
      >
        Export JSON
      </a>
    </div>
  );
}
