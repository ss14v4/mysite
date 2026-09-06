import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EMAIL, PROJECTS, type Project } from "../lib/data";
import { Reveal, SectionTag, useFinePointer } from "../lib/motion";
import { ArrowUpRight, CloseIcon } from "../lib/icons";

export default function Works() {
  const [active, setActive] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const showFloat = fine && !reduced;

  const listRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  /* floating preview follow */
  useEffect(() => {
    if (!showFloat) return;
    const target = { x: -1000, y: -1000 };
    const cur = { x: -1000, y: -1000 };
    let raf = 0;
    let inside = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!inside && floatRef.current) {
        cur.x = target.x;
        cur.y = target.y;
        inside = true;
      }
    };
    const onLeave = () => {
      inside = false;
    };
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.11;
      cur.y += (target.y - cur.y) * 0.11;
      const dx = (target.x - cur.x) * 0.06;
      if (floatRef.current) {
        floatRef.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -54%) rotate(${Math.max(-7, Math.min(7, dx))}deg)`;
        floatRef.current.style.opacity = inside ? "1" : "0";
      }
      raf = requestAnimationFrame(loop);
    };

    const el = listRef.current;
    el?.addEventListener("mousemove", onMove);
    el?.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      el?.removeEventListener("mousemove", onMove);
      el?.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [showFloat]);

  const openProject = PROJECTS.find((p) => p.id === openId) ?? null;

  /* lock scroll when modal open */
  useEffect(() => {
    document.body.style.overflow = openId ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  return (
    <section id="works" className="relative scroll-mt-20 bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <SectionTag index="01" label="Selected Works" />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="font-display text-[clamp(3rem,9vw,8rem)] uppercase leading-[0.9] text-bone">
              Projects<span className="text-flame">.</span>
            </h2>
          </Reveal>
          <Reveal delay={120} className="pb-3 text-right">
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
              ( {String(PROJECTS.length).padStart(2, "0")} ) case studies
            </div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-fog/60">
              2023 — 2026 · hover to preview
            </div>
          </Reveal>
        </div>

        {/* list */}
        <div ref={listRef} className="mt-14 border-t border-bone/12">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <button
                type="button"
                onClick={() => setOpenId(p.id)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                data-cursor="OPEN"
                className="work-row group block w-full border-b border-bone/12 px-2 py-7 text-left transition-colors duration-300 hover:bg-bone/[0.035] md:px-4 md:py-9"
              >
                <div className="flex items-center gap-5 md:gap-10">
                  <span className="font-mono text-xs tracking-[0.2em] text-flame/90 md:text-sm">
                    {p.index}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="work-title block font-display text-[clamp(1.7rem,4.6vw,3.6rem)] uppercase leading-none text-bone transition-all duration-500">
                      {p.title}
                    </span>
                    <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.24em] text-fog md:text-[11px]">
                      {p.category}
                    </span>
                  </span>

                  <span className="hidden max-w-[220px] flex-wrap justify-end gap-1.5 lg:flex">
                    {p.stack.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="border border-bone/15 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-fog transition-colors duration-300 group-hover:border-flame/50 group-hover:text-bone"
                      >
                        {s}
                      </span>
                    ))}
                  </span>

                  <span className="hidden font-mono text-xs tracking-[0.2em] text-fog sm:block">
                    {p.year}
                  </span>

                  <span className="work-arrow -rotate-45 text-bone/40 transition-colors duration-300 group-hover:text-flame">
                    <ArrowUpRight className="h-6 w-6 md:h-8 md:w-8" strokeWidth={1.6} />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex justify-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-fog/60">
            Click any project for the full case study ↗
          </p>
        </Reveal>
      </div>

      {/* floating preview (desktop, motion allowed) */}
      {showFloat && (
        <div
          ref={floatRef}
          className="pointer-events-none fixed left-0 top-0 z-40 hidden transition-opacity duration-300 md:block"
          style={{ transform: "translate3d(-100vw,-100vh,0)", opacity: 0 }}
        >
          <div className="relative h-[290px] w-[390px] overflow-hidden border border-bone/20 bg-coal shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            {PROJECTS.map((p, i) => (
              <img
                key={p.id}
                src={p.image}
                alt=""
                loading={i < 2 ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                  i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/85 px-4 py-2.5 backdrop-blur-sm">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone">
                {PROJECTS[active].title}
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-flame">
                {PROJECTS[active].year}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* case study modal */}
      <AnimatePresence>
        {openProject && (
          <CaseModal project={openProject} onClose={() => setOpenId(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function CaseModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const reduced = useReducedMotion();
  const dur = reduced ? 0 : 0.45;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm md:items-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: dur * 0.6 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: reduced ? 0 : 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: reduced ? 0 : 60, opacity: 0 }}
        transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
        className="max-h-[92svh] w-full max-w-4xl overflow-y-auto border border-bone/15 bg-coal shadow-2xl"
      >
        {/* image */}
        <div className="relative">
          <img
            src={project.image}
            alt={`${project.title} interface`}
            className="h-56 w-full object-cover md:h-80"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, #1b1e24 0%, transparent 45%)`,
            }}
          />
          <button
            type="button"
            onClick={onClose}
            data-cursor="CLOSE"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center border border-bone/25 bg-ink/70 text-bone backdrop-blur transition-all duration-300 hover:rotate-90 hover:border-flame hover:text-flame"
            aria-label="Close case study"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <span
            className="absolute bottom-4 left-5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-bone"
            style={{ borderColor: project.accent, color: project.accent }}
          >
            {project.category}
          </span>
        </div>

        {/* body */}
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-4xl uppercase text-bone md:text-6xl">
              {project.title}
              <span className="text-flame">.</span>
            </h3>
            <span className="font-mono text-xs tracking-[0.25em] text-fog">
              {project.year} · {project.index}/06
            </span>
          </div>

          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-fog md:text-base">
            {project.summary}
          </p>

          <div className="mt-7 grid gap-6 border-t border-bone/10 pt-6 sm:grid-cols-3">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <div
                  className="font-display text-3xl md:text-4xl"
                  style={{ color: project.accent }}
                >
                  {m.value}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 pt-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog/70">
                My role
              </div>
              <div className="mt-1 text-sm text-bone">{project.role}</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="border border-bone/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fog"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <a
            href={`mailto:${EMAIL}?subject=Project%20like%20${encodeURIComponent(project.title)}`}
            data-cursor="WRITE"
            className="group mt-8 flex items-center justify-between border border-bone/20 px-5 py-4 transition-all duration-300 hover:border-flame hover:bg-flame"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone transition-colors group-hover:text-ink">
              Want something like this? Let's talk
            </span>
            <ArrowUpRight className="h-5 w-5 text-flame transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ink" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
