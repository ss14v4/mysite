import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ---------------- prefers-reduced-motion ---------------- */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useFinePointer() {
  const [fine, setFine] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const onChange = () => setFine(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return fine;
}

/* ---------------- live clock ---------------- */
export function useClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

/* ---------------- scramble / decode text ---------------- */
const GLYPHS = "!<>-_\\/[]{}—=+*^?#________";

export function useScramble(text: string, active = true, speed = 28) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");
  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    if (!active) {
      setOut("");
      return;
    }
    let frame = 0;
    let raf = 0;
    let last = performance.now();
    const total = text.length;
    const step = (now: number) => {
      if (now - last >= speed) {
        last = now;
        frame++;
        const settled = Math.floor(frame / 2.4);
        let result = "";
        for (let i = 0; i < total; i++) {
          if (text[i] === " ") {
            result += " ";
          } else if (i < settled) {
            result += text[i];
          } else {
            result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }
        setOut(result);
        if (settled >= total) return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, active, reduced, speed]);
  return out;
}

/* ---------------- in-view observer ---------------- */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ---------------- <Reveal /> wrapper ---------------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "figure";
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  return (
    <Tag
      ref={ref as never}
      className={`rv ${inView ? "rv-on" : ""} ${className}`}
      style={{ ["--rv-delay" as never]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ---------------- count-up number ---------------- */
export function CountUp({
  to,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [val, setVal] = useState(reduced ? to : 0);

  const run = useCallback(() => {
    if (reduced) {
      setVal(to);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration, reduced]);

  useEffect(() => {
    if (inView) run();
  }, [inView, run]);

  return (
    <span ref={ref}>
      {String(val).padStart(2, "0")}
      {suffix}
    </span>
  );
}

/* ---------------- section heading ---------------- */
export function SectionTag({
  index,
  label,
  light = false,
}: {
  index: string;
  label: string;
  light?: boolean;
}) {
  return (
    <Reveal className="flex items-center gap-4">
      <span className="anim-pulse-dot inline-block h-2 w-2 rounded-full bg-flame" />
      <span
        className={`font-mono text-[11px] uppercase tracking-[0.32em] ${light ? "text-ink/60" : "text-fog"}`}
      >
        {index} / {label}
      </span>
      <span
        className={`h-px flex-1 ${light ? "bg-ink/15" : "bg-bone/15"}`}
      />
    </Reveal>
  );
}
