--- src/components/os/Window.tsx (原始)
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useOS, useMediaQuery } from "./ctx";
import type { WinId } from "./ctx";

interface Props {
  id: WinId;
  title: string;
  icon: string;
  bootDelay?: number;
  children: ReactNode;
}

export default function Window({ id, title, icon, bootDelay = 0, children }: Props) {
  const os = useOS();
  const desktop = useMediaQuery("(min-width: 768px)");
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const w = os.wins[id];
  const isOn = os.focused === id && w.open && !w.min;
  const hidden = !w.open || w.min;

  // re-play the CRT materialize animation whenever the window gets re-launched (born bump)
  const [anim, setAnim] = useState(true);
  const booted = useRef(false);
  useEffect(() => {
    if (!w.born) return;
    setAnim(false);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setAnim(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
    };
  }, [w.born]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    os.focus(id);
    const t = e.target as HTMLElement;
    if (t.closest("button") || w.max || !desktop) return;
    drag.current = { dx: e.clientX - w.x, dy: e.clientY - w.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight - 44;
    const nx = Math.min(Math.max(e.clientX - drag.current.dx, -(w.w - 160)), vw - 140);
    const ny = Math.min(Math.max(e.clientY - drag.current.dy, 0), vh - 60);
    os.move(id, nx, ny);
  };
  const onPointerUp = () => (drag.current = null);

  const style: CSSProperties = w.max
    ? { left: 0, top: 0, width: "100%", height: "100%", zIndex: w.z }
    : desktop
    ? { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }
    : { zIndex: w.z };

  return (
    <section
      className={`win ${anim ? "crt-in" : ""} ${isOn ? "on" : ""} ${hidden ? "hidden-win" : ""}`}
      style={{ ...style, animationDelay: booted.current ? "0ms" : `${bootDelay}ms` }}
      onAnimationEnd={() => { booted.current = true; }}
      onPointerDown={() => os.focus(id)}
      aria-label={title}
    >
      <div
        className="win-tbar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => desktop && os.toggleMax(id)}
      >
        <span className="font-disp text-[17px] leading-none tracking-wide text-[var(--dim)]">
          <span className={isOn ? "text-[var(--acc)]" : ""}>{icon}</span>
          <span className="ml-2 text-[var(--txt)]">{title}</span>
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => os.minimize(id)}
            title="minimize"
            className="grid h-4 w-4 place-items-center border border-[var(--line2)] text-[10px] leading-none text-[var(--dim)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
          >
            –
          </button>
          <button
            onClick={() => os.toggleMax(id)}
            title="maximize"
            className="grid h-4 w-4 place-items-center border border-[var(--line2)] text-[9px] leading-none text-[var(--dim)] transition-colors hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
          >
            ▢
          </button>
          <button
            onClick={() => os.close(id)}
            title="close"
            className="grid h-4 w-4 place-items-center border border-[var(--line2)] text-[10px] leading-none text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]"
          >
            ×
          </button>
        </span>
      </div>
      <div className="win-body">{children}</div>
    </section>
  );
}


+++ src/components/os/Window.tsx (修改后)
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useOS, useMediaQuery } from "./ctx";
import type { WinId } from "./ctx";

interface Props {
  id: WinId;
  title: string;
  icon: string;
  bootDelay?: number;
  children: ReactNode;
}

export default function Window({ id, title, icon, bootDelay = 0, children }: Props) {
  const os = useOS();
  const desktop = useMediaQuery("(min-width: 768px)");
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const w = os.wins[id];
  const isOn = os.focused === id && w.open && !w.min;
  const hidden = !w.open || w.min;

  // re-play the CRT materialize animation whenever the window gets re-launched (born bump)
  const [anim, setAnim] = useState(true);
  const booted = useRef(false);
  useEffect(() => {
    if (!w.born) return;
    setAnim(false);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setAnim(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
    };
  }, [w.born]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    os.focus(id);
    const t = e.target as HTMLElement;
    if (t.closest("button") || w.max || !desktop) return;
    drag.current = { dx: e.clientX - w.x, dy: e.clientY - w.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight - 44;
    const nx = Math.min(Math.max(e.clientX - drag.current.dx, -(w.w - 160)), vw - 140);
    const ny = Math.min(Math.max(e.clientY - drag.current.dy, 0), vh - 60);
    os.move(id, nx, ny);
  };
  const onPointerUp = () => (drag.current = null);

  /* ——— windows-style edge/corner resizing ——— */
  const rz = useRef<{ zone: string; sx: number; sy: number; s: { x: number; y: number; w: number; h: number } } | null>(null);
  const onRzDown = (zone: string) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (w.max || !desktop) return;
    e.stopPropagation();
    os.focus(id);
    rz.current = { zone, sx: e.clientX, sy: e.clientY, s: { x: w.x, y: w.y, w: w.w, h: w.h } };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onRzMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = rz.current;
    if (!r) return;
    const MINW = 300;
    const MINH = 180;
    const dx = e.clientX - r.sx;
    const dy = e.clientY - r.sy;
    let { x, y, w: nw, h: nh } = r.s;
    if (r.zone.includes("e")) nw = Math.max(MINW, r.s.w + dx);
    if (r.zone.includes("s")) nh = Math.max(MINH, r.s.h + dy);
    if (r.zone.includes("w")) {
      nw = Math.max(MINW, r.s.w - dx);
      x = r.s.x + (r.s.w - nw);
    }
    if (r.zone.includes("n")) {
      nh = Math.max(MINH, r.s.h - dy);
      y = Math.max(0, r.s.y + (r.s.h - nh));
    }
    os.resize(id, { x, y, w: nw, h: nh });
  };
  const onRzUp = () => (rz.current = null);

  const zones: Array<{ z: string; cls: string }> = [
    { z: "n", cls: "top-0 left-3 right-3 h-[5px] cursor-ns-resize" },
    { z: "s", cls: "bottom-0 left-3 right-3 h-[6px] cursor-ns-resize" },
    { z: "e", cls: "right-0 top-3 bottom-3 w-[6px] cursor-ew-resize" },
    { z: "w", cls: "left-0 top-3 bottom-3 w-[5px] cursor-ew-resize" },
    { z: "nw", cls: "left-0 top-0 h-3 w-3 cursor-nwse-resize" },
    { z: "ne", cls: "right-0 top-0 h-3 w-3 cursor-nesw-resize" },
    { z: "sw", cls: "left-0 bottom-0 h-3 w-3 cursor-nesw-resize" },
    { z: "se", cls: "right-0 bottom-0 h-3.5 w-3.5 cursor-nwse-resize" },
  ];

  const style: CSSProperties = w.max
    ? { left: 0, top: 0, width: "100%", height: "100%", zIndex: w.z }
    : desktop
    ? { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }
    : { zIndex: w.z };

  return (
    <section
      className={`win ${anim ? "crt-in" : ""} ${isOn ? "on" : ""} ${hidden ? "hidden-win" : ""}`}
      style={{ ...style, animationDelay: booted.current ? "0ms" : `${bootDelay}ms` }}
      onAnimationEnd={() => { booted.current = true; }}
      onPointerDown={() => os.focus(id)}
      aria-label={title}
    >
      <div
        className="win-tbar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => desktop && os.toggleMax(id)}
      >
        <span className="font-disp text-[17px] leading-none tracking-wide text-[var(--dim)]">
          <span className={isOn ? "text-[var(--acc)]" : ""}>{icon}</span>
          <span className="ml-2 text-[var(--txt)]">{title}</span>
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => os.minimize(id)}
            title="minimize"
            className="grid h-4 w-4 place-items-center border border-[var(--line2)] text-[10px] leading-none text-[var(--dim)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]"
          >
            –
          </button>
          <button
            onClick={() => os.toggleMax(id)}
            title="maximize"
            className="grid h-4 w-4 place-items-center border border-[var(--line2)] text-[9px] leading-none text-[var(--dim)] transition-colors hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
          >
            ▢
          </button>
          <button
            onClick={() => os.close(id)}
            title="close"
            className="grid h-4 w-4 place-items-center border border-[var(--line2)] text-[10px] leading-none text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]"
          >
            ×
          </button>
        </span>
      </div>
      <div className="win-body">{children}</div>

      {/* resize zones (windows-style edges & corners) */}
      {!w.max && desktop &&
        zones.map(({ z, cls }) => (
          <div
            key={z}
            className={`absolute ${cls} z-20`}
            onPointerDown={onRzDown(z)}
            onPointerMove={onRzMove}
            onPointerUp={onRzUp}
            aria-hidden
          />
        ))}
      {!w.max && desktop && (
        <span className="pointer-events-none absolute bottom-0 right-0 z-10 px-1 font-mono2 text-[9px] leading-none text-[var(--faint)] opacity-60">◢</span>
      )}
    </section>
  );
}
