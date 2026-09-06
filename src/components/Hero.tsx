import { useEffect, useState } from "react";
import { CountUp, useClock, useScramble } from "../lib/motion";
import { STATS } from "../lib/data";
import { ArrowDown, Asterisk } from "../lib/icons";

export default function Hero() {
  const [on, setOn] = useState(false);
  const label = useScramble("Web Application Developer — Portfolio 2019→2026", on);
  const time = useClock();

  useEffect(() => {
    const id = window.setTimeout(() => setOn(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section
      id="top"
      className={`relative overflow-hidden ${on ? "masks-on" : ""}`}
    >
      {/* ambient layers */}
      <div className="grid-lines pointer-events-none absolute inset-0" />
      <div className="anim-drift-a pointer-events-none absolute -left-[15%] top-[8%] h-[46vw] w-[46vw] rounded-full bg-flame/[0.07] blur-[110px]" />
      <div className="anim-drift-b pointer-events-none absolute -right-[12%] bottom-[4%] h-[38vw] w-[38vw] rounded-full bg-moss/[0.16] blur-[100px]" />

      <div className="relative mx-auto flex min-h-svh max-w-[1600px] flex-col px-5 pb-0 pt-28 md:px-10 md:pt-36">
        {/* top meta row */}
        <div className="mb-10 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.28em] text-fog md:text-[11px]">
          <span className="truncate text-bone/80">{label}</span>
          <span className="hidden shrink-0 text-flame sm:block">
            VOL.04 — 2026
          </span>
        </div>

        {/* mega type */}
        <h1 className="font-display uppercase leading-[0.88] tracking-[0.01em]">
          <span className="mask-line text-[clamp(3.4rem,13.5vw,12.5rem)] text-bone">
            <span style={{ ["--ml-delay" as never]: "80ms" }}>
              Alex&nbsp;Volkov
              <span className="align-top text-[0.32em] text-flame">®</span>
            </span>
          </span>
          <span className="mask-line text-[clamp(2.1rem,8.6vw,8rem)] text-bone/85">
            <span style={{ ["--ml-delay" as never]: "200ms" }}>
              <span className="text-outline">builds&nbsp;web&nbsp;apps</span>
            </span>
          </span>
          <span className="mask-line text-[clamp(2.1rem,8.6vw,8rem)]">
            <span
              className="flex items-center gap-[0.18em]"
              style={{ ["--ml-delay" as never]: "320ms" }}
            >
              that&nbsp;feel
              <Asterisk className="anim-spin-slow h-[0.55em] w-[0.55em] shrink-0 text-flame" />
              alive<span className="text-flame">.</span>
            </span>
          </span>
        </h1>

        {/* meta grid */}
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-bone/12 pt-6 md:mt-16 md:grid-cols-12">
          <p className="col-span-2 max-w-md text-[15px] leading-relaxed text-fog md:col-span-5 md:text-base">
            Independent engineer partnering with startups & studios on{" "}
            <span className="text-bone">
              dashboards, SaaS products and storefronts
            </span>{" "}
            — from first commit to production. Obsessive about performance,
            motion and the details nobody notices until they're missing.
          </p>

          <div className="md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-fog/70">
              Based
            </div>
            <div className="mt-2 font-display text-2xl uppercase text-bone">
              Remote
              <span className="block text-sm tracking-normal text-fog">
                UTC+3 · works worldwide
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-fog/70">
              Local time
            </div>
            <div className="mt-2 font-mono text-2xl tabular-nums text-bone">
              {time}
              <span className="anim-blink text-flame">_</span>
            </div>
          </div>

          <a
            href="#works"
            data-cursor="SCROLL"
            className="group col-span-2 flex items-center gap-4 md:col-span-2 md:justify-self-end"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-fog transition-colors group-hover:text-flame">
              Scroll
            </span>
            <span className="relative block h-14 w-px overflow-hidden bg-bone/20">
              <span className="absolute inset-x-0 h-full bg-flame [animation:scroll-line_1.8s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
            </span>
            <ArrowDown className="h-4 w-4 text-bone/60 transition-all duration-300 group-hover:translate-y-1 group-hover:text-flame" />
          </a>
        </div>

        {/* stats strip */}
        <div className="mt-12 grid grid-cols-2 divide-x divide-bone/10 border-y border-bone/12 md:mt-16 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`group flex flex-col gap-1 px-5 py-6 transition-colors duration-300 hover:bg-bone/[0.04] md:px-8 ${
                i >= 2 ? "border-t border-bone/10 md:border-t-0" : ""
              } ${i % 2 === 1 ? "border-l border-bone/10 md:border-l-0" : ""}`}
            >
              <span className="font-display text-4xl leading-none text-bone transition-colors duration-300 group-hover:text-flame md:text-5xl">
                <CountUp to={s.value} suffix={s.suffix} />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
