import { FEATURED, RECOGNITION } from "../lib/data";
import { Reveal, SectionTag } from "../lib/motion";
import { Asterisk } from "../lib/icons";

export default function Recognition() {
  return (
    <section
      id="recognition"
      className="relative scroll-mt-20 overflow-hidden bg-ink py-24 md:py-32"
    >
      <div className="anim-drift-b pointer-events-none absolute right-[-10%] top-[10%] h-[34vw] w-[34vw] rounded-full bg-flame/[0.05] blur-[100px]" />
      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <SectionTag index="03" label="Recognition" />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.6rem,7.5vw,6.5rem)] uppercase leading-[0.92] text-bone">
              Signal,
              <span className="text-outline"> not noise</span>
              <span className="text-flame">.</span>
            </h2>
          </Reveal>
          <Reveal delay={120} className="pb-2">
            <div className="flex items-center gap-3">
              <Asterisk className="anim-spin-slow h-8 w-8 text-flame" />
              <p className="max-w-[260px] font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-fog">
                Juries & communities that noticed the work
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* awards */}
          <div>
            <Reveal className="mb-6 flex items-baseline justify-between border-b border-bone/12 pb-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-flame">
                Awards
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-fog/60">
                Awwwards / CSSDA / FWA
              </span>
            </Reveal>
            <ul>
              {RECOGNITION.map((r, i) => (
                <Reveal key={r.label} as="li" delay={i * 50}>
                  <div className="group flex items-baseline justify-between gap-6 border-b border-bone/10 py-4 transition-all duration-300 hover:border-flame/60 hover:pl-2">
                    <span className="text-sm text-bone/85 transition-colors group-hover:text-bone md:text-base">
                      {r.label}
                    </span>
                    <span className="shrink-0 font-display text-2xl text-fog transition-colors duration-300 group-hover:text-flame md:text-3xl">
                      {r.count}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* featured */}
          <div>
            <Reveal className="mb-6 flex items-baseline justify-between border-b border-bone/12 pb-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-flame">
                Featured by
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-fog/60">
                Press / OSS / Stages
              </span>
            </Reveal>
            <ul>
              {FEATURED.map((f, i) => (
                <Reveal key={f.label} as="li" delay={i * 50}>
                  <div className="group flex items-baseline justify-between gap-6 border-b border-bone/10 py-4 transition-all duration-300 hover:border-flame/60 hover:pl-2">
                    <span className="text-sm text-bone/85 transition-colors group-hover:text-bone md:text-base">
                      {f.label}
                    </span>
                    <span className="shrink-0 font-display text-2xl text-fog transition-colors duration-300 group-hover:text-flame md:text-3xl">
                      {f.count}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={200} className="mt-8 border border-bone/12 bg-coal p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-fog/70">
                Latest highlight
              </div>
              <p className="mt-3 font-display text-2xl uppercase leading-tight text-bone md:text-3xl">
                "Pulseboard" takes an Awwwards{" "}
                <span className="text-flame">Developer Award</span> for its
                canvas charting engine.
              </p>
              <div className="mt-4 font-mono text-[10px] tracking-[0.2em] text-fog/50">
                JURY COMMENT — "Ridiculously smooth. 60fps with a million
                points."
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
