"use client";

import { useEffect, useState, RefObject } from "react";

interface Props {
  price: number;
  deposit: number;
  headerCardRef: RefObject<HTMLDivElement | null>;
}

export default function RoomStickyBar({ price, deposit, headerCardRef }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = headerCardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show mobile bar when the header card is NOT visible
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [headerCardRef]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden items-center gap-3 px-4 py-3 bg-card border-t border-border"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex-1">
        <span className="text-xl font-bold text-foreground">${price}</span>
        <span className="text-muted text-sm">/mes</span>
        <p className="text-xs text-muted">+ depósito ${deposit}</p>
      </div>
      <button
        className="flex-1 py-3 rounded-full font-semibold text-white text-sm"
        style={{ background: "#D85A30" }}
      >
        Solicitar habitación
      </button>
    </div>
  );
}
