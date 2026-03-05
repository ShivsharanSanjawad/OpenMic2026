"use client";

import Link from "next/link";

export function AdminSidebar({ basePath }: { basePath: string }) {
  const links = [
    { href: `/${basePath}/dashboard`, label: "Dashboard" },
    { href: `/${basePath}/registrations`, label: "Registrations" },
    { href: `/${basePath}/settings`, label: "Settings" },
    { href: `/${basePath}/announcements`, label: "Announcements" },
  ];

  return (
    <aside className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="mb-3 text-sm font-semibold text-amber-300">Admin Panel</p>
      <nav className="grid gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm hover:bg-zinc-800">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
