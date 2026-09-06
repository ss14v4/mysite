import { useClock } from "../lib/motion";
import { useEffect, useState } from "react";

const LINKS = [
  { n: "01", label: "Works", href: "#works" },
  { n: "02", label: "Capabilities", href: "#capabilities" },
  { n: "03", label: "Recognition", href: "#recognition" },
  { n: "04", label: "About", href: "#about" },
];

export default function Nav() {
  const time = useClock();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "border-bone/10 bg-ink/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 md:px-10">
        <a
          href="#top"
          className="group flex items-baseline gap-2 font-display text-xl leading-none tracking-wide text-bone"
          data-cursor="HOME"
        >
          VOLKOV
          <span className="text-flame transition-transform duration-500 group-hover:rotate-180">
            ®
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-fog sm:inline">
            / web apps
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.n}
              href={l.href}
              className="group font-mono text-[11px] uppercase tracking-[0.22em] text-fog transition-colors hover:text-bone"
            >
              <span className="mr-1.5 text-flame/80">{l.n}</span>
              <span className="link-underline">{l.label}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 font-mono text-[11px] tracking-[0.15em] text-fog md:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-2 w-2 rounded-full bg-emerald-400 anim-pulse-dot" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            OPEN&nbsp;FOR&nbsp;Q3
          </div>
          <div className="hidden font-mono text-[11px] tabular-nums tracking-[0.15em] text-bone/70 sm:block">
            [{time}]
          </div>
          <a
            href="#connect"
            data-cursor="HIRE"
            className="border border-bone/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone transition-all duration-300 hover:border-flame hover:bg-flame hover:text-ink"
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
