"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const TRANSITION_MS = 500;

export default function RouteTransitionLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first mount; only show when moving between pages.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => setVisible(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="inline-block h-12 w-12 rounded-full border-4 border-emerald-700/40 border-t-emerald-400 animate-spin" />
        <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">
          Loading...
        </span>
      </div>
    </div>
  );
}
