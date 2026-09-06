import { useState } from "react";
import { EMAIL, SOCIALS } from "../lib/data";
import { Reveal, SectionTag, useClock } from "../lib/motion";
import {
  ArrowUpRight,
  Asterisk,
  CheckIcon,
  CopyIcon,
  MarkGitHub,
  MarkLinkedIn,
  MarkTelegram,
  MarkX,
} from "../lib/icons";

const MARKS = [MarkGitHub, MarkLinkedIn, MarkTelegram, MarkX];

export default function Connect() {
  const time = useClock();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <footer id="connect" className="relative scroll-mt-20 overflow-hidden bg-ink">
      <div className="grid-lines pointer-events-none absolute inset-0" />
      <div className="anim-drift-a pointer-events-none absolute left-[-12%] bottom-[-20%] h-[44vw] w-[44vw] rounded-full bg-flame/[0.08] blur-[110px]" />

      <div className="relative mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-32">
        <SectionTag index="05" label="Connect" />

        <Reveal className="mt-10">
          <h2 className="font-display uppercase leading-[0.9] text-bone">
            <span className="block text-[clamp(2.6rem,9vw,8.5rem)]">
              Got an idea?
            </span>
            <span className="block text-[clamp(2.6rem,9vw,8.5rem)] text-outline">
              Let's ship it<span className="text-flame">.</span>
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-10 border-t border-bone/12 pt-10 lg:grid-cols-12">
          {/* email */}
          <div className="lg:col-span-7">
            <Reveal className="font-mono text-[10px] uppercase tracking-[0.28em] text-fog/70">
              Email — average reply: under 24h
            </Reveal>
            <Reveal delay={80} className="mt-4 flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${EMAIL}?subject=Project%20enquiry%20—%20web%20app`}
                data-cursor="WRITE"
                className="link-underline font-display text-[clamp(1.4rem,4vw,3.2rem)] text-bone transition-colors hover:text-flame"
              >
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={copy}
                data-cursor={copied ? "DONE" : "COPY"}
                className={`flex h-11 items-center gap-2 border px-4 font-mono text-[10px] uppercase tracking-[0.22em] transition-all duration-300 ${
                  copied
                    ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                    : "border-bone/25 text-bone hover:border-flame hover:bg-flame hover:text-ink"
                }`}
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </Reveal>

            <Reveal delay={140} className="mt-8 max-w-md text-sm leading-relaxed text-fog">
              Tell me what you're building, your timeline and what "done"
              looks like. I'll reply with honest feedback — even if the answer
              is "you don't need me for this."
            </Reveal>

            <Reveal delay={200} className="mt-8">
              <a
                href={`mailto:${EMAIL}?subject=Discovery%20call%20request`}
                data-cursor="BOOK"
                className="group inline-flex items-center gap-3 bg-flame px-7 py-4 font-mono text-[11px] uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-1"
              >
                Book a 30-min discovery call
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </Reveal>
          </div>

          {/* socials */}
          <div className="lg:col-span-5">
            <Reveal className="font-mono text-[10px] uppercase tracking-[0.28em] text-fog/70">
              Elsewhere
            </Reveal>
            <ul className="mt-4 divide-y divide-bone/10 border-y border-bone/10">
              {SOCIALS.map((s, i) => {
                const Mark = MARKS[i % MARKS.length];
                return (
                  <Reveal key={s.label} as="li" delay={i * 60}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="VISIT"
                      className="group flex items-center gap-4 py-4 transition-all duration-300 hover:pl-3"
                    >
                      <Mark className="h-5 w-5 text-fog transition-colors duration-300 group-hover:text-flame" />
                      <span className="flex-1 font-display text-xl uppercase text-bone/85 transition-colors group-hover:text-bone md:text-2xl">
                        {s.label}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.18em] text-fog/60">
                        {s.handle}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-fog/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-flame" />
                    </a>
                  </Reveal>
                );
              })}
            </ul>

            <Reveal delay={260} className="mt-8 flex items-center justify-between border border-bone/12 bg-coal/70 px-5 py-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Booking Q3 2026
              </div>
              <div className="font-mono text-[11px] tabular-nums tracking-[0.15em] text-bone/70">
                Your time — {time}
              </div>
            </Reveal>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-bone/12 py-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog/60">
            © 2026 Alex Volkov® — designed & built by hand
          </span>
          <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-fog/40 md:flex">
            React · Vite · Tailwind · no templates were harmed
            <Asterisk className="h-3.5 w-3.5 text-flame/70" />
          </span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-cursor="TOP"
            className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-fog transition-colors hover:text-flame"
          >
            Back to top
            <ArrowUpRight className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}
