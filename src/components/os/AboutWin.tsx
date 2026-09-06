import { useOS } from "./ctx";
import { SKILL_BARS, EXPERIENCE, CONTACTS, bar, EMAIL } from "../../lib/os-data";

function Head({ children }: { children: string }) {
  return (
    <div className="mb-3 mt-7 flex items-center gap-3 first:mt-0">
      <span className="font-mono2 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--acc)]">// {children}</span>
      <span className="h-px flex-1 bg-[var(--line2)]" />
    </div>
  );
}

export default function AboutWin() {
  const os = useOS();

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    os.toast(`${label.toUpperCase()} COPIED TO CLIPBOARD`);
  };

  return (
    <div className="h-full px-5 py-5 font-mono2 text-[12px] leading-relaxed">
      {/* identity */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-disp text-4xl leading-none tracking-wide text-[var(--txt)]">
            ALEX <span className="text-[var(--acc)]" style={{ textShadow: "0 0 18px var(--acc-glow)" }}>VOLKOV</span>
          </h2>
          <div className="mt-1.5 text-[11px] uppercase tracking-[0.22em] text-[var(--dim)]">
            full-stack web app developer
          </div>
        </div>
        <pre className="hidden text-[9px] leading-[1.15] text-[var(--faint)] sm:block">{`┌─ status ─┐
│ open for │
│ freelance│
└──────────┘`}</pre>
      </div>

      <div className="mt-4 border border-[var(--line)] bg-[var(--panel2)] px-3 py-2 text-[11px]">
        <span className="led mr-2 inline-block align-middle" />
        <span className="text-[var(--acc)]">AVAILABLE</span>
        <span className="text-[var(--dim)]"> — taking Q3 2026 projects · remote worldwide · UTC+3</span>
      </div>

      {/* profile */}
      <Head>profile</Head>
      <p className="text-[var(--dim)]">
        I design and build <span className="text-[var(--txt)]">web applications end-to-end</span> — schema,
        API, auth, realtime, and the kind of UI that makes people slow down and look.
        Six years in, <span className="text-[var(--txt)]">20+ products shipped</span>: dashboards, SaaS tools,
        e-commerce, interactive experiences. My favourite stack is the one that ships on Friday.
      </p>

      {/* skills */}
      <Head>skill matrix</Head>
      <div className="space-y-1.5">
        {SKILL_BARS.map(([name, v]) => (
          <div key={name} className="group flex items-center gap-3">
            <span className="w-40 shrink-0 text-[11px] text-[var(--txt)] transition-colors group-hover:text-[var(--acc)]">{name}</span>
            <span className="text-[11px] tracking-tight">
              <span className="text-[var(--faint)]">[</span>
              <span className="text-[var(--acc)]" style={{ textShadow: "0 0 8px var(--acc-glow)" }}>{bar(v).split("░")[0]}</span>
              <span className="text-[var(--line2)]">{bar(v).split("░")[1]}</span>
              <span className="text-[var(--faint)]">]</span>
            </span>
            <span className="ml-auto text-[10px] font-bold text-[var(--dim)]">{v}%</span>
          </div>
        ))}
      </div>

      {/* experience */}
      <Head>execution log</Head>
      <div className="space-y-4">
        {EXPERIENCE.map((e) => (
          <div key={e.period} className="group grid grid-cols-[86px_1fr] gap-3 border-l border-[var(--line2)] pl-3 transition-colors hover:border-[var(--acc)]">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-[var(--acc)]">{e.period}</div>
              <div className="mt-0.5 inline-block border border-[var(--line2)] px-1.5 py-px text-[8px] uppercase tracking-widest text-[var(--faint)] transition-colors group-hover:border-[var(--acc)] group-hover:text-[var(--acc)]">
                {e.tag}
              </div>
            </div>
            <div>
              <div className="text-[12px] font-bold text-[var(--txt)]">{e.role}</div>
              <div className="text-[11px] text-[var(--cyan)]">@ {e.org}</div>
              <div className="mt-1 text-[11px] text-[var(--dim)]">{e.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* contacts */}
      <Head>uplink</Head>
      <div className="space-y-1">
        {CONTACTS.map((c) => (
          <div key={c.label} className="frow flex items-center gap-3 border border-transparent px-1 py-1">
            <span className="w-16 text-[10px] uppercase tracking-widest text-[var(--faint)]">{c.label}</span>
            {c.copy ? (
              <button onClick={() => copy(c.copy!, c.label)} className="alink text-[11px] text-[var(--acc)]" title="click to copy">
                {c.value} ⧉
              </button>
            ) : (
              <a href={c.href} target="_blank" rel="noreferrer" className="alink text-[11px] text-[var(--cyan)]">
                {c.value} ↗
              </a>
            )}
            {c.copy && (
              <button
                onClick={() => copy(EMAIL, "email")}
                className="ml-auto border border-[var(--line2)] px-2 py-0.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]"
              >
                copy
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-7 border-t border-[var(--line)] pt-3 text-[9px] uppercase tracking-[0.25em] text-[var(--faint)]">
        about.txt · last modified 2026 · rendered in one viewport · scrollbars: 0
      </div>
    </div>
  );
}
