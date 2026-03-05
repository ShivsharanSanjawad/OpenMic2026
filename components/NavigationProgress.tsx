"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  }, []);

  // Start progress on internal link clicks
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;
      // Skip if same page
      if (href === pathname) return;

      cleanup();
      setProgress(15);
      setVisible(true);

      // Trickle progress
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          return p + (90 - p) * 0.08;
        });
      }, 150);
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      cleanup();
    };
  }, [pathname, cleanup]);

  // Complete on pathname change
  useEffect(() => {
    cleanup();
    if (visible) {
      setProgress(100);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s" }}
    >
      <div
        className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? "width 0.2s ease-out" : "width 0.4s ease-out",
        }}
      />
    </div>
  );
}
