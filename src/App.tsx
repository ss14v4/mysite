import { useCallback, useEffect, useRef, useState } from "react";
import { OSContext, usePRM } from "./components/os/ctx";
import type { OSApi, WinId, WinState } from "./components/os/ctx";
import { THEMES, PROJECTS } from "./lib/os-data";
import type { ThemeName } from "./lib/os-data";
import Boot from "./components/os/Boot";
import Window from "./components/os/Window";
import MatrixRain from "./components/os/MatrixRain";
import Taskbar from "./components/os/Taskbar";
import { DesktopIcons } from "./components/os/widgets";
import RightRail from "./components/os/RightRail";
import TerminalWin from "./components/os/TerminalWin";
import AboutWin from "./components/os/AboutWin";
import ReadmeWin from "./components/os/ReadmeWin";
import { ProjectsList, ProjectViewer } from "./components/os/ProjectsWin";

const TITLES: Record<WinId, string> = {
  about: "about.txt — resume",
  projects: "projects/ — file explorer",
  terminal: "alex@volkovos: ~",
  viewer: "viewer — project details",
  readme: "README.md",
};
const ICONS: Record<WinId, string> = {
  about: "▤", projects: "▦", terminal: ">_", viewer: "◧", readme: "?",
};
const HOTKEYS: Record<string, WinId> = {
  "1": "about", "2": "projects", "3": "terminal", "4": "viewer", "5": "readme",
};

function initialWins(): Record<WinId, WinState> {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const mk = (id: WinId, x: number, y: number, w: number, h: number, z: number): WinState => ({
    id, open: false, min: false, max: false,
    x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), z,
    born: Date.now(),
  });
  return {
    about: mk("about", vw * 0.055, vh * 0.08, Math.min(560, vw * 0.37), Math.min(590, vh * 0.76), 11),
    projects: mk("projects", vw * 0.42, vh * 0.05, Math.min(540, vw * 0.34), Math.min(500, vh * 0.6), 12),
    readme: mk("readme", vw * 0.63, vh * 0.2, Math.min(470, vw * 0.31), Math.min(480, vh * 0.62), 13),
    viewer: mk("viewer", vw * 0.44, vh * 0.13, Math.min(560, vw * 0.35), Math.min(620, vh * 0.78), 14),
    terminal: mk("terminal", vw * 0.15, vh * 0.58, Math.min(640, vw * 0.42), Math.min(350, vh * 0.34), 15),
  };
}

export default function App() {
  const prm = usePRM();
  const [phase, setPhase] = useState<"boot" | "os">("boot");
  const [wins, setWins] = useState<Record<WinId, WinState>>(initialWins);
  const [focused, setFocused] = useState<WinId | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeName>("green");
  const [boosted, setBoosted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);
  const zTop = useRef(15);
  const boostT = useRef<number | null>(null);
  const toastT = useRef<number | null>(null);

  const patch = useCallback((id: WinId, p: Partial<WinState>) => {
    setWins((prev) => ({ ...prev, [id]: { ...prev[id], ...p } }));
  }, []);

  const focus = useCallback((id: WinId) => {
    zTop.current += 1;
    patch(id, { z: zTop.current });
    setFocused(id);
  }, [patch]);

  const open = useCallback((id: WinId, opts?: { center?: boolean }) => {
    zTop.current += 1;
    const z = zTop.current;
    setWins((prev) => {
      const w = prev[id];
      const wasClosed = !w.open;
      // explicit opt wins; otherwise a fresh launch (was closed) re-centers
      const shouldCenter = opts ? !!opts.center : wasClosed;
      const next: WinState = { ...w, open: true, min: false, z };
      if (shouldCenter && !w.max && typeof window !== "undefined" && window.innerWidth >= 768) {
        next.x = Math.max(6, Math.round((window.innerWidth - w.w) / 2));
        next.y = Math.max(6, Math.round((window.innerHeight - 44 - w.h) / 2));
        next.born = Date.now();
      }
      return { ...prev, [id]: next };
    });
    setFocused(id);
  }, []);

  const close = useCallback((id: WinId) => {
    patch(id, { open: false, min: false, max: false });
    setFocused((f) => (f === id ? null : f));
  }, [patch]);

  const minimize = useCallback((id: WinId) => {
    patch(id, { min: true });
    setFocused((f) => (f === id ? null : f));
  }, [patch]);

  const toggleMax = useCallback((id: WinId) => {
    setWins((prev) => {
      const w = prev[id];
      zTop.current += 1;
      return { ...prev, [id]: { ...w, max: !w.max, z: zTop.current } };
    });
    setFocused(id);
  }, []);

  const move = useCallback((id: WinId, x: number, y: number) => {
    patch(id, { x, y });
  }, [patch]);

  const openViewer = useCallback((slug: string) => {
    setSelected(slug);
    open("viewer");
  }, [open]);

  const toastFn = useCallback((msg: string) => {
    if (toastT.current) window.clearTimeout(toastT.current);
    setToast({ msg, id: Date.now() });
    toastT.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const setThemeFn = useCallback((t: ThemeName) => setTheme(t), []);
  const cycleTheme = useCallback(() => {
    setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);
  }, []);

  const boost = useCallback(() => {
    if (boostT.current) window.clearTimeout(boostT.current);
    setBoosted(true);
    boostT.current = window.setTimeout(() => setBoosted(false), 5000);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const launch = useCallback(() => {
    setPhase("os");
    window.setTimeout(() => open("about", { center: false }), 250);
    window.setTimeout(() => open("projects", { center: false }), 520);
    window.setTimeout(() => open("terminal", { center: false }), 800);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const id = HOTKEYS[e.key];
      if (id) {
        e.preventDefault();
        if (id === "viewer" && !selected) setSelected(PROJECTS[0].id);
        open(id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, selected]);

  const api: OSApi = {
    wins, focused, selected,
    open, close, minimize, toggleMax, focus, move,
    openViewer, toast: toastFn,
    theme, setTheme: setThemeFn, cycleTheme,
    boost, boosted,
    launched: phase === "os",
  };

  return (
    <OSContext.Provider value={api}>
      <div className="crt relative h-dvh w-full overflow-hidden bg-[var(--bg)]">
        {/* ambient layers */}
        <div className="os-grid absolute inset-0" aria-hidden />
        <div className="glow-a" aria-hidden />
        <div className="glow-b" aria-hidden />
        <MatrixRain boost={boosted} prm={prm} />

        {phase === "os" && (
          <div className="absolute inset-x-0 bottom-11 top-0">
            <DesktopIcons />
            <RightRail />

            <Window id="about" title={TITLES.about} icon={ICONS.about} bootDelay={0}>
              <AboutWin />
            </Window>
            <Window id="projects" title={TITLES.projects} icon={ICONS.projects} bootDelay={130}>
              <ProjectsList />
            </Window>
            <Window id="viewer" title={TITLES.viewer} icon={ICONS.viewer} bootDelay={260}>
              <ProjectViewer />
            </Window>
            <Window id="readme" title={TITLES.readme} icon={ICONS.readme} bootDelay={390}>
              <ReadmeWin />
            </Window>
            <Window id="terminal" title={TITLES.terminal} icon={ICONS.terminal} bootDelay={520}>
              <TerminalWin />
            </Window>
          </div>
        )}

        <Taskbar />

        {toast && (
          <div
            key={toast.id}
            className="toast fixed right-3 top-3 z-[80] flex items-center gap-2 border border-[var(--line2)] bg-[var(--panel)] px-3 py-2 font-mono2 text-[10px] uppercase tracking-[0.18em] text-[var(--acc)] shadow-[0_14px_40px_rgba(0,0,0,0.55)]"
          >
            <span className="led" />
            <span>sys:</span>
            <span className="text-[var(--txt)]">{toast.msg}</span>
          </div>
        )}
      </div>

      {phase === "boot" && <Boot onDone={launch} />}
    </OSContext.Provider>
  );
}
