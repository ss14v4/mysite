--- src/components/os/RightRail.tsx (原始)
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useOS, usePRM } from "./ctx";
import { useTip } from "./Tip";
import { useCMS, OPERATOR_AVATAR } from "../../lib/cms";
import type { WidgetId } from "../../lib/cms";
import { SysmonWidget } from "./widgets";

function Head({ label, right }: { label: string; right?: ReactElement | string }) {
  return (
    <div className="widget-head flex items-center justify-between gap-2 border-b border-[var(--line)] px-2.5 py-1.5">
      <span className="truncate">{label}</span>
      {right ?? <span className="led" />}
    </div>
  );
}

/* ——— 1 · operator profile ——— */
function ProfileWidget() {
  const os = useOS();
  const cms = useCMS();
  const tip = useTip();
  const p = cms.profile;
  const [ping, setPing] = useState(23);
  useEffect(() => {
    const t = setInterval(() => setPing(14 + Math.floor(Math.random() * 26)), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="widget shrink-0">
      <Head label="operator.json" right={<span className="text-[var(--acc)]">● rec</span>} />
      <div className="flex gap-3 p-3">
        <div
          className="avatar-frame relative h-[86px] w-[86px] shrink-0"
          {...tip.handlers({ kind: "text", title: "operator", glyph: "▓", lines: ["cam feed ● rec", "mood: caffeinated", "threat level: ships on fridays"] })}
        >
          {cms.operator.media ? (
            cms.operator.kind === "video" ? (
              <video
                src={cms.operator.media}
                className="h-full w-full object-cover"
                autoPlay loop muted playsInline
              />
            ) : (
              <img src={cms.operator.media} alt={`${p.name} — operator`} className="avatar-img h-full w-full object-cover" />
            )
          ) : (
            <img src={OPERATOR_AVATAR} alt={`${p.name} — operator`} className="avatar-img h-full w-full object-cover" />
          )}
          <span className="led absolute -right-1 -top-1" />
        </div>
        <div className="min-w-0 flex-1 font-mono2 text-[10.5px] leading-[1.5]">
          <div className="font-disp text-[19px] leading-none tracking-wider text-[var(--txt)]">{p.name}</div>
          <div className="mt-1 text-[var(--acc)]">{p.role}</div>
          <div className="mt-1.5 text-[var(--faint)]">
            <div>loc · <span className="text-[var(--dim)]">{p.location}</span></div>
            <div>exp · <span className="text-[var(--dim)]">{p.expLine}</span></div>
            <div>net · <span className="text-[var(--dim)]">{ping}ms</span> <span className="ml-2 text-[var(--acc)]">{p.statusLine}</span></div>
          </div>
        </div>
      </div>
      <div className="space-y-1 border-t border-[var(--line)] px-3 py-2.5">
        {cms.stats.map(({ k, v }) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-[74px] truncate font-mono2 text-[9px] uppercase tracking-widest text-[var(--faint)]">{k}</span>
            <div className="statbar flex-1"><div style={{ width: `${v}%` }} /></div>
            <span className="w-7 text-right font-mono2 text-[9px] font-bold text-[var(--dim)]">{v}</span>
          </div>
        ))}
        {cms.stats.length === 0 && <div className="text-[9px] text-[var(--faint)]">no skills mounted — cms.sys ▸ widgets</div>}
      </div>
      <button
        onClick={() => os.open("about", { center: true })}
        className="frow block w-full border-t border-[var(--line)] px-3 py-1.5 text-left font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--dim)]"
        {...tip.handlers({ kind: "text", title: "about.txt", glyph: "▤", lines: ["full dossier window", "skills · execution log", "uplinks & contacts"] })}
      >
        ▸ cat about.txt — full dossier
      </button>
    </div>
  );
}

/* ——— 2 · now playing — REAL audio when a file is mounted ——— */
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function NowPlaying() {
  const cms = useCMS();
  const tip = useTip();
  const tracks = cms.tracks;
  const [playing, setPlaying] = useState(true);
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [metaDur, setMetaDur] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const safeIdx = tracks.length ? idx % tracks.length : 0;
  const track = tracks[safeIdx];
  const hasSrc = !!track?.src;

  useEffect(() => { setIdx(0); setPos(0); }, [cms.tracks]);

  const next = useCallback(() => {
    if (!tracks.length) return;
    setIdx((i) => (i + 1) % tracks.length);
    setPos(0);
  }, [tracks.length]);

  // drive the <audio> element
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (hasSrc && playing) a.play().catch(() => { /* autoplay policy — user gesture will follow */ });
    else a.pause();
  }, [playing, hasSrc, safeIdx, track?.src]);

  // simulated progress for file-less tracks
  useEffect(() => {
    if (!playing || !track || hasSrc) return;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= track.d) { next(); return 0; }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, track, hasSrc, next]);

  if (!track) {
    return (
      <div className="widget shrink-0">
        <Head label="now_playing.d" right={<span className="text-[var(--faint)]">∅</span>} />
        <div className="px-3 py-4 text-center font-mono2 text-[9px] uppercase tracking-[0.2em] text-[var(--faint)]">
          queue empty — cms.sys ▸ playlist
        </div>
      </div>
    );
  }

  const dur = hasSrc ? (metaDur || track.d) : track.d;

  const seek = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const v = Math.round(((clientX - r.left) / r.width) * dur);
    if (hasSrc && audioRef.current) audioRef.current.currentTime = v;
    setPos(v);
  };

  return (
    <div className="widget shrink-0">
      <Head label="now_playing.d" right={
        <span className={playing ? "text-[var(--acc)]" : "text-[var(--faint)]"}>
          {playing ? (hasSrc ? "▶ live audio" : "▶ live") : "‖ paused"}
        </span>
      } />
      <audio
        ref={audioRef}
        src={hasSrc ? track.src : undefined}
        onTimeUpdate={(e) => { if (hasSrc) setPos(e.currentTarget.currentTime); }}
        onLoadedMetadata={(e) => setMetaDur(e.currentTarget.duration || track.d)}
        onEnded={next}
        className="hidden"
      />
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center border border-[var(--line2)] bg-[var(--panel2)]"
            {...tip.handlers({ kind: "text", title: hasSrc ? "real audio mounted" : "simulated signal", glyph: "♪", lines: [hasSrc ? (track.fileName ?? "audio file") : "mount an mp3 in cms.sys ▸ playlist", "to hear actual sound"] })}
          >
            <div className={`flex h-4 items-end gap-[2px] ${playing ? "" : "eq-paused"}`}>
              {[0.9, 0.55, 0.75, 0.45, 0.65].map((h, i) => (
                <span key={i} className="eq-bar" style={{ height: `${h * 16}px`, animationDelay: `${i * 0.13}s`, animationDuration: `${0.7 + i * 0.09}s` }} />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-mono2 text-[11.5px] font-bold text-[var(--txt)]">{track.t}</div>
            <div className="truncate font-mono2 text-[9.5px] text-[var(--faint)]">{track.a} — {hasSrc ? "local file" : "synthwave.fm"}</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setIdx((i) => (i + tracks.length - 1) % tracks.length); setPos(0); }} className="pbtn" title="prev">⏮</button>
            <button onClick={() => setPlaying((p) => !p)} className="pbtn text-[var(--acc)]" title="play/pause">{playing ? "⏸" : "▶"}</button>
            <button onClick={next} className="pbtn" title="next">⏭</button>
          </div>
        </div>
        <div
          className="group mt-2.5 h-[7px] cursor-pointer border border-[var(--line2)] bg-[var(--panel2)] p-[2px]"
          onClick={(e) => seek(e.clientX, e.currentTarget)}
        >
          <div className="pbar-fill h-full" style={{ width: `${dur ? Math.min(100, (pos / dur) * 100) : 0}%` }} />
        </div>
        <div className="mt-1 flex justify-between font-mono2 text-[9px] text-[var(--faint)]">
          <span>{fmt(pos)}</span>
          <span>-{fmt(Math.max(0, dur - pos))}</span>
        </div>
      </div>
    </div>
  );
}

/* ——— 3 · git activity heatmap ——— */
const WEEKS = 20;
function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
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
      <Head label="git activity — 20 weeks" right={<span className="text-[var(--acc)]">▲ {streak}d streak</span>} />
      <div className="px-3 py-2.5">
        <div className="flex gap-[3px]">
          {cols.map((col, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {col.map((v, d) => (
                <span key={d} className="gitcell"
                  title={v < 0 ? "" : `${Math.max(0, v) * (v === 4 ? 4 : v === 3 ? 3 : v === 2 ? 2 : v)} commits · ${label(w, d)}`}
                  style={{
                    background: v < 0 ? "transparent" : v === 0 ? "var(--panel2)" : LEVEL_COLORS[v],
                    boxShadow: v === 4 ? "0 0 6px var(--acc-glow)" : undefined,
                  }} />
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

/* ——— 4 · video.d — media player widget ——— */
function VideoWidget() {
  const os = useOS();
  const cms = useCMS();
  return (
    <div className="widget shrink-0">
      <Head label="video.d" right={cms.videoName ? <span className="max-w-32 truncate text-[var(--acc)]">{cms.videoName}</span> : <span className="led" />} />
      {cms.videoSrc ? (
        <video key={cms.videoSrc} src={cms.videoSrc} controls preload="metadata" className="w-full border-b border-[var(--line)] bg-black" />
      ) : (
        <button
          onClick={() => os.open("cms", { center: true })}
          className="grid h-28 w-full place-items-center border-b border-[var(--line)] font-mono2 text-[9px] uppercase tracking-[0.2em] text-[var(--faint)] transition-colors hover:text-[var(--acc)]"
        >
          <span className="text-center leading-relaxed">
            ░░ no signal ░░<br />
            mount media via cms.sys ▸ widgets
          </span>
        </button>
      )}
    </div>
  );
}

/* ——— 5 · chat.sys — visitor → owner inbox ——— */
function ChatWidget() {
  const os = useOS();
  const cms = useCMS();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [errKey, setErrKey] = useState(0);

  const send = () => {
    if (!/\S+@\S+\.\S+/.test(email) || !msg.trim()) {
      setErrKey((k) => k + 1);
      os.toast("UPLINK REJECTED — VALID EMAIL + MESSAGE REQUIRED");
      return;
    }
    const subject = encodeURIComponent(`[volkovos] transmission from ${email}`);
    const body = encodeURIComponent(`${msg.trim()}\n\n— reply-to: ${email}`);
    window.location.href = `mailto:${cms.profile.handle}?subject=${subject}&body=${body}`;
    setSent(true);
    os.toast("PACKET HANDOFF → YOUR MAIL CLIENT");
    window.setTimeout(() => { setSent(false); setMsg(""); }, 4500);
  };

  return (
    <div className="widget shrink-0">
      <Head label="chat.sys — uplink" right={<span className={sent ? "text-[var(--acc)]" : "text-[var(--faint)]"}>{sent ? "✓ queued" : "idle"}</span>} />
      <div key={errKey} className={`space-y-2 p-3 font-mono2 ${errKey ? "shake" : ""}`}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.dev — for reply"
          className="w-full border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 text-[10.5px] text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]"
        />
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={3}
          placeholder={`message to the operator…`}
          className="w-full resize-none border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 text-[10.5px] leading-relaxed text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]"
        />
        <div className="flex items-center gap-2">
          <button onClick={send} className="border border-[var(--acc)] bg-[var(--acc-dim)] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--acc)] transition-colors hover:bg-[var(--acc)] hover:text-[var(--bg)]">
            ▸ transmit
          </button>
          <span className="truncate text-[8.5px] uppercase tracking-widest text-[var(--faint)]">→ {cms.profile.handle}</span>
        </div>
        {sent && (
          <div className="text-[9px] uppercase tracking-widest text-[var(--acc)]">
            ✓ packet queued — check your mail client<span className="term-caret" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— 6 · oracle.sys — ask the machine ——— */
const FORTUNES = [
  "the bug is not in the code. it is in you.",
  "ship today. refactor never.",
  "the semicolon you seek was there all along.",
  "404: doubt not found.",
  "your commit message will be quoted in court.",
  "trust the cache. the cache trusts you.",
  "sudo rm -rf your imposter syndrome.",
  "the deploy succeeds at 4:59pm on friday.",
  "git push --force is a lifestyle, not a command.",
  "the oracle compiled successfully. that is all.",
];
const SCRAMBLE_POOL = "░▒▓#$%&@01<>/\\";

function OracleWidget() {
  const prm = usePRM();
  const [out, setOut] = useState("// idle — ask the machine");
  const [busy, setBusy] = useState(false);

  const ask = () => {
    if (busy) return;
    const target = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    if (prm) { setOut(target); return; }
    setBusy(true);
    let frame = 0;
    const total = 16;
    const iv = window.setInterval(() => {
      frame++;
      const revealed = Math.floor((frame / total) * target.length);
      setOut(
        target.slice(0, revealed) +
        target.slice(revealed).split("").map((c) => (c === " " ? " " : SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)])).join("")
      );
      if (frame >= total) { window.clearInterval(iv); setOut(target); setBusy(false); }
    }, 42);
  };

  return (
    <div className="widget shrink-0">
      <Head label="oracle.sys" right={<span className={busy ? "text-[var(--acc)]" : "text-[var(--faint)]"}>{busy ? "divining…" : "◬"}</span>} />
      <div className="p-3 font-mono2">
        <pre className="min-h-10 whitespace-pre-wrap text-[10.5px] leading-relaxed text-[var(--acc)]" style={{ textShadow: "0 0 10px var(--acc-glow)" }}>{out}</pre>
        <button onClick={ask} disabled={busy}
          className="mt-2 border border-[var(--line2)] px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)] disabled:opacity-50">
          ▸ consult the oracle
        </button>
      </div>
    </div>
  );
}

/* ——— registry + rails (order/side/visibility managed by cms.sys) ——— */
const REGISTRY: Record<WidgetId, () => ReactElement> = {
  operator: ProfileWidget,
  player: NowPlaying,
  git: GitWidget,
  sysmon: SysmonWidget,
  video: VideoWidget,
  chat: ChatWidget,
  oracle: OracleWidget,
};

function Rail({ side, items, footer }: { side: "left" | "right"; items: Array<() => ReactElement>; footer?: boolean }) {
  const cms = useCMS();
  const os = useOS();
  if (!items.length) return null;
  return (
    <div
      className="rail-scroll absolute bottom-14 top-3 z-[5] hidden w-[302px] flex-col gap-2.5 overflow-y-auto pr-px xl:flex"
      style={side === "right" ? { right: 12 } : { left: 12 }}
    >
      {items.map((C, i) => <C key={i} />)}
      {footer && (
        <div className="shrink-0 px-1 pb-1 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">
          widgets v3.0 · layout via cms.sys ·{" "}
          <button className="text-[var(--dim)] underline decoration-dotted hover:text-[var(--acc)]"
            onClick={() => { navigator.clipboard?.writeText(cms.profile.handle); os.toast(`COPIED: ${cms.profile.handle}`); }}>
            {cms.profile.handle}
          </button>
        </div>
      )}
    </div>
  );
}

function TopRail({ items, hasLeft, hasRight }: { items: Array<() => ReactElement>; hasLeft: boolean; hasRight: boolean }) {
  if (!items.length) return null;
  return (
    <div
      className="rail-scroll pointer-events-auto absolute top-3 z-[5] hidden items-start gap-2.5 overflow-x-auto pb-1 xl:flex"
      style={{ left: hasLeft ? 322 : 12, right: hasRight ? 322 : 12 }}
    >
      {items.map((C, i) => <C key={i} />)}
    </div>
  );
}

export function DesktopWidgets() {
  const cms = useCMS();
  const by = (dock: "left" | "right" | "top") =>
    cms.widgetCfg.filter((w) => w.enabled && w.dock === dock).map((w) => REGISTRY[w.id]).filter(Boolean);
  const left = by("left");
  const right = by("right");
  const top = by("top");
  return (
    <>
      <TopRail items={top} hasLeft={left.length > 0} hasRight={right.length > 0} />
      <Rail side="left" items={left} />
      <Rail side="right" items={right} footer />
    </>
  );
}


+++ src/components/os/RightRail.tsx (修改后)
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useOS, usePRM } from "./ctx";
import { useTip } from "./Tip";
import { useCMS, OPERATOR_AVATAR } from "../../lib/cms";
import type { WidgetId } from "../../lib/cms";
import { GAMES, top, best } from "../../lib/arcade";
import { SysmonWidget } from "./widgets";

function Head({ label, right }: { label: string; right?: ReactElement | string }) {
  return (
    <div className="widget-head flex items-center justify-between gap-2 border-b border-[var(--line)] px-2.5 py-1.5">
      <span className="truncate">{label}</span>
      {right ?? <span className="led" />}
    </div>
  );
}

/* ——— 1 · operator profile ——— */
function ProfileWidget() {
  const os = useOS();
  const cms = useCMS();
  const tip = useTip();
  const p = cms.profile;
  const [ping, setPing] = useState(23);
  useEffect(() => {
    const t = setInterval(() => setPing(14 + Math.floor(Math.random() * 26)), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="widget shrink-0">
      <Head label="operator.json" right={<span className="text-[var(--acc)]">● rec</span>} />
      <div className="flex gap-3 p-3">
        <div
          className="avatar-frame relative h-[86px] w-[86px] shrink-0"
          {...tip.handlers({ kind: "text", title: "operator", glyph: "▓", lines: ["cam feed ● rec", "mood: caffeinated", "threat level: ships on fridays"] })}
        >
          {cms.operator.media ? (
            cms.operator.kind === "video" ? (
              <video
                src={cms.operator.media}
                className="h-full w-full object-cover"
                autoPlay loop muted playsInline
              />
            ) : (
              <img src={cms.operator.media} alt={`${p.name} — operator`} className="avatar-img h-full w-full object-cover" />
            )
          ) : (
            <img src={OPERATOR_AVATAR} alt={`${p.name} — operator`} className="avatar-img h-full w-full object-cover" />
          )}
          <span className="led absolute -right-1 -top-1" />
        </div>
        <div className="min-w-0 flex-1 font-mono2 text-[10.5px] leading-[1.5]">
          <div className="font-disp text-[19px] leading-none tracking-wider text-[var(--txt)]">{p.name}</div>
          <div className="mt-1 text-[var(--acc)]">{p.role}</div>
          <div className="mt-1.5 text-[var(--faint)]">
            <div>loc · <span className="text-[var(--dim)]">{p.location}</span></div>
            <div>exp · <span className="text-[var(--dim)]">{p.expLine}</span></div>
            <div>net · <span className="text-[var(--dim)]">{ping}ms</span> <span className="ml-2 text-[var(--acc)]">{p.statusLine}</span></div>
          </div>
        </div>
      </div>
      <div className="space-y-1 border-t border-[var(--line)] px-3 py-2.5">
        {cms.stats.map(({ k, v }) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-[74px] truncate font-mono2 text-[9px] uppercase tracking-widest text-[var(--faint)]">{k}</span>
            <div className="statbar flex-1"><div style={{ width: `${v}%` }} /></div>
            <span className="w-7 text-right font-mono2 text-[9px] font-bold text-[var(--dim)]">{v}</span>
          </div>
        ))}
        {cms.stats.length === 0 && <div className="text-[9px] text-[var(--faint)]">no skills mounted — cms.sys ▸ widgets</div>}
      </div>
      <button
        onClick={() => os.open("about", { center: true })}
        className="frow block w-full border-t border-[var(--line)] px-3 py-1.5 text-left font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--dim)]"
        {...tip.handlers({ kind: "text", title: "about.txt", glyph: "▤", lines: ["full dossier window", "skills · execution log", "uplinks & contacts"] })}
      >
        ▸ cat about.txt — full dossier
      </button>
    </div>
  );
}

/* ——— 2 · now playing — REAL audio when a file is mounted ——— */
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function NowPlaying() {
  const cms = useCMS();
  const tip = useTip();
  const tracks = cms.tracks;
  const [playing, setPlaying] = useState(true);
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [metaDur, setMetaDur] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const safeIdx = tracks.length ? idx % tracks.length : 0;
  const track = tracks[safeIdx];
  const hasSrc = !!track?.src;

  useEffect(() => { setIdx(0); setPos(0); }, [cms.tracks]);

  const next = useCallback(() => {
    if (!tracks.length) return;
    setIdx((i) => (i + 1) % tracks.length);
    setPos(0);
  }, [tracks.length]);

  // drive the <audio> element
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (hasSrc && playing) a.play().catch(() => { /* autoplay policy — user gesture will follow */ });
    else a.pause();
  }, [playing, hasSrc, safeIdx, track?.src]);

  // simulated progress for file-less tracks
  useEffect(() => {
    if (!playing || !track || hasSrc) return;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= track.d) { next(); return 0; }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, track, hasSrc, next]);

  if (!track) {
    return (
      <div className="widget shrink-0">
        <Head label="now_playing.d" right={<span className="text-[var(--faint)]">∅</span>} />
        <div className="px-3 py-4 text-center font-mono2 text-[9px] uppercase tracking-[0.2em] text-[var(--faint)]">
          queue empty — cms.sys ▸ playlist
        </div>
      </div>
    );
  }

  const dur = hasSrc ? (metaDur || track.d) : track.d;

  const seek = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const v = Math.round(((clientX - r.left) / r.width) * dur);
    if (hasSrc && audioRef.current) audioRef.current.currentTime = v;
    setPos(v);
  };

  return (
    <div className="widget shrink-0">
      <Head label="now_playing.d" right={
        <span className={playing ? "text-[var(--acc)]" : "text-[var(--faint)]"}>
          {playing ? (hasSrc ? "▶ live audio" : "▶ live") : "‖ paused"}
        </span>
      } />
      <audio
        ref={audioRef}
        src={hasSrc ? track.src : undefined}
        onTimeUpdate={(e) => { if (hasSrc) setPos(e.currentTarget.currentTime); }}
        onLoadedMetadata={(e) => setMetaDur(e.currentTarget.duration || track.d)}
        onEnded={next}
        className="hidden"
      />
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center border border-[var(--line2)] bg-[var(--panel2)]"
            {...tip.handlers({ kind: "text", title: hasSrc ? "real audio mounted" : "simulated signal", glyph: "♪", lines: [hasSrc ? (track.fileName ?? "audio file") : "mount an mp3 in cms.sys ▸ playlist", "to hear actual sound"] })}
          >
            <div className={`flex h-4 items-end gap-[2px] ${playing ? "" : "eq-paused"}`}>
              {[0.9, 0.55, 0.75, 0.45, 0.65].map((h, i) => (
                <span key={i} className="eq-bar" style={{ height: `${h * 16}px`, animationDelay: `${i * 0.13}s`, animationDuration: `${0.7 + i * 0.09}s` }} />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-mono2 text-[11.5px] font-bold text-[var(--txt)]">{track.t}</div>
            <div className="truncate font-mono2 text-[9.5px] text-[var(--faint)]">{track.a} — {hasSrc ? "local file" : "synthwave.fm"}</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setIdx((i) => (i + tracks.length - 1) % tracks.length); setPos(0); }} className="pbtn" title="prev">⏮</button>
            <button onClick={() => setPlaying((p) => !p)} className="pbtn text-[var(--acc)]" title="play/pause">{playing ? "⏸" : "▶"}</button>
            <button onClick={next} className="pbtn" title="next">⏭</button>
          </div>
        </div>
        <div
          className="group mt-2.5 h-[7px] cursor-pointer border border-[var(--line2)] bg-[var(--panel2)] p-[2px]"
          onClick={(e) => seek(e.clientX, e.currentTarget)}
        >
          <div className="pbar-fill h-full" style={{ width: `${dur ? Math.min(100, (pos / dur) * 100) : 0}%` }} />
        </div>
        <div className="mt-1 flex justify-between font-mono2 text-[9px] text-[var(--faint)]">
          <span>{fmt(pos)}</span>
          <span>-{fmt(Math.max(0, dur - pos))}</span>
        </div>
      </div>
    </div>
  );
}

/* ——— 3 · git activity heatmap ——— */
const WEEKS = 20;
function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
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
      <Head label="git activity — 20 weeks" right={<span className="text-[var(--acc)]">▲ {streak}d streak</span>} />
      <div className="px-3 py-2.5">
        <div className="flex gap-[3px]">
          {cols.map((col, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {col.map((v, d) => (
                <span key={d} className="gitcell"
                  title={v < 0 ? "" : `${Math.max(0, v) * (v === 4 ? 4 : v === 3 ? 3 : v === 2 ? 2 : v)} commits · ${label(w, d)}`}
                  style={{
                    background: v < 0 ? "transparent" : v === 0 ? "var(--panel2)" : LEVEL_COLORS[v],
                    boxShadow: v === 4 ? "0 0 6px var(--acc-glow)" : undefined,
                  }} />
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

/* ——— 4 · video.d — media player widget ——— */
function VideoWidget() {
  const os = useOS();
  const cms = useCMS();
  return (
    <div className="widget shrink-0">
      <Head label="video.d" right={cms.videoName ? <span className="max-w-32 truncate text-[var(--acc)]">{cms.videoName}</span> : <span className="led" />} />
      {cms.videoSrc ? (
        <video key={cms.videoSrc} src={cms.videoSrc} controls preload="metadata" className="w-full border-b border-[var(--line)] bg-black" />
      ) : (
        <button
          onClick={() => os.open("cms", { center: true })}
          className="grid h-28 w-full place-items-center border-b border-[var(--line)] font-mono2 text-[9px] uppercase tracking-[0.2em] text-[var(--faint)] transition-colors hover:text-[var(--acc)]"
        >
          <span className="text-center leading-relaxed">
            ░░ no signal ░░<br />
            mount media via cms.sys ▸ widgets
          </span>
        </button>
      )}
    </div>
  );
}

/* ——— 5 · chat.sys — visitor → owner inbox ——— */
function ChatWidget() {
  const os = useOS();
  const cms = useCMS();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [errKey, setErrKey] = useState(0);

  const send = () => {
    if (!/\S+@\S+\.\S+/.test(email) || !msg.trim()) {
      setErrKey((k) => k + 1);
      os.toast("UPLINK REJECTED — VALID EMAIL + MESSAGE REQUIRED");
      return;
    }
    const subject = encodeURIComponent(`[volkovos] transmission from ${email}`);
    const body = encodeURIComponent(`${msg.trim()}\n\n— reply-to: ${email}`);
    window.location.href = `mailto:${cms.profile.handle}?subject=${subject}&body=${body}`;
    setSent(true);
    os.toast("PACKET HANDOFF → YOUR MAIL CLIENT");
    window.setTimeout(() => { setSent(false); setMsg(""); }, 4500);
  };

  return (
    <div className="widget shrink-0">
      <Head label="chat.sys — uplink" right={<span className={sent ? "text-[var(--acc)]" : "text-[var(--faint)]"}>{sent ? "✓ queued" : "idle"}</span>} />
      <div key={errKey} className={`space-y-2 p-3 font-mono2 ${errKey ? "shake" : ""}`}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.dev — for reply"
          className="w-full border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 text-[10.5px] text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]"
        />
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={3}
          placeholder={`message to the operator…`}
          className="w-full resize-none border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 text-[10.5px] leading-relaxed text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]"
        />
        <div className="flex items-center gap-2">
          <button onClick={send} className="border border-[var(--acc)] bg-[var(--acc-dim)] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--acc)] transition-colors hover:bg-[var(--acc)] hover:text-[var(--bg)]">
            ▸ transmit
          </button>
          <span className="truncate text-[8.5px] uppercase tracking-widest text-[var(--faint)]">→ {cms.profile.handle}</span>
        </div>
        {sent && (
          <div className="text-[9px] uppercase tracking-widest text-[var(--acc)]">
            ✓ packet queued — check your mail client<span className="term-caret" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— 6 · oracle.sys — ask the machine ——— */
const FORTUNES = [
  "the bug is not in the code. it is in you.",
  "ship today. refactor never.",
  "the semicolon you seek was there all along.",
  "404: doubt not found.",
  "your commit message will be quoted in court.",
  "trust the cache. the cache trusts you.",
  "sudo rm -rf your imposter syndrome.",
  "the deploy succeeds at 4:59pm on friday.",
  "git push --force is a lifestyle, not a command.",
  "the oracle compiled successfully. that is all.",
];
const SCRAMBLE_POOL = "░▒▓#$%&@01<>/\\";

function OracleWidget() {
  const prm = usePRM();
  const [out, setOut] = useState("// idle — ask the machine");
  const [busy, setBusy] = useState(false);

  const ask = () => {
    if (busy) return;
    const target = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    if (prm) { setOut(target); return; }
    setBusy(true);
    let frame = 0;
    const total = 16;
    const iv = window.setInterval(() => {
      frame++;
      const revealed = Math.floor((frame / total) * target.length);
      setOut(
        target.slice(0, revealed) +
        target.slice(revealed).split("").map((c) => (c === " " ? " " : SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)])).join("")
      );
      if (frame >= total) { window.clearInterval(iv); setOut(target); setBusy(false); }
    }, 42);
  };

  return (
    <div className="widget shrink-0">
      <Head label="oracle.sys" right={<span className={busy ? "text-[var(--acc)]" : "text-[var(--faint)]"}>{busy ? "divining…" : "◬"}</span>} />
      <div className="p-3 font-mono2">
        <pre className="min-h-10 whitespace-pre-wrap text-[10.5px] leading-relaxed text-[var(--acc)]" style={{ textShadow: "0 0 10px var(--acc-glow)" }}>{out}</pre>
        <button onClick={ask} disabled={busy}
          className="mt-2 border border-[var(--line2)] px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)] disabled:opacity-50">
          ▸ consult the oracle
        </button>
      </div>
    </div>
  );
}

/* ——— 8 · trophies — achievements ledger ——— */
function AchieveWidget() {
  const cms = useCMS();
  const os = useOS();
  const rows = cms.achievements;
  return (
    <div className="widget shrink-0">
      <Head label="trophies.sys" right={<span className="text-[var(--amber)]">★ {rows.length}</span>} />
      <div className="max-h-56 space-y-2 overflow-y-auto p-3 rail-scroll">
        {rows.map((a) => (
          <div key={a.id} className="group flex gap-2.5 border-l border-[var(--line2)] pl-2.5 transition-colors hover:border-[var(--amber)]">
            <span className="font-disp text-[15px] leading-tight text-[var(--amber)]" style={{ textShadow: "0 0 10px color-mix(in srgb, var(--amber) 55%, transparent)" }}>★</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-mono2 text-[10.5px] font-bold text-[var(--txt)] group-hover:text-[var(--acc)]">{a.title}</span>
                <span className="font-mono2 text-[9px] font-bold text-[var(--acc)]">{a.year}</span>
              </div>
              <div className="font-mono2 text-[8.5px] uppercase tracking-[0.2em] text-[var(--cyan)]">{a.field}</div>
              <div className="mt-0.5 truncate font-mono2 text-[9px] text-[var(--faint)]" title={a.detail}>{a.detail}</div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="font-mono2 text-[9.5px] text-[var(--faint)]">no trophies yet — go earn some.</div>}
      </div>
      <button onClick={() => os.open("cms", { center: true })}
        className="frow block w-full border-t border-[var(--line)] px-3 py-1.5 text-left font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--dim)]">
        ▸ manage trophies — cms.sys
      </button>
    </div>
  );
}

/* ——— 9 · order intake — brief builder per category ——— */
function OrderWidget() {
  const cms = useCMS();
  const os = useOS();
  const [tplId, setTplId] = useState(cms.briefs[0]?.id ?? "");
  const tpl = cms.briefs.find((t) => t.id === tplId) ?? cms.briefs[0];
  const [vals, setVals] = useState<Record<string, string | boolean>>({});
  const [cname, setCname] = useState("");
  const [cmail, setCmail] = useState("");

  if (!tpl) {
    return (
      <div className="widget shrink-0">
        <Head label="order.sys" right={<span className="text-[var(--red)]">○</span>} />
        <div className="p-3 font-mono2 text-[9.5px] text-[var(--faint)]">brief intake offline — no templates in cms.sys ▸ briefs.</div>
      </div>
    );
  }

  const pick = (id: string) => { setTplId(id); setVals({}); };
  const submit = () => {
    if (!cmail.includes("@")) { os.toast("ORDER REJECTED — NEED A REPLY EMAIL"); return; }
    const lines = tpl.fields.map((f) => {
      const v = vals[f.id];
      return `▪ ${f.label}: ${f.type === "toggle" ? (v ? "yes" : "no") : (typeof v === "string" && v ? v : "—")}`;
    });
    const subject = encodeURIComponent(`[order] ${tpl.category} brief — from ${cname || cmail}`);
    const body = encodeURIComponent(
      `NEW ${tpl.category.toUpperCase()} BRIEF\n${"═".repeat(34)}\n${lines.join("\n")}\n${"═".repeat(34)}\ncontact: ${cname || "—"} <${cmail}>\nsent from order.sys @ volkovos`
    );
    window.location.href = `mailto:${cms.profile.handle}?subject=${subject}&body=${body}`;
    os.toast("BRIEF COMPILED → MAIL CLIENT");
    setVals({}); setCname(""); setCmail("");
  };

  return (
    <div className="widget shrink-0">
      <Head label="order.sys" right={<span className="led" />} />
      <div className="p-3">
        <div className="font-disp text-[17px] leading-tight tracking-wide text-[var(--txt)]">
          GOT AN IDEA? <span className="text-[var(--acc)]" style={{ textShadow: "0 0 12px var(--acc-glow)" }}>LET'S SHIP IT.</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {cms.briefs.map((t) => (
            <button key={t.id} onClick={() => pick(t.id)}
              className={`border px-2 py-1 font-mono2 text-[8.5px] uppercase tracking-[0.16em] transition-colors ${t.id === tpl.id ? "border-[var(--acc)] bg-[var(--acc-dim)] font-bold text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)] hover:text-[var(--txt)]"}`}>
              {t.category}
            </button>
          ))}
        </div>
        <div className="mt-2.5 space-y-2">
          {tpl.fields.map((f) => (
            <div key={f.id}>
              <div className="mb-1 font-mono2 text-[8.5px] uppercase tracking-[0.2em] text-[var(--faint)]">{f.label}</div>
              {f.type === "line" && (
                <input value={(vals[f.id] as string) ?? ""} onChange={(e) => setVals({ ...vals, [f.id]: e.target.value })} placeholder={f.placeholder}
                  className="w-full border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 font-mono2 text-[10.5px] text-[var(--txt)] outline-none focus:border-[var(--acc)]" />
              )}
              {f.type === "text" && (
                <textarea value={(vals[f.id] as string) ?? ""} onChange={(e) => setVals({ ...vals, [f.id]: e.target.value })} rows={2} placeholder={f.placeholder}
                  className="w-full resize-none border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 font-mono2 text-[10.5px] leading-relaxed text-[var(--txt)] outline-none focus:border-[var(--acc)]" />
              )}
              {f.type === "select" && (
                <div className="flex flex-wrap gap-1">
                  {(f.options ?? []).map((o) => (
                    <button key={o} onClick={() => setVals({ ...vals, [f.id]: o })}
                      className={`border px-1.5 py-0.5 font-mono2 text-[9px] transition-colors ${vals[f.id] === o ? "border-[var(--acc)] bg-[var(--acc-dim)] text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)]"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              )}
              {f.type === "toggle" && (
                <button onClick={() => setVals({ ...vals, [f.id]: !vals[f.id] })}
                  className={`relative h-4 w-9 border transition-colors ${vals[f.id] ? "border-[var(--acc)]" : "border-[var(--line2)]"}`}>
                  <span className={`absolute top-1/2 h-2.5 w-3.5 -translate-y-1/2 transition-all ${vals[f.id] ? "left-[calc(100%-18px)] bg-[var(--acc)]" : "left-[2px] bg-[var(--faint)]"}`} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <input value={cname} onChange={(e) => setCname(e.target.value)} placeholder="your name"
            className="min-w-0 border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 font-mono2 text-[10.5px] text-[var(--txt)] outline-none focus:border-[var(--acc)]" />
          <input value={cmail} onChange={(e) => setCmail(e.target.value)} placeholder="email *" type="email"
            className="min-w-0 border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 font-mono2 text-[10.5px] text-[var(--txt)] outline-none focus:border-[var(--acc)]" />
        </div>
        <button onClick={submit}
          className="frow mt-2 w-full border border-[var(--acc)] bg-[var(--acc-dim)] px-3 py-1.5 font-mono2 text-[9.5px] font-bold uppercase tracking-[0.24em] text-[var(--acc)]">
          ▸ transmit brief
        </button>
      </div>
    </div>
  );
}

/* ——— 10 · arcade — five games + local top ——— */
function ArcadeWidget() {
  const os = useOS();
  const total = GAMES.reduce((s, g) => s + top(g.id).length, 0);
  return (
    <div className="widget shrink-0">
      <Head label="arcade.sys" right={<span className="text-[var(--acc)]">▶ 5 games</span>} />
      <div className="grid grid-cols-1 gap-1.5 p-3">
        {GAMES.map((g) => {
          const pb = best(g.id);
          return (
            <button key={g.id} onClick={() => os.openGame(g.id)}
              className="frow group flex items-center gap-2.5 border border-[var(--line2)] px-2.5 py-2 text-left transition-all hover:border-[var(--acc)] hover:bg-[var(--acc-dim)] hover:pl-3.5">
              <span className="font-disp text-[19px] leading-none text-[var(--dim)] transition-colors group-hover:text-[var(--acc)]" style={{ textShadow: "0 0 10px var(--acc-glow)" }}>{g.glyph}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono2 text-[10.5px] font-bold text-[var(--txt)] group-hover:text-[var(--acc)]">{g.name}</span>
                <span className="block truncate font-mono2 text-[8px] uppercase tracking-[0.14em] text-[var(--faint)]">{g.desc}</span>
              </span>
              <span className="shrink-0 text-right font-mono2 text-[9px]">
                {pb > 0
                  ? <><span className="block font-bold text-[var(--amber)]">{pb}</span><span className="text-[7.5px] uppercase tracking-widest text-[var(--faint)]">your pb</span></>
                  : <span className="text-[var(--faint)]">—</span>}
              </span>
            </button>
          );
        })}
      </div>
      <button onClick={() => os.openScores()}
        className="frow block w-full border-t border-[var(--line)] px-3 py-1.5 text-left font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--dim)]">
        ♛ leaderboard · {total} records logged
      </button>
    </div>
  );
}

/* ——— registry + rails (order/side/visibility managed by cms.sys) ——— */
const REGISTRY: Record<WidgetId, () => ReactElement> = {
  operator: ProfileWidget,
  player: NowPlaying,
  git: GitWidget,
  sysmon: SysmonWidget,
  video: VideoWidget,
  chat: ChatWidget,
  oracle: OracleWidget,
  achieve: AchieveWidget,
  order: OrderWidget,
  arcade: ArcadeWidget,
};

function Rail({ side, items, footer }: { side: "left" | "right"; items: Array<() => ReactElement>; footer?: boolean }) {
  const cms = useCMS();
  const os = useOS();
  if (!items.length) return null;
  return (
    <div
      className="rail-scroll absolute bottom-14 top-3 z-[5] hidden w-[302px] flex-col gap-2.5 overflow-y-auto pr-px xl:flex"
      style={side === "right" ? { right: 12 } : { left: 12 }}
    >
      {items.map((C, i) => <C key={i} />)}
      {footer && (
        <div className="shrink-0 px-1 pb-1 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">
          widgets v3.0 · layout via cms.sys ·{" "}
          <button className="text-[var(--dim)] underline decoration-dotted hover:text-[var(--acc)]"
            onClick={() => { navigator.clipboard?.writeText(cms.profile.handle); os.toast(`COPIED: ${cms.profile.handle}`); }}>
            {cms.profile.handle}
          </button>
        </div>
      )}
    </div>
  );
}

function TopRail({ items, hasLeft, hasRight }: { items: Array<() => ReactElement>; hasLeft: boolean; hasRight: boolean }) {
  if (!items.length) return null;
  return (
    <div
      className="rail-scroll pointer-events-auto absolute top-3 z-[5] hidden items-start gap-2.5 overflow-x-auto pb-1 xl:flex"
      style={{ left: hasLeft ? 322 : 12, right: hasRight ? 322 : 12 }}
    >
      {items.map((C, i) => <C key={i} />)}
    </div>
  );
}

export function DesktopWidgets() {
  const cms = useCMS();
  const by = (dock: "left" | "right" | "top") =>
    cms.widgetCfg.filter((w) => w.enabled && w.dock === dock).map((w) => REGISTRY[w.id]).filter(Boolean);
  const left = by("left");
  const right = by("right");
  const top = by("top");
  return (
    <>
      <TopRail items={top} hasLeft={left.length > 0} hasRight={right.length > 0} />
      <Rail side="left" items={left} />
      <Rail side="right" items={right} footer />
    </>
  );
}
