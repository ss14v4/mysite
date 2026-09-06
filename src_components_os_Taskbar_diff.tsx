--- src/components/os/Taskbar.tsx (原始)
import { useRef, useState } from "react";
import { useOS, useClock } from "./ctx";
import type { WinId } from "./ctx";
import { useTip } from "./Tip";
import { useCMS } from "../../lib/cms";
import { THEMES, THEME_HEX } from "../../lib/os-data";

const ICONS: Record<WinId, string> = {
  about: "▤", projects: "▦", terminal: ">_", viewer: "◧", readme: "?", cms: "▣", blog: "≣",
};
const TITLES: Record<WinId, string> = {
  about: "about.txt", projects: "projects/", terminal: "terminal", viewer: "viewer", readme: "README.md", cms: "cms.sys", blog: "blog.md",
};
const HINTS: Record<WinId, string[]> = {
  about: ["full resume dossier", "skills · experience · uplinks", "alt+1"],
  projects: ["file explorer", "dirs · click to open viewer", "alt+2"],
  terminal: ["real command shell", "try: help · ls · open karta", "alt+3"],
  viewer: ["project screenshots", "metrics · stack · role", "alt+4"],
  readme: ["how to drive this OS", "hotkeys · commands · specs", "alt+5"],
  cms: ["content control system", "login: demo creds inside", "alt+6"],
  blog: ["articles & notes", "markdown-lite · figures · forms", "alt+7"],
};

export default function Taskbar() {
  const os = useOS();
  const tip = useTip();
  const cms = useCMS();
  const now = useClock(1000);
  const bootAt = useRef(Date.now());
  const [menu, setMenu] = useState(false);

  const openWins = (Object.values(os.wins)).filter((w) => w.open);
  const up = Math.floor((now.getTime() - bootAt.current) / 1000);
  const upStr = `${String(Math.floor(up / 60)).padStart(2, "0")}:${String(up % 60).padStart(2, "0")}`;

  const clickWin = (id: WinId) => {
    const w = os.wins[id];
    if (w.min || os.focused !== id) os.open(id);
    else os.minimize(id);
  };

  return (
    <div className="taskbar absolute inset-x-0 bottom-0 z-40 flex h-11 items-center gap-1 px-2 font-mono2 text-[11px]">
      {/* start */}
      <div className="relative">
        <button
          onClick={() => setMenu((m) => !m)}
          className={`tbtn flex items-center gap-2 border border-[var(--line2)] px-3 py-1.5 ${menu ? "active" : ""}`}
        >
          <span className="led" />
          <span className="font-disp text-[15px] tracking-[0.18em]">VOLKOV/OS</span>
        </button>
        {menu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
            <div className="startpop absolute bottom-10 left-0 z-50 w-60 border border-[var(--line2)] bg-[var(--panel)] shadow-[0_18px_50px_rgba(0,0,0,0.6)]">
              <div className="border-b border-[var(--line)] px-3 py-2 font-disp text-sm tracking-widest text-[var(--dim)]">
                SYSTEM MENU
              </div>
              {[
                { l: "▸ README.md — how to use", f: () => os.open("readme") },
                { l: "▸ cms.sys — content control", f: () => os.open("cms", { center: true }) },
                { l: "▸ sysinfo (neofetch)", f: () => { os.open("terminal"); os.toast("HINT: TYPE `NEOFETCH` IN TERMINAL"); } },
                { l: "▸ write me an email", f: () => { window.location.href = `mailto:${cms.profile.handle}`; } },
              ].map((it, i) => (
                <button key={i} onClick={() => { it.f(); setMenu(false); }} className="frow block w-full px-3 py-2 text-left text-[11px] text-[var(--txt)]">
                  {it.l}
                </button>
              ))}
              <button
                onClick={() => window.location.reload()}
                className="frow block w-full border-t border-[var(--line)] px-3 py-2 text-left text-[11px] text-[var(--red)]"
              >
                ⟳ reboot system
              </button>
            </div>
          </>
        )}
      </div>

      <span className="mx-1 hidden h-5 w-px bg-[var(--line2)] sm:block" />

      {/* running windows */}
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {openWins.map((w) => (
          <button
            key={w.id}
            onClick={() => clickWin(w.id)}
            className={`tbtn flex shrink-0 items-center gap-1.5 border border-transparent px-2.5 py-1.5 ${os.focused === w.id && !w.min ? "active" : "text-[var(--dim)]"}`}
            {...tip.handlers({ kind: "text", title: TITLES[w.id], lines: HINTS[w.id], glyph: ICONS[w.id] })}
          >
            <span className={os.focused === w.id && !w.min ? "text-[var(--acc)]" : ""}>{ICONS[w.id]}</span>
            <span className="hidden max-w-28 truncate sm:block">{TITLES[w.id]}</span>
            {w.min && <span className="text-[9px] text-[var(--faint)]">(min)</span>}
          </button>
        ))}
        {openWins.length === 0 && (
          <span className="px-2 text-[var(--faint)]">// no windows — click a desktop icon or press alt+1…5</span>
        )}
      </div>

      {/* right cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={os.cycleTheme}
          className="tbtn hidden items-center gap-1.5 border border-[var(--line2)] px-2 py-1.5 md:flex"
          title="cycle phosphor theme (or: `theme <name>` in terminal)"
        >
          <span className="h-2.5 w-2.5" style={{ background: THEME_HEX[os.theme], boxShadow: `0 0 8px ${THEME_HEX[os.theme]}` }} />
          <span className="uppercase tracking-widest">{os.theme}</span>
        </button>
        <button
          onClick={os.boost}
          className="tbtn hidden border border-[var(--line2)] px-2 py-1.5 uppercase tracking-widest lg:block"
          title="matrix rain burst"
        >
          ◍ matrix
        </button>
        <span className="hidden items-center gap-1.5 text-[var(--faint)] sm:flex">
          <span className="led led-amber" />
          up {upStr}
        </span>
        <span className="text-right leading-tight">
          <span className="block text-[12px] font-bold text-[var(--txt)]">
            {now.toLocaleTimeString("en-GB")}
          </span>
          <span className="block text-[9px] uppercase tracking-widest text-[var(--faint)]">
            {now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · local
          </span>
        </span>
      </div>
    </div>
  );
}


+++ src/components/os/Taskbar.tsx (修改后)
import { useRef, useState } from "react";
import { useOS, useClock } from "./ctx";
import type { WinId } from "./ctx";
import { useTip } from "./Tip";
import { useCMS } from "../../lib/cms";
import { THEMES, THEME_HEX } from "../../lib/os-data";

const ICONS: Record<WinId, string> = {
  about: "▤", projects: "▦", terminal: ">_", viewer: "◧", readme: "?", cms: "▣", blog: "▣",
  article: "≣", game: "▲", scores: "♛",
};
const TITLES: Record<WinId, string> = {
  about: "about.txt", projects: "projects/", terminal: "terminal", viewer: "viewer", readme: "README.md", cms: "cms.sys", blog: "blog.md",
  article: "reader", game: "arcade", scores: "leaderboard",
};
const HINTS: Record<WinId, string[]> = {
  about: ["full resume dossier", "skills · experience · uplinks", "alt+1"],
  projects: ["file explorer", "dirs · click to open viewer", "alt+2"],
  terminal: ["real command shell", "try: help · ls · open karta", "alt+3"],
  viewer: ["project screenshots", "metrics · stack · role", "alt+4"],
  readme: ["how to drive this OS", "hotkeys · commands · specs", "alt+5"],
  cms: ["content control system", "login: demo creds inside", "alt+6"],
  blog: ["articles folder", "click a file to read", "alt+7"],
  article: ["article reader", "figures · lightbox · uplink form"],
  game: ["arcade game", "records feed the leaderboard"],
  scores: ["local top-10 per game", "edit your handle inside"],
};

export default function Taskbar() {
  const os = useOS();
  const tip = useTip();
  const cms = useCMS();
  const now = useClock(1000);
  const bootAt = useRef(Date.now());
  const [menu, setMenu] = useState(false);

  const openWins = (Object.values(os.wins)).filter((w) => w.open);
  const up = Math.floor((now.getTime() - bootAt.current) / 1000);
  const upStr = `${String(Math.floor(up / 60)).padStart(2, "0")}:${String(up % 60).padStart(2, "0")}`;

  const clickWin = (id: WinId) => {
    const w = os.wins[id];
    if (w.min || os.focused !== id) os.open(id);
    else os.minimize(id);
  };

  return (
    <div className="taskbar absolute inset-x-0 bottom-0 z-40 flex h-11 items-center gap-1 px-2 font-mono2 text-[11px]">
      {/* start */}
      <div className="relative">
        <button
          onClick={() => setMenu((m) => !m)}
          className={`tbtn flex items-center gap-2 border border-[var(--line2)] px-3 py-1.5 ${menu ? "active" : ""}`}
        >
          <span className="led" />
          <span className="font-disp text-[15px] tracking-[0.18em]">VOLKOV/OS</span>
        </button>
        {menu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
            <div className="startpop absolute bottom-10 left-0 z-50 w-60 border border-[var(--line2)] bg-[var(--panel)] shadow-[0_18px_50px_rgba(0,0,0,0.6)]">
              <div className="border-b border-[var(--line)] px-3 py-2 font-disp text-sm tracking-widest text-[var(--dim)]">
                SYSTEM MENU
              </div>
              {[
                { l: "▸ README.md — how to use", f: () => os.open("readme") },
                { l: "▸ cms.sys — content control", f: () => os.open("cms", { center: true }) },
                { l: "▸ sysinfo (neofetch)", f: () => { os.open("terminal"); os.toast("HINT: TYPE `NEOFETCH` IN TERMINAL"); } },
                { l: "▸ write me an email", f: () => { window.location.href = `mailto:${cms.profile.handle}`; } },
              ].map((it, i) => (
                <button key={i} onClick={() => { it.f(); setMenu(false); }} className="frow block w-full px-3 py-2 text-left text-[11px] text-[var(--txt)]">
                  {it.l}
                </button>
              ))}
              <button
                onClick={() => window.location.reload()}
                className="frow block w-full border-t border-[var(--line)] px-3 py-2 text-left text-[11px] text-[var(--red)]"
              >
                ⟳ reboot system
              </button>
            </div>
          </>
        )}
      </div>

      <span className="mx-1 hidden h-5 w-px bg-[var(--line2)] sm:block" />

      {/* running windows */}
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {openWins.map((w) => (
          <button
            key={w.id}
            onClick={() => clickWin(w.id)}
            className={`tbtn flex shrink-0 items-center gap-1.5 border border-transparent px-2.5 py-1.5 ${os.focused === w.id && !w.min ? "active" : "text-[var(--dim)]"}`}
            {...tip.handlers({ kind: "text", title: TITLES[w.id], lines: HINTS[w.id], glyph: ICONS[w.id] })}
          >
            <span className={os.focused === w.id && !w.min ? "text-[var(--acc)]" : ""}>{ICONS[w.id]}</span>
            <span className="hidden max-w-28 truncate sm:block">{TITLES[w.id]}</span>
            {w.min && <span className="text-[9px] text-[var(--faint)]">(min)</span>}
          </button>
        ))}
        {openWins.length === 0 && (
          <span className="px-2 text-[var(--faint)]">// no windows — click a desktop icon or press alt+1…5</span>
        )}
      </div>

      {/* right cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={os.cycleTheme}
          className="tbtn hidden items-center gap-1.5 border border-[var(--line2)] px-2 py-1.5 md:flex"
          title="cycle phosphor theme (or: `theme <name>` in terminal)"
        >
          <span className="h-2.5 w-2.5" style={{ background: THEME_HEX[os.theme], boxShadow: `0 0 8px ${THEME_HEX[os.theme]}` }} />
          <span className="uppercase tracking-widest">{os.theme}</span>
        </button>
        <button
          onClick={os.boost}
          className="tbtn hidden border border-[var(--line2)] px-2 py-1.5 uppercase tracking-widest lg:block"
          title="matrix rain burst"
        >
          ◍ matrix
        </button>
        <span className="hidden items-center gap-1.5 text-[var(--faint)] sm:flex">
          <span className="led led-amber" />
          up {upStr}
        </span>
        <span className="text-right leading-tight">
          <span className="block text-[12px] font-bold text-[var(--txt)]">
            {now.toLocaleTimeString("en-GB")}
          </span>
          <span className="block text-[9px] uppercase tracking-widest text-[var(--faint)]">
            {now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · local
          </span>
        </span>
      </div>
    </div>
  );
}
