import type { ReactNode } from "react";

export default function Marquee({
  children,
  reverse = false,
  speed = 32,
  className = "",
}: {
  children: ReactNode;
  reverse?: boolean;
  speed?: number;
  className?: string;
}) {
  return (
    <div
      className={`marquee-hover relative flex overflow-hidden border-y border-bone/10 ${className}`}
      aria-hidden
    >
      <div
        className={`flex min-w-full shrink-0 items-center ${reverse ? "anim-marquee-rev" : "anim-marquee"}`}
        style={{ ["--speed" as never]: `${speed}s` }}
      >
        {children}
      </div>
      <div
        className={`flex min-w-full shrink-0 items-center ${reverse ? "anim-marquee-rev" : "anim-marquee"}`}
        style={{ ["--speed" as never]: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
}

export function StackMarquee() {
  const items = [
    "React",
    "TypeScript",
    "Next.js",
    "Node",
    "PostgreSQL",
    "GraphQL",
    "Supabase",
    "Tailwind",
    "GSAP",
    "Vite",
    "Rust / WASM",
    "Docker",
  ];
  return (
    <Marquee speed={30} className="bg-ink py-5">
      {items.map((it) => (
        <span key={it} className="flex items-center">
          <span className="px-6 font-display text-3xl uppercase tracking-wide text-bone/25 transition-colors duration-300 hover:text-flame md:text-4xl">
            {it}
          </span>
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-flame/70" fill="none" aria-hidden>
            <path d="M12 2v20M3.34 7l17.32 10M20.66 7L3.34 17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </span>
      ))}
    </Marquee>
  );
}

export function ClientsMarquee() {
  const items = [
    "Nordwind",
    "Helix Labs",
    "Otto & Co",
    "Finch Bank",
    "Polaris",
    "Moss Studio",
    "Kite Health",
    "Raster",
    "Bloomful",
    "Vantage",
  ];
  return (
    <Marquee reverse speed={38} className="border-bone/15 bg-coal py-4">
      {items.map((c) => (
        <span key={c} className="flex items-center">
          <span className="px-8 font-mono text-xs uppercase tracking-[0.3em] text-fog/80">
            {c}
          </span>
          <span className="h-1 w-1 rounded-full bg-flame/60" />
        </span>
      ))}
    </Marquee>
  );
}

export function AvailabilityMarquee() {
  return (
    <Marquee speed={26} className="border-flame/40 bg-flame py-3.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 font-display text-xl uppercase tracking-wider text-ink md:text-2xl">
            Available for Q3 2026
          </span>
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink" fill="none" aria-hidden>
            <path d="M12 3l2.4 7.6L22 13l-7.6 2.4L12 23l-2.4-7.6L2 13l7.6-2.4L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="bevel" />
          </svg>
          <span className="px-6 font-display text-xl uppercase tracking-wider text-ink/70 md:text-2xl">
            2 slots left
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
        </span>
      ))}
    </Marquee>
  );
}
