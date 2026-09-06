import { PORTRAIT_URL } from "../lib/data";
import { Reveal, SectionTag } from "../lib/motion";
import { ArrowLoop, Asterisk } from "../lib/icons";

const PROCESS = [
  { n: "W1", t: "Discover", d: "Deep-dive the problem, users and success metrics before any code." },
  { n: "W2–3", t: "Prototype", d: "Clickable core flows fast — we validate the riskiest assumptions first." },
  { n: "W4–8", t: "Build", d: "Production-grade sprints with staging previews you can click every Friday." },
  { n: "W9+", t: "Ship & tune", d: "Launch, measure, iterate. I stay until the numbers look right." },
];

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-20 bg-bone py-24 text-ink md:py-32">
      <div className="grid-lines-dark pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <SectionTag index="04" label="About" light />

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* portrait */}
          <Reveal className="lg:col-span-5">
            <figure className="group relative">
              <div className="absolute -inset-3 border border-ink/20 transition-transform duration-700 group-hover:translate-x-2 group-hover:translate-y-2" />
              <div className="relative overflow-hidden bg-coal">
                <img
                  src={PORTRAIT_URL}
                  alt="Portrait of Alex Volkov"
                  loading="lazy"
                  className="aspect-[9/11] w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/80 px-4 py-3 backdrop-blur-sm">
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone">
                    Alex Volkov — est. 1996
                  </span>
                  <Asterisk className="anim-spin-slow h-4 w-4 text-flame" />
                </div>
              </div>
            </figure>
          </Reveal>

          {/* bio */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="font-display text-[clamp(2.4rem,6vw,5.2rem)] uppercase leading-[0.95] text-ink">
                Engineer's brain,
                <span className="block text-outline-ink">
                  designer's eyes.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={100} className="mt-8 max-w-xl space-y-4 text-[15px] leading-relaxed text-ink/70 md:text-base">
              <p>
                I'm Alex — an independent web application developer. For the
                past eight years I've been the{" "}
                <span className="bg-flame/15 px-1 font-semibold text-ink">
                  technical partner behind products
                </span>{" "}
                that startups bet their runway on: analytics platforms,
                fintech dashboards, storefronts and collaboration tools.
              </p>
              <p>
                My sweet spot is the intersection of{" "}
                <span className="font-semibold text-ink">hard engineering</span>{" "}
                (realtime data, performance budgets, architecture) and{" "}
                <span className="font-semibold text-ink">craft</span> — the
                motion, typography and micro-details that make software feel
                expensive.
              </p>
              <p>
                Small teams, direct communication, no layers. You talk to the
                person who writes the code.
              </p>
            </Reveal>

            {/* currently */}
            <Reveal delay={160} className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { k: "Currently building", v: "A realtime collab toolkit (open source)" },
                { k: "Exploring", v: "WebGPU & local-first sync engines" },
                { k: "Status", v: "2 project slots open for Q3 2026" },
              ].map((it) => (
                <div
                  key={it.k}
                  className="group border border-ink/15 bg-paper p-4 transition-all duration-300 hover:-translate-y-1 hover:border-flame hover:shadow-[6px_6px_0_0_rgba(255,77,0,0.9)]"
                >
                  <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/50">
                    {it.k}
                  </div>
                  <div className="mt-2 text-sm font-medium leading-snug text-ink">
                    {it.v}
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>

        {/* process */}
        <div className="mt-24">
          <Reveal className="flex items-center gap-4">
            <ArrowLoop className="h-6 w-6 text-flame" />
            <h3 className="font-display text-[clamp(1.8rem,4vw,3rem)] uppercase text-ink">
              How a project runs
            </h3>
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 80} className="bg-bone">
                <div className="group flex h-full flex-col gap-3 bg-bone p-6 transition-colors duration-300 hover:bg-paper">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-flame">
                      {p.n}
                    </span>
                    <span className="font-display text-4xl text-ink/10 transition-colors duration-300 group-hover:text-flame/25">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="font-display text-2xl uppercase text-ink">
                    {p.t}
                  </div>
                  <p className="text-sm leading-relaxed text-ink/60">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
