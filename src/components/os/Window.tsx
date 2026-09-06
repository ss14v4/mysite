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
