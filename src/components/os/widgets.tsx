import { useEffect, useState } from "react";
import { useOS } from "./ctx";
import { AV_LOGO, PALETTE } from "../../lib/ascii";
import type { ThemeName } from "../../lib/os-data";

/* ——— neofetch block (shared by widget + terminal) ——— */
export function NeofetchContent() {
  const os = useOS();
  const rows: Array<[string, string, boolean]> = [
    ["host", "alex@volkov.dev", false],
    ["os", "VolkovOS 2.4.1 (web)", false],
    ["kernel", "react 18 / vite 6", false],
    ["shell", "typescript 5.7", false],
    ["uptime", "6+ yrs shipping", false],
    ["packages", "42 npm · 0 jQuery", false],
    ["resolution", "any viewport", false],
    ["theme", `phosphor-${os.theme}`, true],
    ["cpu", "Coffee-Core ×∞", false],
    ["memory", "87% of ∞", false],
  ];
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <pre className="font-mono2 text-[8px] leading-[1.1] text-[var(--acc)] sm:text-[9px]" style={{ textShadow: "0 0 10px var(--acc-glow)" }}>
          {AV_LOGO}
        </pre>
        <div className="mt-2 flex gap-[3px]">
          {PALETTE.map((c, i) => (
            <span key={i} className="inline-block h-2.5 w-2.5" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="font-mono2 text-[11px] leading-[1.6]">
        <div className="mb-1 font-bold text-[var(--acc)]">alex@volkov.dev</div>
        {rows.map(([k, v, hot]) => (
          <div key={k}>
            <span className="text-[var(--faint)]">{k.padEnd(11)}</span>
            <span className={hot ? "text-[var(--acc)]" : "text-[var(--txt)]"}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ——— live system monitor with sparklines ——— */
function walk(prev: number[], next: (last: number) => number, len = 36): number[] {
  const last = prev[prev.length - 1];
  return [...prev.slice(1), Math.min(98, Math.max(4, next(last)))];
}
function Spark({ vals, color, label, unit }: { vals: number[]; color: string; label: string; unit: string }) {
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 100},${26 - (v / 100) * 24}`).join(" ");
  const cur = vals[vals.length - 1];
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 font-mono2 text-[9px] uppercase tracking-widest text-[var(--faint)]">{label}</span>
      <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="h-6 flex-1">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" vectorEffect="non-scaling-stroke" opacity="0.9" />
        <polyline points={`0,26 ${pts} 100,26`} fill={color} opacity="0.08" stroke="none" />
      </svg>
      <span className="w-10 text-right font-mono2 text-[10px] font-bold" style={{ color }}>
        {Math.round(cur)}{unit}
      </span>
    </div>
  );
}

export function SysmonWidget() {
  const [cpu, setCpu] = useState<number[]>(() => Array.from({ length: 36 }, () => 20 + Math.random() * 25));
  const [mem, setMem] = useState<number[]>(() => Array.from({ length: 36 }, () => 55 + Math.random() * 10));
  const [net, setNet] = useState<number[]>(() => Array.from({ length: 36 }, () => 8 + Math.random() * 18));

  useEffect(() => {
    const t = setInterval(() => {
      setCpu((p) => walk(p, (l) => l + (Math.random() * 26 - 13)));
      setMem((p) => walk(p, (l) => l + (Math.random() * 6 - 3)));
      setNet((p) => walk(p, (l) => (Math.random() > 0.88 ? 70 + Math.random() * 28 : l * 0.6 + Math.random() * 14)));
    }, 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="widget shrink-0 p-3">
      <div className="mb-2 flex items-center justify-between font-mono2 text-[9px] uppercase tracking-[0.25em] text-[var(--faint)]">
        <span>sysmon — real processes*</span>
        <span className="led" />
      </div>
      <div className="space-y-1.5">
        <Spark vals={cpu} color="var(--acc)" label="cpu" unit="%" />
        <Spark vals={mem} color="var(--cyan)" label="mem" unit="%" />
        <Spark vals={net} color="var(--pink)" label="net" unit="kb" />
      </div>
      <div className="mt-2 border-t border-[var(--line)] pt-2 font-mono2 text-[9px] leading-relaxed text-[var(--faint)]">
        portfolio.sys · running<br />
        coffee.d · 8 instances<br />
        imposter_syndrome · <span className="text-[var(--red)]">killed</span>
      </div>
    </div>
  );
}

/* ——— desktop icons ——— */
const ICON_DEFS: Array<{ id: "about" | "projects" | "terminal" | "readme"; glyph: string; label: string }> = [
  { id: "about", glyph: "▤", label: "about.txt" },
  { id: "projects", glyph: "▦", label: "projects/" },
  { id: "terminal", glyph: ">_", label: "terminal" },
  { id: "readme", glyph: "?", label: "README.md" },
];

export function DesktopIcons() {
  const os = useOS();
  return (
    <div className="absolute left-4 top-4 z-[6] hidden grid-cols-1 gap-5 md:grid">
      {ICON_DEFS.map((d, i) => (
        <button
          key={d.id}
          onClick={() => os.open(d.id, { center: true })}
          className="dicon group flex w-20 flex-col items-center gap-1.5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className="dicon-glyph grid h-12 w-12 place-items-center border border-[var(--line2)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] font-disp text-2xl text-[var(--dim)]">
            {d.glyph}
          </span>
          <span className="font-mono2 text-[10px] text-[var(--dim)] group-hover:text-[var(--acc)]">
            {d.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export type { ThemeName };
