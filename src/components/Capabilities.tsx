import { CAPABILITIES } from "../lib/data";
import { Reveal, SectionTag } from "../lib/motion";
import {
  ArrowUpRight,
  GlyphApp,
  GlyphCart,
  GlyphChart,
  GlyphRocket,
  GlyphSpark,
} from "../lib/icons";

const GLYPHS = [GlyphApp, GlyphRocket, GlyphChart, GlyphCart, GlyphSpark];

export default function Capabilities() {
  return (
    <section
      id="capabilities"
      className="relative scroll-mt-20 bg-bone py-24 text-ink md:py-32"
    >
      <div className="grid-lines-dark pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <SectionTag index="02" label="Capabilities" light />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.6rem,7.5vw,6.5rem)] uppercase leading-[0.92] text-ink">
              What I build
              <span className="block text-outline-ink">end-to-end</span>
            </h2>
          </Reveal>
          <Reveal delay={120} className="max-w-xs pb-2">
            <p className="text-sm leading-relaxed text-ink/60">
              One pair of hands from architecture to the last easing curve. No
              hand-offs, no telephone game — the person who scopes it ships it.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 border-t border-ink/15">
          {CAPABILITIES.map((c, i) => {
            const Glyph = GLYPHS[i % GLYPHS.length];
            return (
              <Reveal key={c.index} delay={i * 50}>
                <div
                  className="cap-row group grid cursor-default grid-cols-[auto_1fr] items-start gap-x-5 gap-y-3 border-b border-ink/15 px-2 py-7 transition-all duration-500 hover:bg-paper md:grid-cols-[70px_56px_1fr_1.2fr_auto] md:items-center md:gap-x-8 md:px-4 md:py-8"
                >
                  <span className="cap-index font-mono text-xs tracking-[0.2em] text-ink/40">
                    {c.index}
                  </span>
                  <Glyph className="cap-glyph hidden h-9 w-9 text-ink/70 md:block" />
                  <h3 className="col-span-2 font-display text-[clamp(1.5rem,3.4vw,2.6rem)] uppercase leading-none text-ink transition-transform duration-500 group-hover:translate-x-2 md:col-span-1">
                    {c.title}
                  </h3>
                  <div>
                    <p className="max-w-md text-sm leading-relaxed text-ink/65">
                      {c.copy}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5 md:hidden">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="border border-ink/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 hidden items-center gap-4 md:col-span-1 md:flex md:justify-end">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="border border-ink/20 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink/60 transition-colors duration-300 group-hover:border-flame/60 group-hover:text-ink"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-ink/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-flame" />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/50">
            Something else in mind? I probably build that too.
          </p>
          <a
            href="#connect"
            data-cursor="ASK"
            className="shrink-0 border border-ink/30 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-bone"
          >
            Ask me →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
