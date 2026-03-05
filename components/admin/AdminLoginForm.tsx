"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm({ adminPath }: { adminPath: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/${adminPath}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });

      const raw = await response.text();
      let data: { error?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.error ?? `Login failed (${response.status})`);
        return;
      }

      router.push(`/${adminPath}/dashboard`);
    } catch {
      setError("Unable to reach server. Please check your connection and try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h1 className="text-2xl font-bold text-amber-300">Admin Login</h1>
      <div className="mt-4 grid gap-3">
        <input name="username" placeholder="Username" required className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2" />
        <button className="rounded-md bg-amber-500 px-3 py-2 font-semibold text-black">Login</button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    </form>
  );
}
