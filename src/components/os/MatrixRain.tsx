import { useEffect, useRef } from "react";

const GLYPHS = "アカサタナハマヤラワ01<>[]{}#$%&*+=:;アイウエオカキクケコVOLKOV";

export default function MatrixRain({ boost, prm }: { boost: boolean; prm: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const boostRef = useRef(boost);
  boostRef.current = boost;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let drops: number[] = [];
    const CELL = 16;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.ceil(canvas.width / CELL) }, () =>
        Math.floor(Math.random() * -60)
      );
    };
    resize();

    const draw = (clear: boolean) => {
      const acc = getComputedStyle(document.documentElement).getPropertyValue("--acc").trim() || "#46f084";
      ctx.fillStyle = "rgba(7,12,9,0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `13px "JetBrains Mono", monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const y = drops[i] * CELL;
        ctx.fillStyle = Math.random() > 0.975 ? "#eafff2" : acc;
        ctx.fillText(ch, i * CELL, y);
        if (y > canvas.height && Math.random() > 0.976) drops[i] = 0;
        drops[i] += boostRef.current ? 1.6 : 0.8;
      }
      if (clear) {
        ctx.fillStyle = "#070c09";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (prm) {
      ctx.fillStyle = "#070c09";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let k = 0; k < 3; k++) draw(false);
      return () => {};
    }

    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 40) return;
      last = t;
      draw(false);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [prm]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 transition-opacity duration-700"
      style={{ opacity: prm ? 0.06 : boost ? 0.5 : 0.13, zIndex: 1 }}
      aria-hidden
    />
  );
}
