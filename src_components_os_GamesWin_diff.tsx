--- src/components/os/GamesWin.tsx (原始)


+++ src/components/os/GamesWin.tsx (修改后)
import { useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { useOS } from "./ctx";
import {
  GAMES, gameMeta, submitScore, best, top, playerName, setPlayerName, col,
} from "../../lib/arcade";
import type { GameId } from "../../lib/arcade";

/* ————— shared bits ————— */
function useKey(handler: (e: KeyboardEvent) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const h = (e: KeyboardEvent) => ref.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
}

interface Meta { name: string; glyph: string; desc: string; keys: string; }

function Shell({ meta, score, pb, children }: { meta: Meta; score: number; pb: number; children: ReactNode }) {
  const os = useOS();
  return (
    <div className="flex h-full flex-col font-mono2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--line)] bg-[var(--panel2)] px-3 py-1.5 text-[9px] uppercase tracking-[0.18em]">
        <span className="font-bold text-[var(--acc)]">{meta.glyph} {meta.name}</span>
        <span className="text-[var(--faint)]">{meta.keys}</span>
        <span className="ml-auto text-[var(--dim)]">score <span className="font-bold text-[var(--acc)]">{score}</span></span>
        <span className="text-[var(--dim)]">pb <span className="font-bold text-[var(--cyan)]">{pb}</span></span>
        <button onClick={() => os.openScores()} className="frow border border-[var(--line2)] px-2 py-0.5 text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
          ♛ top
        </button>
      </div>
      <div className="relative grid min-h-0 flex-1 place-items-center overflow-hidden bg-[var(--bg)] p-3">
        {children}
      </div>
    </div>
  );
}

function Ov({ title, sub, lines, cta }: { title: string; sub?: string; lines?: ReactNode; cta?: ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-[color-mix(in_srgb,var(--bg)_78%,transparent)]">
      <div className="crt-in max-w-[88%] border border-[var(--acc)] bg-[var(--panel)] px-6 py-5 text-center shadow-[0_0_50px_var(--acc-glow)]">
        <div className="font-disp text-[26px] leading-none tracking-wider text-[var(--acc)]" style={{ textShadow: "0 0 16px var(--acc-glow)" }}>{title}</div>
        {sub && <div className="mt-1.5 text-[9.5px] uppercase tracking-[0.24em] text-[var(--dim)]">{sub}</div>}
        {lines}
        {cta ?? <div className="mt-3 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">enter — run it back</div>}
      </div>
    </div>
  );
}

const startCta = (
  <div className="mt-3 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">
    press <span className="text-[var(--acc)]">enter</span> to start
  </div>
);

function endLines(score: number, rank: number | null, rec: boolean) {
  return (
    <div className="mt-3 space-y-1 text-[10.5px]">
      <div className="text-[var(--txt)]">score <span className="font-bold text-[var(--acc)]">{score}</span>{rec && <span className="ml-2 text-[var(--amber)]">★ new record</span>}</div>
      <div className="text-[var(--faint)]">
        {rank ? `leaderboard rank #${rank} · logged as ${playerName()}` : "missed the top-10 this time"}
      </div>
    </div>
  );
}

const canvasCls = "pixelated max-h-full max-w-full border border-[var(--line2)] bg-[var(--bg2)] shadow-[0_0_30px_rgba(0,0,0,0.5)]";

/* ————— 1 · SNAKE ————— */
const SNAKE = { cols: 24, rows: 16, cell: 20 };

function SnakeGame({ active, meta }: { active: boolean; meta: Meta }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [end, setEnd] = useState<{ rank: number | null; rec: boolean }>({ rank: null, rec: false });
  const st = useRef({ snake: [] as Array<{ x: number; y: number }>, dir: { x: 1, y: 0 }, queue: [] as Array<{ x: number; y: number }>, food: { x: 16, y: 8 }, acc: 0, score: 0, t: 0 });
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const activeRef = useRef(active); activeRef.current = active;

  const start = () => {
    st.current = { snake: [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }], dir: { x: 1, y: 0 }, queue: [], food: { x: 16, y: 8 }, acc: 0, score: 0, t: 0 };
    setScore(0);
    setPhase("play");
  };

  useKey((e) => {
    const k = e.key;
    const s = st.current;
    const push = (d: { x: number; y: number }) => {
      const last = s.queue[s.queue.length - 1] ?? s.dir;
      if (d.x !== -last.x || d.y !== -last.y) s.queue.push(d);
      e.preventDefault();
    };
    if (k === "ArrowUp" || k === "w") push({ x: 0, y: -1 });
    else if (k === "ArrowDown" || k === "s") push({ x: 0, y: 1 });
    else if (k === "ArrowLeft" || k === "a") push({ x: -1, y: 0 });
    else if (k === "ArrowRight" || k === "d") push({ x: 1, y: 0 });
    else if (k === "Enter" && phaseRef.current !== "play" && activeRef.current) start();
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const { cols, rows, cell } = SNAKE;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const c = cvs.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const s = st.current;
      s.t += dt;
      const playing = phaseRef.current === "play" && activeRef.current;
      if (playing) {
        const speed = 7 + Math.min(8, s.score / 60);
        s.acc += dt * speed;
        while (s.acc >= 1) {
          s.acc -= 1;
          if (s.queue.length) s.dir = s.queue.shift()!;
          const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
          if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows || s.snake.some((p) => p.x === head.x && p.y === head.y)) {
            const rec = s.score > 0 && s.score >= best("snake");
            const r = submitScore("snake", s.score);
            setEnd({ rank: r?.rank ?? null, rec });
            setPhase("over");
            break;
          }
          s.snake.unshift(head);
          if (head.x === s.food.x && head.y === s.food.y) {
            s.score += 10;
            setScore(s.score);
            do { s.food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }; }
            while (s.snake.some((p) => p.x === s.food.x && p.y === s.food.y));
          } else s.snake.pop();
        }
      }
      // draw
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = col("faint");
      for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) {
        ctx.globalAlpha = 0.14;
        ctx.fillRect(x * cell + cell / 2 - 0.5, y * cell + cell / 2 - 0.5, 1, 1);
      }
      ctx.globalAlpha = 1;
      const pulse = 0.6 + 0.4 * Math.sin(s.t * 6);
      ctx.fillStyle = col("amber");
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(s.food.x * cell + cell / 2, s.food.y * cell + cell / 2, 5, 0, 7);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = col("acc");
      s.snake.forEach((p, i) => {
        ctx.globalAlpha = i === 0 ? 1 : Math.max(0.35, 1 - i * 0.03);
        ctx.fillRect(p.x * cell + 2, p.y * cell + 2, cell - 4, cell - 4);
      });
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Shell meta={meta} score={score} pb={best("snake")}>
      <canvas ref={cvs} width={SNAKE.cols * SNAKE.cell} height={SNAKE.rows * SNAKE.cell} className={canvasCls} />
      {phase === "idle" && <Ov title="SNAKE.EXE" sub={meta.desc} cta={startCta} />}
      {phase === "over" && <Ov title="BITTEN" sub="the serpent ate itself" lines={endLines(score, end.rank, end.rec)} />}
      {phase === "play" && !active && <Ov title="PAUSED" sub="window lost focus" lines={<div className="mt-2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">click the window to resume</div>} />}
    </Shell>
  );
}

/* ————— 2 · TETRIS ————— */
const TET = { cols: 10, rows: 20, cell: 18 };
const PIECES: number[][][] = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
];
const rot = (m: number[][]) => m[0].map((_, i) => m.map((r) => r[i]).reverse());

function TetrisGame({ active, meta }: { active: boolean; meta: Meta }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [end, setEnd] = useState<{ rank: number | null; rec: boolean }>({ rank: null, rec: false });
  const st = useRef({ grid: [] as number[][], cur: { m: PIECES[0], x: 3, y: 0, c: 0 }, dropAcc: 0, dropInt: 750, score: 0, lines: 0, level: 1 });
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const activeRef = useRef(active); activeRef.current = active;

  const fits = (m: number[][], x: number, y: number, grid: number[][]) =>
    m.every((row, ry) => row.every((v, rx) => {
      if (!v) return true;
      const nx = x + rx, ny = y + ry;
      return nx >= 0 && nx < TET.cols && ny < TET.rows && (ny < 0 || !grid[ny][nx]);
    }));

  const spawn = (s: typeof st.current) => {
    const c = Math.floor(Math.random() * PIECES.length);
    s.cur = { m: PIECES[c], x: 3, y: 0, c };
    if (!fits(s.cur.m, s.cur.x, s.cur.y, s.grid)) {
      const rec = s.score > 0 && s.score >= best("tetris");
      const r = submitScore("tetris", s.score);
      setEnd({ rank: r?.rank ?? null, rec });
      setPhase("over");
    }
  };

  const start = () => {
    st.current = { grid: Array.from({ length: TET.rows }, () => Array(TET.cols).fill(0)), cur: { m: PIECES[0], x: 3, y: 0, c: 0 }, dropAcc: 0, dropInt: 750, score: 0, lines: 0, level: 1 };
    spawn(st.current);
    setScore(0);
    setPhase("play");
  };

  const lock = (s: typeof st.current) => {
    s.cur.m.forEach((row, ry) => row.forEach((v, rx) => {
      if (v && s.cur.y + ry >= 0) s.grid[s.cur.y + ry][s.cur.x + rx] = s.cur.c + 1;
    }));
    const full = s.grid.filter((r) => r.every(Boolean));
    if (full.length) {
      s.grid = s.grid.filter((r) => !r.every(Boolean));
      while (s.grid.length < TET.rows) s.grid.unshift(Array(TET.cols).fill(0));
      s.score += [0, 100, 300, 500, 800][full.length] * s.level;
      s.lines += full.length;
      s.level = 1 + Math.floor(s.lines / 5);
      s.dropInt = Math.max(110, 750 - (s.level - 1) * 80);
      setScore(s.score);
    }
    spawn(s);
  };

  useKey((e) => {
    if (phaseRef.current !== "play") { if (e.key === "Enter" && activeRef.current) start(); return; }
    if (!activeRef.current) return;
    const s = st.current;
    if (e.key === "ArrowLeft" && fits(s.cur.m, s.cur.x - 1, s.cur.y, s.grid)) { s.cur.x--; e.preventDefault(); }
    else if (e.key === "ArrowRight" && fits(s.cur.m, s.cur.x + 1, s.cur.y, s.grid)) { s.cur.x++; e.preventDefault(); }
    else if (e.key === "ArrowDown") { if (fits(s.cur.m, s.cur.x, s.cur.y + 1, s.grid)) { s.cur.y++; s.score += 1; setScore(s.score); } e.preventDefault(); }
    else if (e.key === "ArrowUp") {
      const r = rot(s.cur.m);
      for (const k of [0, -1, 1]) if (fits(r, s.cur.x + k, s.cur.y, s.grid)) { s.cur.m = r; s.cur.x += k; break; }
      e.preventDefault();
    } else if (e.key === " ") {
      while (fits(s.cur.m, s.cur.x, s.cur.y + 1, s.grid)) s.cur.y++;
      lock(s);
      e.preventDefault();
    }
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = now - last;
      last = now;
      const c = cvs.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const s = st.current;
      const playing = phaseRef.current === "play" && activeRef.current;
      if (playing) {
        s.dropAcc += dt;
        while (s.dropAcc >= s.dropInt) {
          s.dropAcc -= s.dropInt;
          if (fits(s.cur.m, s.cur.x, s.cur.y + 1, s.grid)) s.cur.y++;
          else lock(s);
        }
      }
      const { cols, rows, cell } = TET;
      const colors = ["", col("cyan"), col("amber"), col("pink"), col("acc"), col("red"), col("txt"), col("faint")];
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.strokeStyle = col("faint");
      ctx.globalAlpha = 0.12;
      for (let x = 1; x < cols; x++) { ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, rows * cell); ctx.stroke(); }
      ctx.globalAlpha = 1;
      s.grid.forEach((row, y) => row.forEach((v, x) => {
        if (!v) return;
        ctx.fillStyle = colors[v] ?? col("acc");
        ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
      }));
      if (phaseRef.current === "play") {
        ctx.fillStyle = col("acc");
        ctx.shadowColor = col("acc");
        ctx.shadowBlur = 8;
        s.cur.m.forEach((row, ry) => row.forEach((v, rx) => {
          if (v) ctx.fillRect((s.cur.x + rx) * cell + 1, (s.cur.y + ry) * cell + 1, cell - 2, cell - 2);
        }));
        ctx.shadowBlur = 0;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Shell meta={meta} score={score} pb={best("tetris")}>
      <canvas ref={cvs} width={TET.cols * TET.cell} height={TET.rows * TET.cell} className={canvasCls} />
      {phase === "idle" && <Ov title="TETRIS.EXE" sub={meta.desc} cta={startCta} />}
      {phase === "over" && <Ov title="STACK OVERFLOW" sub="the tower reached the sky" lines={endLines(score, end.rank, end.rec)} />}
      {phase === "play" && !active && <Ov title="PAUSED" sub="window lost focus" />}
    </Shell>
  );
}

/* ————— 3 · RACER ————— */
const RAC = { w: 300, h: 440 };
type Ent = { x: number; y: number; kind: "block" | "boost" | "cop" };

function RacerGame({ active, meta }: { active: boolean; meta: Meta }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [end, setEnd] = useState<{ rank: number | null; rec: boolean; reason: string }>({ rank: null, rec: false, reason: "" });
  const st = useRef({ lane: 1, px: 150, ents: [] as Ent[], spawnT: 0, dist: 0, score: 0, shield: 0, dash: 0, t: 0 });
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const activeRef = useRef(active); activeRef.current = active;
  const LANES = [75, 150, 225];

  const start = () => {
    st.current = { lane: 1, px: 150, ents: [], spawnT: 0.5, dist: 0, score: 0, shield: 0, dash: 0, t: 0 };
    setScore(0);
    setPhase("play");
  };

  useKey((e) => {
    if (phaseRef.current !== "play") { if (e.key === "Enter" && activeRef.current) start(); return; }
    if (!activeRef.current) return;
    if (e.key === "ArrowLeft") { st.current.lane = Math.max(0, st.current.lane - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { st.current.lane = Math.min(2, st.current.lane + 1); e.preventDefault(); }
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const c = cvs.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const s = st.current;
      s.t += dt;
      const playing = phaseRef.current === "play" && activeRef.current;
      if (playing) {
        const speed = Math.min(430, 175 + s.dist * 0.022) * (s.dash > 0 ? 1.45 : 1);
        s.dist += speed * dt;
        s.score = Math.floor(s.dist / 9);
        setScore(s.score);
        s.shield = Math.max(0, s.shield - dt);
        s.dash = Math.max(0, s.dash - dt);
        s.px += (LANES[s.lane] - s.px) * Math.min(1, dt * 14);
        s.spawnT -= dt;
        if (s.spawnT <= 0) {
          s.spawnT = Math.max(0.36, 0.85 - s.dist * 0.00005);
          const r = Math.random();
          const kind: Ent["kind"] = r < 0.55 ? "block" : r < 0.78 ? "boost" : "cop";
          s.ents.push({ x: LANES[Math.floor(Math.random() * 3)], y: -40, kind });
        }
        const py = RAC.h - 64;
        for (const en of s.ents) {
          en.y += speed * (en.kind === "cop" ? 0.72 : 1) * dt;
          if (Math.abs(en.x - s.px) < 30 && Math.abs(en.y - py) < 30) {
            if (en.kind === "boost") { en.y = 9999; s.score += 60; s.shield = 2.2; s.dash = 1.6; setScore(s.score); }
            else if (en.kind === "cop" && s.shield > 0) { en.y = 9999; s.score += 150; setScore(s.score); }
            else {
              const rec = s.score > 0 && s.score >= best("racer");
              const r2 = submitScore("racer", s.score);
              setEnd({ rank: r2?.rank ?? null, rec, reason: en.kind === "cop" ? "busted by the neon patrol" : "wrapped around a concrete block" });
              setPhase("over");
              break;
            }
          }
        }
        s.ents = s.ents.filter((en) => en.y < RAC.h + 60 && en.y < 9000);
      }
      // draw
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = col("faint");
      ctx.globalAlpha = 0.16;
      ctx.fillRect(20, 0, 2, RAC.h);
      ctx.fillRect(RAC.w - 22, 0, 2, RAC.h);
      ctx.globalAlpha = 0.2;
      const off = (s.dist * 1) % 44;
      for (let y = -44 + off; y < RAC.h; y += 44) {
        ctx.fillRect(110, y, 3, 22);
        ctx.fillRect(187, y, 3, 22);
      }
      ctx.globalAlpha = 1;
      for (const en of s.ents) {
        if (en.kind === "block") {
          ctx.fillStyle = col("dim");
          ctx.fillRect(en.x - 18, en.y - 16, 36, 32);
          ctx.fillStyle = col("amber");
          ctx.fillRect(en.x - 18, en.y - 16, 36, 4);
        } else if (en.kind === "boost") {
          ctx.fillStyle = col("amber");
          ctx.font = "bold 20px monospace";
          ctx.fillText("»", en.x - 10, en.y + 7);
        } else {
          ctx.fillStyle = col("txt");
          ctx.fillRect(en.x - 16, en.y - 20, 32, 40);
          ctx.fillStyle = Math.sin(s.t * 18) > 0 ? col("red") : col("cyan");
          ctx.fillRect(en.x - 10, en.y - 26, 20, 5);
        }
      }
      // player
      const py = RAC.h - 64;
      if (s.shield > 0 && Math.sin(s.t * 24) > 0) {
        ctx.strokeStyle = col("amber");
        ctx.strokeRect(s.px - 22, py - 26, 44, 52);
      }
      ctx.fillStyle = col("acc");
      ctx.shadowColor = col("acc");
      ctx.shadowBlur = 10;
      ctx.fillRect(s.px - 15, py - 22, 30, 44);
      ctx.shadowBlur = 0;
      ctx.fillStyle = col("bg2");
      ctx.fillRect(s.px - 9, py - 14, 18, 10);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Shell meta={meta} score={score} pb={best("racer")}>
      <canvas ref={cvs} width={RAC.w} height={RAC.h} className={canvasCls} />
      {phase === "idle" && <Ov title="RACER.EXE" sub="» boosts shield & dash · cops hate that" cta={startCta} />}
      {phase === "over" && <Ov title="WRECKED" sub={end.reason} lines={endLines(score, end.rank, end.rec)} />}
      {phase === "play" && !active && <Ov title="PAUSED" sub="window lost focus" />}
    </Shell>
  );
}

/* ————— 4 · SNIPER ————— */
const SNP = { w: 480, h: 300 };
type Target = { x: number; y: number; vx: number; kind: "enemy" | "civ" };

function SniperGame({ active, meta }: { active: boolean; meta: Meta }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [end, setEnd] = useState<{ rank: number | null; rec: boolean; reason: string }>({ rank: null, rec: false, reason: "" });
  const st = useRef({ mouse: { x: 240, y: 150 }, movers: [] as Target[], statics: [] as Array<{ x: number; y: number; dead: boolean }>, exposure: 0, ammo: 5, reload: 0, kills: 0, wave: 1, score: 0, t: 0, shake: 0, flash: "" });
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const activeRef = useRef(active); activeRef.current = active;

  const populate = (s: typeof st.current) => {
    s.movers = [];
    for (let i = 0; i < 2 + s.wave; i++) s.movers.push({ x: 60 + Math.random() * 360, y: 70 + Math.random() * 130, vx: (40 + Math.random() * 60) * (Math.random() > 0.5 ? 1 : -1), kind: "enemy" });
    for (let i = 0; i < 2; i++) s.movers.push({ x: 60 + Math.random() * 360, y: 90 + Math.random() * 120, vx: (18 + Math.random() * 20) * (Math.random() > 0.5 ? 1 : -1), kind: "civ" });
    s.statics = Array.from({ length: 3 }, () => ({ x: 50 + Math.random() * 380, y: 60 + Math.random() * 160, dead: false }));
  };

  const start = () => {
    st.current = { mouse: { x: 240, y: 150 }, movers: [], statics: [], exposure: 0, ammo: 5, reload: 0, kills: 0, wave: 1, score: 0, t: 0, shake: 0, flash: "" };
    populate(st.current);
    setScore(0);
    setPhase("play");
  };

  const finish = (reason: string) => {
    const s = st.current;
    const rec = s.score > 0 && s.score >= best("sniper");
    const r = submitScore("sniper", s.score);
    setEnd({ rank: r?.rank ?? null, rec, reason });
    setPhase("over");
  };

  const fire = () => {
    const s = st.current;
    if (phaseRef.current !== "play" || !activeRef.current) return;
    if (s.reload > 0) return;
    if (s.ammo <= 0) { s.reload = 0.9; return; }
    s.ammo--;
    s.shake = 0.25;
    const spot = 240 + Math.sin(s.t * 0.8) * 190;
    const lit = Math.abs(s.mouse.x - spot) < 75;
    s.exposure = Math.min(100, s.exposure + (lit ? 24 : 5));
    let hit = false;
    for (const m of s.movers) {
      if (Math.hypot(m.x - s.mouse.x, m.y - s.mouse.y) < 17) {
        hit = true;
        if (m.kind === "enemy") { s.score += 100; s.kills++; s.flash = "+100 target down"; }
        else { s.score = Math.max(0, s.score - 150); s.exposure = Math.min(100, s.exposure + 28); s.flash = "-150 CIVILIAN DOWN"; }
        m.y = -999;
        break;
      }
    }
    if (!hit) {
      for (const t of s.statics) {
        if (!t.dead && Math.hypot(t.x - s.mouse.x, t.y - s.mouse.y) < 15) { t.dead = true; s.score += 40; s.flash = "+40 plate"; hit = true; break; }
      }
    }
    if (!hit) s.flash = "miss";
    setScore(s.score);
    if (s.exposure >= 100) { finish("spotted — the light found you"); return; }
    if (s.movers.filter((m) => m.kind === "enemy" && m.y > -900).length === 0) {
      s.wave++;
      s.score += 150;
      s.flash = `wave ${s.wave} — +150`;
      setScore(s.score);
      populate(s);
    }
    if (s.movers.some((m) => m.kind === "civ" && m.y < -900)) finish("civilian down — mission failed");
  };

  useKey((e) => {
    if (!activeRef.current) return;
    if (e.key === "Enter" && phaseRef.current !== "play") start();
    if (e.key === "r" && phaseRef.current === "play" && st.current.ammo < 5) st.current.reload = 0.9;
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const c = cvs.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const s = st.current;
      s.t += dt;
      const playing = phaseRef.current === "play" && activeRef.current;
      if (playing) {
        if (s.reload > 0) { s.reload -= dt; if (s.reload <= 0) s.ammo = 5; }
        s.exposure = Math.max(0, s.exposure - dt * 3.2);
        s.shake = Math.max(0, s.shake - dt);
        for (const m of s.movers) {
          if (m.y < -900) continue;
          m.x += m.vx * dt * (1 + s.wave * 0.12);
          if (m.x < 30 || m.x > SNP.w - 30) m.vx *= -1;
        }
      }
      ctx.save();
      if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      ctx.clearRect(-8, -8, SNP.w + 16, SNP.h + 16);
      // skyline
      ctx.fillStyle = col("faint");
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 9; i++) ctx.fillRect(i * 56, 30 + ((i * 37) % 60), 40, SNP.h);
      ctx.globalAlpha = 1;
      // spotlight sweep
      const spot = 240 + Math.sin(s.t * 0.8) * 190;
      const g = ctx.createLinearGradient(spot - 75, 0, spot + 75, 0);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, `color-mix(in srgb, ${col("amber")} 14%, transparent)`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(spot - 75, 0, 150, SNP.h);
      // statics
      for (const t of s.statics) {
        ctx.strokeStyle = t.dead ? col("faint") : col("cyan");
        ctx.globalAlpha = t.dead ? 0.3 : 0.9;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 10, 0, 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(t.x, t.y, 3, 0, 7);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // movers
      for (const m of s.movers) {
        if (m.y < -900) continue;
        if (m.kind === "enemy") {
          ctx.fillStyle = col("red");
          ctx.fillRect(m.x - 5, m.y - 12, 10, 18);
          ctx.fillRect(m.x - 8, m.y - 6, 16, 3);
          const step = Math.sin(s.t * 10 + m.x) * 3;
          ctx.fillRect(m.x - 4, m.y + 6, 3, 8 + step);
          ctx.fillRect(m.x + 1, m.y + 6, 3, 8 - step);
        } else {
          ctx.fillStyle = col("dim");
          ctx.fillRect(m.x - 4, m.y - 10, 8, 16);
          ctx.strokeStyle = col("dim");
          ctx.beginPath();
          ctx.arc(m.x, m.y - 13, 8, Math.PI, 0);
          ctx.stroke();
          ctx.font = "7px monospace";
          ctx.fillText("civ", m.x - 7, m.y + 18);
        }
      }
      // crosshair
      const sway = Math.sin(s.t * 2.2) * 2.5;
      const mx = s.mouse.x + sway, my = s.mouse.y + Math.cos(s.t * 1.8) * 2;
      ctx.strokeStyle = col("acc");
      ctx.shadowColor = col("acc");
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(mx, my, 12, 0, 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mx - 18, my); ctx.lineTo(mx - 6, my);
      ctx.moveTo(mx + 6, my); ctx.lineTo(mx + 18, my);
      ctx.moveTo(mx, my - 18); ctx.lineTo(mx, my - 6);
      ctx.moveTo(mx, my + 6); ctx.lineTo(mx, my + 18);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
      // HUD inside canvas
      ctx.fillStyle = col("faint");
      ctx.font = "9px monospace";
      ctx.fillText("EXPOSURE", 10, 14);
      ctx.fillStyle = col("line2");
      ctx.fillRect(10, 18, 110, 5);
      ctx.fillStyle = s.exposure > 66 ? col("red") : s.exposure > 33 ? col("amber") : col("acc");
      ctx.fillRect(10, 18, 110 * (s.exposure / 100), 5);
      ctx.fillStyle = col("txt");
      ctx.fillText("ammo " + "▮".repeat(s.ammo) + "▯".repeat(Math.max(0, 5 - s.ammo)) + (s.reload > 0 ? "  reloading…" : ""), SNP.w - 150, 22);
      ctx.fillText(`wave ${s.wave}`, SNP.w / 2 - 18, 22);
      if (s.flash) {
        ctx.fillStyle = s.flash.startsWith("-") ? col("red") : col("acc");
        ctx.fillText(s.flash, 10, SNP.h - 10);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Shell meta={meta} score={score} pb={best("sniper")}>
      <canvas
        ref={cvs} width={SNP.w} height={SNP.h} className={`${canvasCls} cursor-none`}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          st.current.mouse = { x: ((e.clientX - r.left) / r.width) * SNP.w, y: ((e.clientY - r.top) / r.height) * SNP.h };
        }}
        onMouseDown={fire}
      />
      {phase === "idle" && <Ov title="SNIPER.EXE" sub="red = target · gray+umbrella = civilian · light = spotted" cta={startCta} />}
      {phase === "over" && <Ov title="MISSION END" sub={end.reason} lines={endLines(score, end.rank, end.rec)} />}
      {phase === "play" && !active && <Ov title="PAUSED" sub="window lost focus" />}
    </Shell>
  );
}

/* ————— 5 · DINO ————— */
const DINO = { w: 480, h: 180 };
type Ob = { x: number; w: number; h: number; bird: boolean; y: number };

function DinoGame({ active, meta }: { active: boolean; meta: Meta }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [end, setEnd] = useState<{ rank: number | null; rec: boolean }>({ rank: null, rec: false });
  const st = useRef({ y: 0, vy: 0, duck: false, obs: [] as Ob[], speed: 210, dist: 0, spawnT: 1, t: 0 });
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const activeRef = useRef(active); activeRef.current = active;

  const start = () => {
    st.current = { y: 0, vy: 0, duck: false, obs: [], speed: 210, dist: 0, spawnT: 1, t: 0 };
    setScore(0);
    setPhase("play");
  };

  useKey((e) => {
    const s = st.current;
    if (e.key === "Enter" && phaseRef.current !== "play") { if (activeRef.current) start(); return; }
    if (phaseRef.current !== "play" || !activeRef.current) return;
    if ((e.key === " " || e.key === "ArrowUp") && s.y <= 0.01) { s.vy = 430; e.preventDefault(); }
    if (e.key === "ArrowDown") { s.duck = true; e.preventDefault(); }
  });
  useEffect(() => {
    const up = (e: KeyboardEvent) => { if (e.key === "ArrowDown") st.current.duck = false; };
    window.addEventListener("keyup", up);
    return () => window.removeEventListener("keyup", up);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const G = 1500;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const c = cvs.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const s = st.current;
      s.t += dt;
      const playing = phaseRef.current === "play" && activeRef.current;
      if (playing) {
        s.speed = Math.min(470, 210 + s.dist * 0.028);
        s.dist += s.speed * dt;
        setScore(Math.floor(s.dist / 9));
        s.vy -= G * (s.duck && s.y > 0 ? 2.1 : 1) * dt;
        s.y = Math.max(0, s.y + s.vy * dt);
        if (s.y === 0) s.vy = 0;
        s.spawnT -= dt;
        if (s.spawnT <= 0) {
          s.spawnT = Math.max(0.5, 1.4 - s.speed * 0.0016) * (0.75 + Math.random() * 0.6);
          const bird = s.dist > 350 && Math.random() < 0.3;
          s.obs.push(bird
            ? { x: DINO.w + 30, w: 24, h: 16, bird: true, y: Math.random() < 0.5 ? 34 : 62 }
            : { x: DINO.w + 30, w: 12 + Math.random() * 16, h: 20 + Math.random() * 18, bird: false, y: 0 });
        }
        const dh = s.duck ? 15 : 27;
        const dy = 150 - s.y - dh;
        const box = { x: 40, y: dy, w: 22, h: dh };
        for (const o of s.obs) {
          o.x -= s.speed * dt;
          const oy = o.bird ? 150 - o.y : 150 - o.h;
          if (box.x < o.x + o.w && box.x + box.w > o.x && box.y < oy + o.h && box.y + box.h > oy) {
            const rec = Math.floor(s.dist / 9) >= best("dino") && s.dist > 20;
            const r = submitScore("dino", Math.floor(s.dist / 9));
            setEnd({ rank: r?.rank ?? null, rec });
            setPhase("over");
            break;
          }
        }
        s.obs = s.obs.filter((o) => o.x > -40);
      }
      const night = Math.floor(s.dist / 1400) % 2 === 1;
      ctx.clearRect(0, 0, c.width, c.height);
      if (night) { ctx.fillStyle = col("faint"); ctx.globalAlpha = 0.08; ctx.fillRect(0, 0, DINO.w, DINO.h); ctx.globalAlpha = 1; }
      ctx.fillStyle = col("dim");
      ctx.fillRect(0, 150, DINO.w, 2);
      ctx.fillStyle = col("faint");
      const gOff = (s.dist) % 26;
      for (let x = -26 + (26 - gOff); x < DINO.w; x += 26) ctx.fillRect(x, 156, 10, 2);
      // dino
      const dh = s.duck ? 15 : 27;
      const dy = 150 - s.y - dh;
      ctx.fillStyle = col("acc");
      ctx.shadowColor = col("acc");
      ctx.shadowBlur = 8;
      ctx.fillRect(40, dy, 22, dh);
      if (!s.duck) ctx.fillRect(52, dy - 8, 12, 10);
      ctx.shadowBlur = 0;
      if (s.y <= 0 && phaseRef.current === "play") {
        const step = Math.sin(s.t * 22) * 3;
        ctx.fillRect(43, dy + dh, 4, 5 + step);
        ctx.fillRect(54, dy + dh, 4, 5 - step);
      }
      ctx.fillStyle = col("bg2");
      ctx.fillRect(s.duck ? 56 : 58, (s.duck ? dy + 3 : dy - 5), 3, 3);
      // obstacles
      for (const o of s.obs) {
        if (o.bird) {
          const oy = 150 - o.y;
          ctx.fillStyle = col("cyan");
          const flap = Math.sin(s.t * 16) * 5;
          ctx.fillRect(o.x, oy, o.w, 6);
          ctx.fillRect(o.x + 4, oy - 6 + flap, 14, 4);
        } else {
          ctx.fillStyle = col("red");
          ctx.globalAlpha = 0.85;
          ctx.fillRect(o.x, 150 - o.h, o.w, o.h);
          ctx.fillRect(o.x - 4, 150 - o.h + 6, 4, o.h - 12);
          ctx.globalAlpha = 1;
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Shell meta={meta} score={score} pb={best("dino")}>
      <canvas ref={cvs} width={DINO.w} height={DINO.h} className={canvasCls} />
      {phase === "idle" && <Ov title="DINO.EXE" sub="no internet? no problem." cta={startCta} />}
      {phase === "over" && <Ov title="EXTINCT" sub="the run ends for everyone eventually" lines={endLines(score, end.rank, end.rec)} />}
      {phase === "play" && !active && <Ov title="PAUSED" sub="window lost focus" />}
    </Shell>
  );
}

/* ————— game window shell ————— */
type GameComp = (p: { active: boolean; meta: Meta }) => ReactElement;
const MAP: Record<GameId, GameComp> = {
  snake: SnakeGame, tetris: TetrisGame, racer: RacerGame, sniper: SniperGame, dino: DinoGame,
};

export function GameWin() {
  const os = useOS();
  const id = (GAMES.some((g) => g.id === os.selGame) ? os.selGame : "snake") as GameId;
  const w = os.wins.game;
  const active = os.focused === "game" && w.open && !w.min;
  const meta = gameMeta(id);
  const Comp = MAP[id];
  /* key = fresh component instance per game → hooks never collide between games */
  return <Comp key={id} active={active} meta={meta} />;
}

/* ————— leaderboard window ————— */
export function ScoresWin() {
  const os = useOS();
  const [tab, setTab] = useState<GameId>("snake");
  const [name, setName] = useState(playerName());
  const rows = top(tab);
  const meta = gameMeta(tab);

  return (
    <div className="flex h-full flex-col font-mono2 text-[11.5px]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--panel2)] px-3 py-2">
        <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--faint)]">handle:</span>
        <input
          value={name}
          maxLength={16}
          onChange={(e) => setName(e.target.value)}
          className="w-36 border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 text-[11px] text-[var(--acc)] outline-none focus:border-[var(--acc)]"
          spellCheck={false}
        />
        <button
          onClick={() => { setPlayerName(name); os.toast(`HANDLE SAVED → ${name.slice(0, 16) || "anon_0perator"}`); }}
          className="border border-[var(--line2)] px-2 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]"
        >
          save
        </button>
        <span className="ml-auto text-[8.5px] uppercase tracking-[0.2em] text-[var(--faint)]">records live in this browser</span>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-[var(--line)] bg-[var(--panel2)] px-3 py-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setTab(g.id)}
            className={`shrink-0 border px-2.5 py-1 text-[9.5px] uppercase tracking-[0.16em] transition-colors ${tab === g.id ? "border-[var(--acc)] bg-[var(--acc-dim)] font-bold text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)] hover:text-[var(--txt)]"}`}
          >
            {g.glyph} {g.id}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-[9.5px] uppercase tracking-[0.22em] text-[var(--faint)]">
          <span className="text-[var(--acc)]">{meta.glyph}</span>
          <span>{meta.name} — top 10</span>
          <span className="ml-auto">{meta.desc}</span>
        </div>
        <div className="grid grid-cols-[34px_1fr_70px_86px] gap-x-2 border-b border-[var(--line2)] pb-1 text-[8.5px] uppercase tracking-[0.24em] text-[var(--faint)]">
          <span>#</span><span>operator</span><span className="text-right">score</span><span className="text-right">when</span>
        </div>
        {rows.length === 0 && (
          <div className="mt-6 text-center text-[10.5px] text-[var(--faint)]">
            no records yet — the board is virgin silicon.<br />
            <span className="text-[var(--dim)]">open the arcade and change history.</span>
          </div>
        )}
        {rows.map((r, i) => (
          <div
            key={`${r.ts}-${i}`}
            className={`grid grid-cols-[34px_1fr_70px_86px] gap-x-2 border-b border-[var(--line)] px-0 py-1.5 text-[11px] transition-colors hover:bg-[var(--acc-dim)] ${r.name === playerName() ? "text-[var(--acc)]" : "text-[var(--dim)]"}`}
          >
            <span className={`font-bold ${i === 0 ? "text-[var(--amber)]" : i < 3 ? "text-[var(--cyan)]" : "text-[var(--faint)]"}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="truncate">{r.name}{r.name === playerName() && <span className="ml-1 text-[8.5px] text-[var(--faint)]">(you)</span>}</span>
            <span className="text-right font-bold">{r.score}</span>
            <span className="text-right text-[9px] text-[var(--faint)]">{new Date(r.ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--line)] bg-[var(--panel2)] px-4 py-1.5 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">
        arcade.sys · every run auto-submits · top-10 per game
      </div>
    </div>
  );
}
