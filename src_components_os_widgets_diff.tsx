--- src/components/os/widgets.tsx (原始)
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useOS } from "./ctx";
import { useTip } from "./Tip";
import { useCMS } from "../../lib/cms";
import { AV_LOGO, PALETTE } from "../../lib/ascii";
import type { ThemeName } from "../../lib/os-data";

/* ——— neofetch block (shared by widget + terminal) ——— */
export function NeofetchContent() {
  const os = useOS();
  const cms = useCMS();
  const rows: Array<[string, string, boolean]> = [
    ["host", cms.profile.handle, false],
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
        <div className="mb-1 font-bold text-[var(--acc)]">{cms.profile.handle}</div>
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

/* ——— desktop icons · 3 layout modes managed by cms.sys ▸ desktop ——— */
type IconId = "about" | "projects" | "terminal" | "readme" | "blog" | "cms";
const ICON_DEFS: Array<{ id: IconId; glyph: string; label: string; hint: string[] }> = [
  { id: "about", glyph: "▤", label: "about.txt", hint: ["resume dossier", "skills · log · uplinks"] },
  { id: "projects", glyph: "▦", label: "projects/", hint: ["file explorer", "hover rows for previews"] },
  { id: "terminal", glyph: ">_", label: "terminal", hint: ["type `help` to begin", "`open karta` · `matrix`"] },
  { id: "readme", glyph: "?", label: "README.md", hint: ["hotkeys · commands", "how to drive the OS"] },
  { id: "blog", glyph: "≣", label: "blog.md", hint: ["articles & notes", "markdown-lite · figures"] },
  { id: "cms", glyph: "▣", label: "cms.sys", hint: ["content control", "guest creds inside"] },
];

const CELL_W = 96;
const CELL_H = 104;
const ORIGIN = 12;

interface DragSt { id: string; px: number; py: number; moved: boolean; target: { x: number; y: number; ok: boolean } | null; }

export function DesktopIcons() {
  const os = useOS();
  const tip = useTip();
  const cms = useCMS();
  const boxRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const justDragged = useRef(false);
  const [drag, setDrag] = useState<DragSt | null>(null);

  const ic = cms.icons;
  const label = (d: (typeof ICON_DEFS)[number]) => ic.names[d.id] ?? d.label;

  const rail = (dock: "left" | "right" | "top") => cms.widgetCfg.some((w) => w.enabled && w.dock === dock);
  const hasLeft = rail("left");
  const hasRight = rail("right");
  const hasTop = rail("top");

  const cellPx = (id: string, i: number) => {
    const c = ic.positions[id] ?? { x: 0, y: i };
    return { x: ORIGIN + c.x * CELL_W, y: ORIGIN + c.y * CELL_H };
  };

  const onDown = (d: (typeof ICON_DEFS)[number], i: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (ic.mode !== "free" || e.button !== 0) return;
    const p = cellPx(d.id, i);
    startRef.current = { x: e.clientX, y: e.clientY, cx: p.x, cy: p.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id: d.id, px: p.x, py: p.y, moved: false, target: null });
  };

  const onMove = (d: (typeof ICON_DEFS)[number]) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag || drag.id !== d.id) return;
    const s = startRef.current;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const moved = drag.moved || Math.hypot(dx, dy) > 6;
    let target: DragSt["target"] = null;
    const box = boxRef.current?.getBoundingClientRect();
    if (box) {
      const cols = Math.max(1, Math.floor((box.width - ORIGIN * 2) / CELL_W));
      const rows = Math.max(1, Math.floor((box.height - ORIGIN * 2) / CELL_H));
      const x = Math.min(cols - 1, Math.max(0, Math.floor((e.clientX - box.left - ORIGIN) / CELL_W)));
      const y = Math.min(rows - 1, Math.max(0, Math.floor((e.clientY - box.top - ORIGIN) / CELL_H)));
      const cellOf = (id: string, idx: number) => ic.positions[id] ?? { x: 0, y: idx };
      const occupied = ICON_DEFS.some((o, j) => {
        if (o.id === d.id) return false;
        const c = cellOf(o.id, j);
        return c.x === x && c.y === y;
      });
      target = { x, y, ok: !occupied };
    }
    setDrag({ id: d.id, px: moved ? s.cx + dx : s.cx, py: moved ? s.cy + dy : s.cy, moved, target });
  };

  const onUp = (d: (typeof ICON_DEFS)[number], i: number) => () => {
    if (!drag || drag.id !== d.id) return;
    if (drag.moved) {
      justDragged.current = true;
      if (drag.target?.ok) {
        cms.setIcons({ positions: { ...ic.positions, [d.id]: { x: drag.target.x, y: drag.target.y } } });
        os.toast(`${label(d).toUpperCase()} → CELL ${drag.target.x}:${drag.target.y}`);
      }
    }
    setDrag(null);
  };

  const click = (d: (typeof ICON_DEFS)[number]) => () => {
    if (justDragged.current) { justDragged.current = false; return; }
    os.open(d.id, { center: true });
  };

  const iconBtn = (d: (typeof ICON_DEFS)[number], i: number, free: boolean) => (
    <button
      key={d.id}
      onClick={click(d)}
      onPointerDown={free ? onDown(d, i) : undefined}
      onPointerMove={free ? onMove(d) : undefined}
      onPointerUp={free ? onUp(d, i) : undefined}
      className={`dicon group flex w-20 flex-col items-center gap-1.5 ${free ? "pointer-events-auto absolute touch-none select-none" : ""}`}
      style={free ? {
        left: drag?.id === d.id ? drag.px : cellPx(d.id, i).x,
        top: drag?.id === d.id ? drag.py : cellPx(d.id, i).y,
        zIndex: drag?.id === d.id ? 60 : undefined,
        transition: drag?.id === d.id ? "none" : "left 0.25s cubic-bezier(0.2,0.8,0.2,1), top 0.25s cubic-bezier(0.2,0.8,0.2,1)",
        animationDelay: `${i * 60}ms`,
      } : { animationDelay: `${i * 60}ms` }}
      {...tip.handlers({ kind: "text", title: label(d), glyph: d.glyph, lines: [...d.hint, ic.mode === "free" ? "free mode — drag me onto the grid" : "opens centered, on top"] })}
    >
      <span className={`dicon-glyph grid h-12 w-12 place-items-center border border-[var(--line2)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] font-disp text-2xl text-[var(--dim)] ${drag?.id === d.id ? "scale-110 border-[var(--acc)] text-[var(--acc)] shadow-[0_0_24px_var(--acc-glow)]" : ""}`}>
        {d.glyph}
      </span>
      <span className="max-w-20 truncate font-mono2 text-[10px] text-[var(--dim)] group-hover:text-[var(--acc)]">
        {label(d)}
      </span>
    </button>
  );

  /* ——— mode: free grid ——— */
  if (ic.mode === "free") {
    return (
      <div ref={boxRef} className="pointer-events-none absolute inset-0 z-[6] hidden md:block">
        {drag?.target && (
          <div
            className={`absolute border border-dashed ${drag.target.ok ? "border-[var(--acc)] shadow-[inset_0_0_18px_var(--acc-dim)]" : "border-[var(--red)]"}`}
            style={{ left: ORIGIN + drag.target.x * CELL_W, top: ORIGIN + drag.target.y * CELL_H, width: 88, height: 96 }}
          />
        )}
        {ICON_DEFS.map((d, i) => iconBtn(d, i, true))}
        <div className="absolute bottom-2 left-3 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">
          free-grid armed · drag icons to rearrange · cms.sys ▸ desktop to switch mode
        </div>
      </div>
    );
  }

  /* ——— mode: dock ——— */
  if (ic.mode === "dock") {
    const { dir, edge } = ic.dock;
    const col = dir === "v";
    const pos: React.CSSProperties =
      edge === "top" ? { top: hasTop ? 396 : 12, left: "50%", transform: "translateX(-50%)" }
      : edge === "bottom" ? { bottom: 12, left: "50%", transform: "translateX(-50%)" }
      : edge === "left" ? { left: hasLeft ? 322 : 12, top: "50%", transform: "translateY(-50%)" }
      : { right: hasRight ? 322 : 12, top: "50%", transform: "translateY(-50%)" };
    return (
      <div className="pointer-events-none absolute inset-0 z-[6] hidden md:block">
        <div className={`pointer-events-auto absolute flex gap-4 ${col ? "flex-col" : "flex-row"} ${edge === "bottom" && col ? "flex-col-reverse" : ""}`} style={pos}>
          {ICON_DEFS.map((d, i) => iconBtn(d, i, false))}
        </div>
      </div>
    );
  }

  /* ——— mode: auto (default row, bottom-left) ——— */
  return (
    <div className="absolute bottom-14 left-4 z-[6] hidden gap-5 md:flex">
      {ICON_DEFS.map((d, i) => iconBtn(d, i, false))}
    </div>
  );
}

export type { ThemeName };


+++ src/components/os/widgets.tsx (修改后)
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useOS } from "./ctx";
import { useTip } from "./Tip";
import { useCMS } from "../../lib/cms";
import { AV_LOGO, PALETTE } from "../../lib/ascii";
import type { ThemeName } from "../../lib/os-data";

/* ——— neofetch block (shared by widget + terminal) ——— */
export function NeofetchContent() {
  const os = useOS();
  const cms = useCMS();
  const rows: Array<[string, string, boolean]> = [
    ["host", cms.profile.handle, false],
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
        <div className="mb-1 font-bold text-[var(--acc)]">{cms.profile.handle}</div>
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

/* ——— desktop icons · 3 layout modes managed by cms.sys ▸ desktop ——— */
type IconId = "about" | "projects" | "terminal" | "readme" | "blog" | "cms";

const FolderGlyph = (
  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
    <path d="M3 7V5.6A1.6 1.6 0 0 1 4.6 4h4.1l2 2.6h8.7A1.6 1.6 0 0 1 21 8.2v10.2A1.6 1.6 0 0 1 19.4 20H4.6A1.6 1.6 0 0 1 3 18.4Z" />
    <path d="M8.2 12.4h7.6M8.2 15.4h4.8" opacity="0.65" strokeLinecap="round" />
  </svg>
);
const ICON_DEFS: Array<{ id: IconId; glyph: ReactNode; label: string; hint: string[] }> = [
  { id: "about", glyph: "▤", label: "about.txt", hint: ["resume dossier", "skills · log · uplinks"] },
  { id: "projects", glyph: "▦", label: "projects/", hint: ["file explorer", "hover rows for previews"] },
  { id: "terminal", glyph: ">_", label: "terminal", hint: ["type `help` to begin", "`open karta` · `matrix`"] },
  { id: "readme", glyph: "?", label: "README.md", hint: ["hotkeys · commands", "how to drive the OS"] },
  { id: "blog", glyph: FolderGlyph, label: "blog.md", hint: ["articles folder", "click a file to read"] },
  { id: "cms", glyph: "▣", label: "cms.sys", hint: ["content control", "guest creds inside"] },
];

const CELL_W = 96;
const CELL_H = 104;
const ORIGIN = 12;

interface DragSt { id: string; px: number; py: number; moved: boolean; target: { x: number; y: number; ok: boolean } | null; }

export function DesktopIcons() {
  const os = useOS();
  const tip = useTip();
  const cms = useCMS();
  const boxRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const justDragged = useRef(false);
  const [drag, setDrag] = useState<DragSt | null>(null);

  const ic = cms.icons;
  const label = (d: (typeof ICON_DEFS)[number]) => ic.names[d.id] ?? d.label;

  const rail = (dock: "left" | "right" | "top") => cms.widgetCfg.some((w) => w.enabled && w.dock === dock);
  const hasLeft = rail("left");
  const hasRight = rail("right");
  const hasTop = rail("top");

  const cellPx = (id: string, i: number) => {
    const c = ic.positions[id] ?? { x: 0, y: i };
    return { x: ORIGIN + c.x * CELL_W, y: ORIGIN + c.y * CELL_H };
  };

  const onDown = (d: (typeof ICON_DEFS)[number], i: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (ic.mode !== "free" || e.button !== 0) return;
    const p = cellPx(d.id, i);
    startRef.current = { x: e.clientX, y: e.clientY, cx: p.x, cy: p.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id: d.id, px: p.x, py: p.y, moved: false, target: null });
  };

  const onMove = (d: (typeof ICON_DEFS)[number]) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag || drag.id !== d.id) return;
    const s = startRef.current;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const moved = drag.moved || Math.hypot(dx, dy) > 6;
    let target: DragSt["target"] = null;
    const box = boxRef.current?.getBoundingClientRect();
    if (box) {
      const cols = Math.max(1, Math.floor((box.width - ORIGIN * 2) / CELL_W));
      const rows = Math.max(1, Math.floor((box.height - ORIGIN * 2) / CELL_H));
      const x = Math.min(cols - 1, Math.max(0, Math.floor((e.clientX - box.left - ORIGIN) / CELL_W)));
      const y = Math.min(rows - 1, Math.max(0, Math.floor((e.clientY - box.top - ORIGIN) / CELL_H)));
      const cellOf = (id: string, idx: number) => ic.positions[id] ?? { x: 0, y: idx };
      const occupied = ICON_DEFS.some((o, j) => {
        if (o.id === d.id) return false;
        const c = cellOf(o.id, j);
        return c.x === x && c.y === y;
      });
      target = { x, y, ok: !occupied };
    }
    setDrag({ id: d.id, px: moved ? s.cx + dx : s.cx, py: moved ? s.cy + dy : s.cy, moved, target });
  };

  const onUp = (d: (typeof ICON_DEFS)[number], i: number) => () => {
    if (!drag || drag.id !== d.id) return;
    if (drag.moved) {
      justDragged.current = true;
      if (drag.target?.ok) {
        cms.setIcons({ positions: { ...ic.positions, [d.id]: { x: drag.target.x, y: drag.target.y } } });
        os.toast(`${label(d).toUpperCase()} → CELL ${drag.target.x}:${drag.target.y}`);
      }
    }
    setDrag(null);
  };

  const click = (d: (typeof ICON_DEFS)[number]) => () => {
    if (justDragged.current) { justDragged.current = false; return; }
    os.open(d.id, { center: true });
  };

  const iconBtn = (d: (typeof ICON_DEFS)[number], i: number, free: boolean) => (
    <button
      key={d.id}
      onClick={click(d)}
      onPointerDown={free ? onDown(d, i) : undefined}
      onPointerMove={free ? onMove(d) : undefined}
      onPointerUp={free ? onUp(d, i) : undefined}
      className={`dicon group flex w-20 flex-col items-center gap-1.5 ${free ? "pointer-events-auto absolute touch-none select-none" : ""}`}
      style={free ? {
        left: drag?.id === d.id ? drag.px : cellPx(d.id, i).x,
        top: drag?.id === d.id ? drag.py : cellPx(d.id, i).y,
        zIndex: drag?.id === d.id ? 60 : undefined,
        transition: drag?.id === d.id ? "none" : "left 0.25s cubic-bezier(0.2,0.8,0.2,1), top 0.25s cubic-bezier(0.2,0.8,0.2,1)",
        animationDelay: `${i * 60}ms`,
      } : { animationDelay: `${i * 60}ms` }}
      {...tip.handlers({ kind: "text", title: label(d), glyph: typeof d.glyph === "string" ? d.glyph : "▣", lines: [...d.hint, ic.mode === "free" ? "free mode — drag me onto the grid" : "opens centered, on top"] })}
    >
      <span className={`dicon-glyph grid h-12 w-12 place-items-center border border-[var(--line2)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] font-disp text-2xl text-[var(--dim)] ${drag?.id === d.id ? "scale-110 border-[var(--acc)] text-[var(--acc)] shadow-[0_0_24px_var(--acc-glow)]" : ""}`}>
        {d.glyph}
      </span>
      <span className="max-w-20 truncate font-mono2 text-[10px] text-[var(--dim)] group-hover:text-[var(--acc)]">
        {label(d)}
      </span>
    </button>
  );

  /* ——— mode: free grid ——— */
  if (ic.mode === "free") {
    return (
      <div ref={boxRef} className="pointer-events-none absolute inset-0 z-[6] hidden md:block">
        {drag?.target && (
          <div
            className={`absolute border border-dashed ${drag.target.ok ? "border-[var(--acc)] shadow-[inset_0_0_18px_var(--acc-dim)]" : "border-[var(--red)]"}`}
            style={{ left: ORIGIN + drag.target.x * CELL_W, top: ORIGIN + drag.target.y * CELL_H, width: 88, height: 96 }}
          />
        )}
        {ICON_DEFS.map((d, i) => iconBtn(d, i, true))}
        <div className="absolute bottom-2 left-3 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">
          free-grid armed · drag icons to rearrange · cms.sys ▸ desktop to switch mode
        </div>
      </div>
    );
  }

  /* ——— mode: dock ——— */
  if (ic.mode === "dock") {
    const { dir, edge } = ic.dock;
    const col = dir === "v";
    const pos: React.CSSProperties =
      edge === "top" ? { top: hasTop ? 396 : 12, left: "50%", transform: "translateX(-50%)" }
      : edge === "bottom" ? { bottom: 12, left: "50%", transform: "translateX(-50%)" }
      : edge === "left" ? { left: hasLeft ? 322 : 12, top: "50%", transform: "translateY(-50%)" }
      : { right: hasRight ? 322 : 12, top: "50%", transform: "translateY(-50%)" };
    return (
      <div className="pointer-events-none absolute inset-0 z-[6] hidden md:block">
        <div className={`pointer-events-auto absolute flex gap-4 ${col ? "flex-col" : "flex-row"} ${edge === "bottom" && col ? "flex-col-reverse" : ""}`} style={pos}>
          {ICON_DEFS.map((d, i) => iconBtn(d, i, false))}
        </div>
      </div>
    );
  }

  /* ——— mode: auto (default row, bottom-left) ——— */
  return (
    <div className="absolute bottom-14 left-4 z-[6] hidden gap-5 md:flex">
      {ICON_DEFS.map((d, i) => iconBtn(d, i, false))}
    </div>
  );
}

export type { ThemeName };
