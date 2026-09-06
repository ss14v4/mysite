import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { useOS } from "./ctx";
import { PROJECTS, SKILL_BARS, CONTACTS, THEMES, bar, EMAIL } from "../../lib/os-data";
import type { ThemeName } from "../../lib/os-data";
import { NeofetchContent } from "./widgets";

type Line = { prompt?: boolean; cmd?: string; node: ReactNode };

const START = Date.now();

const HELP: Array<[string, string]> = [
  ["help", "this list"],
  ["whoami", "who is this guy"],
  ["ls / projects", "list shipped web apps"],
  ["open <name>", "launch a project in the viewer"],
  ["skills", "stack proficiency, honestly measured"],
  ["contact", "ways to reach me (email is click-to-copy)"],
  ["neofetch", "system information card"],
  ["theme <green|amber|cyan|pink>", "switch phosphor theme"],
  ["matrix", "red pill, 5 seconds"],
  ["date / uptime / ping", "small talk with the OS"],
  ["clear", "wipe the terminal"],
];

export default function TerminalWin() {
  const os = useOS();
  const [lines, setLines] = useState<Line[]>([
    { node: <span className="text-[var(--dim)]">VolkovOS shell v2.4.1 — portfolio kernel loaded.</span> },
    { node: <span className="text-[var(--faint)]">type <span className="text-[var(--acc)]">help</span> to list commands, <span className="text-[var(--acc)]">open pulseboard</span> to peek at the work. ↑↓ = history, tab = autocomplete.</span> },
  ]);
  const [val, setVal] = useState("");
  const histRef = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const tOpen = os.wins.terminal.open;
  const tMin = os.wins.terminal.min;
  useEffect(() => {
    if (tOpen && !tMin) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [tOpen, tMin, os.focused]);

  const print = (...nodes: ReactNode[]) =>
    setLines((l) => [...l, ...nodes.map((node) => ({ node }))]);

  const projectList = () =>
    print(
      <span className="text-[var(--dim)]">~/projects — 6 directories:</span>,
      ...PROJECTS.map((p) => (
        <span key={p.id}>
          <span className="text-[var(--cyan)]">drwxr-xr-x</span>
          <span className="text-[var(--faint)]">  {String(p.year)}  </span>
          <span className="text-[var(--acc)]">{p.id.padEnd(14)}</span>
          <span className="text-[var(--dim)]">{p.title}</span>
        </span>
      )),
      <span className="text-[var(--faint)]">→ open &lt;name&gt; to launch the viewer</span>
    );

  const run = (raw: string) => {
    const input = raw.trim();
    setLines((l) => [...l, { prompt: true, cmd: input, node: null }]);
    if (!input) return;
    histRef.current.unshift(input);
    histIdx.current = -1;

    const [cmd, ...args] = input.split(/\s+/);
    const arg = args.join(" ").toLowerCase();

    switch (cmd.toLowerCase()) {
      case "help":
        print(
          <span className="text-[var(--txt)]">available commands:</span>,
          ...HELP.map(([c, d]) => (
            <span key={c}>
              <span className="text-[var(--acc)]">{c.padEnd(32)}</span>
              <span className="text-[var(--dim)]">{d}</span>
            </span>
          ))
        );
        return;
      case "whoami":
        print(<span className="text-[var(--acc)]">alex-volkov</span>, <span className="text-[var(--dim)]">full-stack web app developer — builds products, not pages.</span>);
        return;
      case "ls":
      case "projects":
        projectList();
        return;
      case "open": {
        const slug = PROJECTS.find((p) => p.id === arg || p.title.toLowerCase() === arg)?.id;
        if (slug) {
          os.openViewer(slug);
          print(<span className="text-[var(--acc)]">▸ launching viewer: {slug}/ — window focused.</span>);
        } else if (["about", "resume", "resume.txt", "about.txt"].includes(arg)) {
          os.open("about");
          print(<span className="text-[var(--acc)]">▸ opening about.txt</span>);
        } else if (["projects", "projects/"].includes(arg)) {
          os.open("projects");
          print(<span className="text-[var(--acc)]">▸ opening projects/</span>);
        } else if (arg === "readme" || arg === "readme.md") {
          os.open("readme");
          print(<span className="text-[var(--acc)]">▸ opening README.md</span>);
        } else {
          print(<span className="text-[var(--red)]">open: cannot find '{arg || "?"}' — try: {PROJECTS.map((p) => p.id).join(" | ")}</span>);
        }
        return;
      }
      case "skills":
        print(
          <span className="text-[var(--dim)]">proficiency matrix (self-audited, quarterly):</span>,
          ...SKILL_BARS.map(([name, v]) => (
            <span key={name}>
              <span className="text-[var(--txt)]">{name.padEnd(22)}</span>
              <span className="text-[var(--faint)]">[</span>
              <span className="text-[var(--acc)]">{bar(v).split("░")[0]}</span>
              <span className="text-[var(--faint)]">{bar(v).split("░")[1] + "]"}</span>
              <span className="text-[var(--dim)]"> {v}%</span>
            </span>
          ))
        );
        return;
      case "contact":
        print(
          <span className="text-[var(--dim)]">direct channels:</span>,
          <span>
            <span className="text-[var(--faint)]">email     </span>
            <button
              className="text-[var(--acc)] underline decoration-dotted underline-offset-4 hover:decoration-solid"
              onClick={() => {
                navigator.clipboard?.writeText(EMAIL);
                os.toast(`COPIED: ${EMAIL}`);
              }}
            >
              {EMAIL} ⧉ click to copy
            </button>
          </span>,
          ...CONTACTS.filter((c) => c.label !== "email").map((c) => (
            <span key={c.label}>
              <span className="text-[var(--faint)]">{c.label.padEnd(10)}</span>
              <a className="alink text-[var(--cyan)]" href={c.href} target="_blank" rel="noreferrer">{c.value}</a>
            </span>
          ))
        );
        return;
      case "neofetch":
        print(<NeofetchContent />);
        return;
      case "clear":
        setLines([]);
        return;
      case "date":
        print(<span className="text-[var(--txt)]">{new Date().toString()}</span>);
        return;
      case "uptime": {
        const s = Math.floor((Date.now() - START) / 1000);
        print(<span className="text-[var(--txt)]">up {Math.floor(s / 60)}m {s % 60}s — this session. career uptime: 6+ years.</span>);
        return;
      }
      case "ping":
        print(<span className="text-[var(--dim)]">PING motivation.local — 64 bytes: <span className="text-[var(--acc)]">pong</span> in 42ms. 0% packet loss, ever.</span>);
        return;
      case "theme": {
        const t = arg as ThemeName;
        if ((THEMES as readonly string[]).includes(t)) {
          os.setTheme(t);
          print(<span className="text-[var(--acc)]">▸ phosphor theme set to {t}. the whole OS just re-tinted — look around.</span>);
        } else {
          print(<span className="text-[var(--red)]">usage: theme &lt;{THEMES.join("|")}&gt;</span>);
        }
        return;
      }
      case "matrix":
        os.boost();
        print(<span className="text-[var(--acc)]">▸ wake up, recruiter… the matrix has you for 5 seconds.</span>);
        return;
      case "sudo":
        print(<span className="text-[var(--red)]">alex is not in the sudoers file. This incident will be reported to HR.</span>);
        return;
      case "rm":
        print(<span className="text-[var(--red)]">nice try. this portfolio is mounted read-only.</span>);
        return;
      case "cat":
        if (arg.includes("resume") || arg.includes("about")) {
          os.open("about");
          print(<span className="text-[var(--acc)]">▸ about.txt is a GUI citizen now — window opened.</span>);
        } else {
          print(<span className="text-[var(--dim)]">cat: {arg || "?"}: this is a windowed OS, friend. click something.</span>);
        }
        return;
      case "vim":
      case "vi":
        print(<span className="text-[var(--dim)]">launching vim… just kidding. nobody exits vim on the first try. use the × button.</span>);
        return;
      case "exit":
        print(<span className="text-[var(--dim)]">there is no escape from VolkovOS. (minimize me, coward.)</span>);
        return;
      case "coffee":
        print(<span className="text-[var(--acc)]">brewing ██████████ done. productivity +100%, jitter +40%.</span>);
        return;
      default:
        print(<span className="text-[var(--red)]">command not found: {cmd}</span>, <span className="text-[var(--faint)]">try `help` — or was that a project name? `open {cmd}`</span>);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(val);
    setVal("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = histRef.current;
      if (h.length) {
        histIdx.current = Math.min(histIdx.current + 1, h.length - 1);
        setVal(h[histIdx.current]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = histRef.current;
      if (histIdx.current > 0) {
        histIdx.current -= 1;
        setVal(h[histIdx.current]);
      } else {
        histIdx.current = -1;
        setVal("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const names = [...HELP.map(([c]) => c.split(" ")[0]), ...PROJECTS.map((p) => `open ${p.id}`)];
      const hit = names.filter((n) => n.startsWith(val) && val.length > 0);
      if (hit.length === 1) setVal(hit[0]);
      else if (hit.length > 1) print(<span className="text-[var(--faint)]">{hit.join("   ")}</span>);
    }
  };

  return (
    <div
      className="flex h-full flex-col bg-[color-mix(in_srgb,var(--bg2)_88%,transparent)] font-mono2 text-[12px]"
      onPointerDown={() => inputRef.current?.focus()}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        {lines.map((l, i) => (
          <div key={i} className="term-line">
            {l.prompt ? (
              <>
                <Prompt />
                <span className="text-[var(--txt)]">{l.cmd}</span>
              </>
            ) : (
              l.node
            )}
          </div>
        ))}
        <form onSubmit={submit} className="term-line flex items-center gap-0">
          <Prompt />
          <input
            ref={inputRef}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={onKey}
            className="min-w-0 flex-1 border-none bg-transparent text-[var(--txt)] caret-[var(--acc)] outline-none"
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            aria-label="terminal input"
          />
          {!val && <span className="term-caret -ml-2" />}
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function Prompt() {
  return (
    <span className="mr-1 whitespace-pre">
      <span className="text-[var(--acc)]">alex@volkovos</span>
      <span className="text-[var(--faint)]">:</span>
      <span className="text-[var(--cyan)]">~</span>
      <span className="text-[var(--faint)]">$ </span>
    </span>
  );
}
