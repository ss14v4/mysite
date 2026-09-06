import { useOS } from "./ctx";
import { PROJECTS, FILE_META, EMAIL } from "../../lib/os-data";

/* ——— ~/projects file explorer ——— */
export function ProjectsList() {
  const os = useOS();
  return (
    <div className="flex h-full flex-col font-mono2 text-[11.5px]">
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--panel2)] px-3 py-2">
        <span className="text-[var(--acc)]">alex@volkovos</span>
        <span className="text-[var(--faint)]">:</span>
        <span className="text-[var(--cyan)]">~/projects</span>
        <span className="ml-auto text-[9px] uppercase tracking-widest text-[var(--faint)]">
          {PROJECTS.length} dirs · 0 bugs*
        </span>
      </div>

      <div className="grid grid-cols-[92px_52px_44px_1fr_20px] gap-x-2 border-b border-[var(--line)] px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-[var(--faint)]">
        <span>perms</span><span>size</span><span>year</span><span>name</span><span />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        <button
          onClick={() => os.toast("ALREADY AT ~/ — THERE IS NO DEEPER")}
          className="frow grid w-full grid-cols-[92px_52px_44px_1fr_20px] gap-x-2 px-3 py-1.5 text-left"
        >
          <span className="text-[var(--cyan)]">drwxr-xr-x</span>
          <span className="text-[var(--dim)]">4.0K</span>
          <span className="text-[var(--faint)]">—</span>
          <span className="frow-name text-[var(--dim)]">..</span>
          <span />
        </button>
        {PROJECTS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => os.openViewer(p.id)}
            className="frow group grid w-full grid-cols-[92px_52px_44px_1fr_20px] items-center gap-x-2 px-3 py-2 text-left"
            title={`${p.title} — ${p.category}`}
          >
            <span className="text-[var(--cyan)]">{FILE_META[i].perms}</span>
            <span className="text-[var(--dim)]">{FILE_META[i].size}</span>
            <span className="text-[var(--faint)]">{p.year}</span>
            <span className="frow-name min-w-0">
              <span className="font-bold text-[var(--txt)]">{p.id}</span>
              <span className="text-[var(--acc)]">/</span>
              <span className="ml-2 hidden text-[10px] text-[var(--dim)] sm:inline">{p.category}</span>
            </span>
            <span className="text-right text-[var(--acc)] opacity-0 transition-opacity group-hover:opacity-100">»</span>
          </button>
        ))}
      </div>

      <div className="border-t border-[var(--line)] bg-[var(--panel2)] px-3 py-2 text-[9.5px] uppercase tracking-[0.18em] text-[var(--faint)]">
        click a dir — or type <span className="text-[var(--acc)]">open karta</span> in the terminal · *bugs live in /dev/null
      </div>
    </div>
  );
}

/* ——— project viewer window ——— */
export function ProjectViewer() {
  const os = useOS();
  const p = PROJECTS.find((x) => x.id === os.selected) ?? PROJECTS[0];

  return (
    <div className="h-full px-5 py-4 font-mono2 text-[12px]">
      <div className="flex items-center gap-2 text-[10.5px]">
        <span className="text-[var(--faint)]">~/projects/</span>
        <span className="text-[var(--acc)]">{p.id}/</span>
        <span className="ml-auto text-[9px] uppercase tracking-widest text-[var(--faint)]">
          index {p.index} / 0{PROJECTS.length}
        </span>
      </div>

      {/* prev / next */}
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={() => os.openViewer(PROJECTS[(PROJECTS.findIndex((x) => x.id === p.id) + PROJECTS.length - 1) % PROJECTS.length].id)}
          className="border border-[var(--line2)] px-2 py-0.5 text-[10px] text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]"
        >
          ← prev
        </button>
        <button
          onClick={() => os.openViewer(PROJECTS[(PROJECTS.findIndex((x) => x.id === p.id) + 1) % PROJECTS.length].id)}
          className="border border-[var(--line2)] px-2 py-0.5 text-[10px] text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]"
        >
          next →
        </button>
      </div>

      <div className="img-scan group mt-3 overflow-hidden border border-[var(--line2)]">
        <img
          src={p.image}
          alt={`${p.title} — ${p.category}`}
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-disp text-3xl leading-none tracking-wide text-[var(--txt)]">{p.title}</h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)]">{p.category}</span>
        <span className="text-[10px] text-[var(--faint)]">· {p.year}</span>
      </div>

      <p className="mt-2 leading-relaxed text-[var(--dim)]">{p.summary}</p>
      <p className="mt-1.5 text-[11px]">
        <span className="text-[var(--faint)]">role:</span>{" "}
        <span className="text-[var(--txt)]">{p.role}</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.stack.map((s) => (
          <span key={s} className="border border-[var(--line2)] px-2 py-0.5 text-[10px] text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[var(--line)] py-3">
        {p.metrics.map((m) => (
          <div key={m.label}>
            <div className="font-disp text-2xl leading-none text-[var(--acc)]" style={{ textShadow: "0 0 14px var(--acc-glow)" }}>
              {m.value}
            </div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[var(--faint)]">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`mailto:${EMAIL}?subject=Demo request%3A ${encodeURIComponent(p.title)}&body=Hey Alex%2C show me ${encodeURIComponent(p.title)} live!`}
          className="border border-[var(--acc)] bg-[var(--acc-dim)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--acc)] transition-all hover:bg-[var(--acc)] hover:text-[var(--bg)]"
        >
          request live demo ↗
        </a>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(p.stack.join(", "));
            os.toast(`STACK COPIED: ${p.stack.join(" · ")}`);
          }}
          className="border border-[var(--line2)] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--dim)] transition-colors hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
        >
          copy stack ⧉
        </button>
      </div>
    </div>
  );
}
