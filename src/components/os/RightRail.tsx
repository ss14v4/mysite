import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useOS } from "./ctx";
import { SysmonWidget } from "./widgets";
import { EMAIL } from "../../lib/os-data";

const AVATAR =
  "https://image.qwenlm.ai/generated-images/614bd58f-2126-42f4-ab93-3eca515f60ac/_result.png";

function Head({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div className="widget-head flex items-center justify-between border-b border-[var(--line)] px-2.5 py-1.5">
      <span>{label}</span>
      {right ?? <span className="led" />}
    </div>
  );
}

/* ——— 1 · operator profile ——— */
const STATS: Array<[string, number]> = [
  ["frontend", 95],
  ["backend", 88],
  ["ui / motion", 91],
  ["devops", 72],
  ["charisma", 64],
];

function ProfileWidget() {
  const os = useOS();
  const [ping, setPing] = useState(23);
  useEffect(() => {
    const t = setInterval(() => setPing(14 + Math.floor(Math.random() * 26)), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="widget shrink-0">
      <Head label="operator.json" right={<span className="text-[var(--acc)]">● rec</span>} />
      <div className="flex gap-3 p-3">
        <div className="avatar-frame relative h-[86px] w-[86px] shrink-0">
          <img src={AVATAR} alt="Alex Volkov — operator" className="avatar-img h-full w-full object-cover" />
          <span className="led absolute -right-1 -top-1" />
        </div>
        <div className="min-w-0 flex-1 font-mono2 text-[10.5px] leading-[1.5]">
          <div className="font-disp text-[19px] leading-none tracking-wider text-[var(--txt)]">
            ALEX VOLKOV
          </div>
          <div className="mt-1 text-[var(--acc)]">full-stack web app dev</div>
          <div className="mt-1.5 text-[var(--faint)]">
            <div>loc · <span className="text-[var(--dim)]">planet Earth, UTC+3</span></div>
            <div>exp · <span className="text-[var(--dim)]">6+ yrs · 20+ launches</span></div>
            <div>
              net · <span className="text-[var(--dim)]">{ping}ms</span>
              <span className="ml-2 text-[var(--acc)]">OPEN TO WORK</span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-1 border-t border-[var(--line)] px-3 py-2.5">
        {STATS.map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-[74px] font-mono2 text-[9px] uppercase tracking-widest text-[var(--faint)]">{k}</span>
            <div className="statbar flex-1"><div style={{ width: `${v}%` }} /></div>
            <span className="w-7 text-right font-mono2 text-[9px] font-bold text-[var(--dim)]">{v}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => os.open("about", { center: true })}
        className="frow block w-full border-t border-[var(--line)] px-3 py-1.5 text-left font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--dim)]"
      >
        ▸ cat about.txt — full dossier
      </button>
    </div>
  );
}

/* ——— 2 · now playing ——— */
const TRACKS = [
  { t: "midnight_compile", a: "Lo-Fi Circuits", d: 222 },
  { t: "kernel_panic_heart", a: "The Segfaults", d: 178 },
  { t: "sudo_make_coffee", a: "Daemon Beats", d: 247 },
];
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function NowPlaying() {
  const [playing, setPlaying] = useState(true);
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(37);
  const track = TRACKS[idx];

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= track.d) {
          setIdx((i) => (i + 1) % TRACKS.length);
          return 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, track.d]);

  return (
    <div className="widget shrink-0">
      <Head label="now_playing.d" right={
        <span className={playing ? "text-[var(--acc)]" : "text-[var(--faint)]"}>
          {playing ? "▶ live" : "‖ paused"}
        </span>
      } />
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center border border-[var(--line2)] bg-[var(--panel2)]">
            <div className={`flex h-4 items-end gap-[2px] ${playing ? "" : "eq-paused"}`}>
              {[0.9, 0.55, 0.75, 0.45, 0.65].map((h, i) => (
                <span key={i} className="eq-bar" style={{ height: `${h * 16}px`, animationDelay: `${i * 0.13}s`, animationDuration: `${0.7 + i * 0.09}s` }} />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-mono2 text-[11.5px] font-bold text-[var(--txt)]">{track.t}</div>
            <div className="truncate font-mono2 text-[9.5px] text-[var(--faint)]">{track.a} — synthwave.fm</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setIdx((i) => (i + 2) % TRACKS.length); setPos(0); }} className="pbtn" title="prev">⏮</button>
            <button onClick={() => setPlaying((p) => !p)} className="pbtn text-[var(--acc)]" title="play/pause">
              {playing ? "⏸" : "▶"}
            </button>
            <button onClick={() => { setIdx((i) => (i + 1) % TRACKS.length); setPos(0); }} className="pbtn" title="next">⏭</button>
          </div>
        </div>
        <div
          className="group mt-2.5 h-[7px] cursor-pointer border border-[var(--line2)] bg-[var(--panel2)] p-[2px]"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setPos(Math.round(((e.clientX - r.left) / r.width) * track.d));
          }}
          title="seek"
        >
          <div className="pbar-fill h-full" style={{ width: `${(pos / track.d) * 100}%` }} />
        </div>
        <div className="mt-1 flex justify-between font-mono2 text-[9px] text-[var(--faint)]">
          <span>{fmt(pos)}</span>
          <span>-{fmt(track.d - pos)}</span>
        </div>
      </div>
    </div>
  );
}

/* ——— 3 · git activity heatmap ——— */
const WEEKS = 20;
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const LEVEL_COLORS = [
  "transparent",
  "color-mix(in srgb, var(--acc) 28%, transparent)",
  "color-mix(in srgb, var(--acc) 52%, transparent)",
  "color-mix(in srgb, var(--acc) 76%, transparent)",
  "var(--acc)",
];

function GitWidget() {
  const cellsRef = useRef<number[][] | null>(null);
  if (!cellsRef.current) {
    const rnd = seeded(20260215);
    const today = new Date();
    const cols: number[][] = [];
    for (let w = WEEKS - 1; w >= 0; w--) {
      const col: number[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        if (date > today) { col.push(-1); continue; }
        const weekend = d >= 5;
        const r = rnd();
        let c = 0;
        if (r > (weekend ? 0.62 : 0.28)) c = 1;
        if (r > (weekend ? 0.8 : 0.55)) c = 2;
        if (r > (weekend ? 0.92 : 0.78)) c = 3;
        if (r > 0.94) c = 4;
        col.push(c);
      }
      cols.push(col);
    }
    cellsRef.current = cols;
  }
  const cols = cellsRef.current;
  const total = cols.flat().reduce((a, b) => a + Math.max(0, b), 0);
  let streak = 0;
  outer: for (let w = cols.length - 1; w >= 0; w--) {
    for (let d = 6; d >= 0; d--) {
      const v = cols[w][d];
      if (v === -1) continue;
      if (v > 0) streak++;
      else break outer;
    }
  }
  const today = new Date();
  const label = (w: number, d: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - ((WEEKS - 1 - w) * 7 + (6 - d)));
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <div className="widget shrink-0">
      <Head label="git activity — 20 weeks" right={
        <span className="text-[var(--acc)]">▲ {streak}d streak</span>
      } />
      <div className="px-3 py-2.5">
        <div className="flex gap-[3px]">
          {cols.map((col, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {col.map((v, d) => (
                <span
                  key={d}
                  className="gitcell"
                  title={v < 0 ? "" : `${Math.max(0, v) * (v === 4 ? 4 : v === 3 ? 3 : v === 2 ? 2 : v)} commits · ${label(w, d)}`}
                  style={{
                    background: v < 0 ? "transparent" : v === 0 ? "var(--panel2)" : LEVEL_COLORS[v],
                    boxShadow: v === 4 ? "0 0 6px var(--acc-glow)" : undefined,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between font-mono2 text-[9px] text-[var(--faint)]">
          <span><span className="font-bold text-[var(--acc)]">{total}</span> contributions · last 20w</span>
          <span className="flex items-center gap-1">
            less
            {[0, 1, 2, 3, 4].map((l) => (
              <span key={l} className="gitcell" style={{ background: l === 0 ? "var(--panel2)" : LEVEL_COLORS[l] }} />
            ))}
            more
          </span>
        </div>
      </div>
    </div>
  );
}

/* ——— rail container ——— */
export default function RightRail() {
  const os = useOS();
  return (
    <div className="rail-scroll absolute bottom-14 right-3 top-3 z-[5] hidden w-[302px] flex-col gap-2.5 overflow-y-auto pr-px xl:flex">
      <ProfileWidget />
      <NowPlaying />
      <GitWidget />
      <SysmonWidget />
      <div className="shrink-0 px-1 pb-1 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">
        widgets v2.4 · drag windows anywhere · <button className="text-[var(--dim)] underline decoration-dotted hover:text-[var(--acc)]" onClick={() => { navigator.clipboard?.writeText(EMAIL); os.toast(`COPIED: ${EMAIL}`); }}>{EMAIL}</button>
      </div>
    </div>
  );
}
