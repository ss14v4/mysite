--- src/lib/arcade.ts (原始)


+++ src/lib/arcade.ts (修改后)
/* ————— volkovos arcade · local records & game registry ————— */

export const GAMES = [
  { id: "snake", name: "snake.exe", glyph: "⌇", desc: "eat · grow · don't bite yourself", keys: "arrows / wasd · enter" },
  { id: "tetris", name: "tetris.exe", glyph: "▚", desc: "stack · clear · survive gravity", keys: "←→↓ · ↑ rotate · space" },
  { id: "racer", name: "racer.exe", glyph: "⌁", desc: "dodge · boost · outrun the law", keys: "← → · enter" },
  { id: "sniper", name: "sniper.exe", glyph: "◎", desc: "hit targets · spare civilians · stay in shadow", keys: "mouse · click · r" },
  { id: "dino", name: "dino.exe", glyph: "▲", desc: "the classic run · no chrome needed", keys: "space / ↑ · ↓ duck" },
] as const;

export type GameId = (typeof GAMES)[number]["id"];
export const gameMeta = (id: string) => GAMES.find((g) => g.id === id) ?? GAMES[0];

export interface ScoreEntry { name: string; score: number; ts: number; }
type DB = Partial<Record<GameId, ScoreEntry[]>>;

const KEY = "volkovos.arcade.v1";
const PKEY = "volkovos.arcade.player";

function load(): DB {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as DB; } catch { return {}; }
}
function save(db: DB) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* private mode */ }
}

export function top(game: GameId): ScoreEntry[] {
  return load()[game] ?? [];
}

export function best(game: GameId): number {
  return top(game).reduce((m, e) => Math.max(m, e.score), 0);
}

/** records the run, keeps top-10, returns the entry + rank (or null when it missed the board) */
export function submitScore(game: GameId, score: number): { entry: ScoreEntry; rank: number } | null {
  if (score <= 0) return null;
  const db = load();
  const entry: ScoreEntry = { name: playerName(), score, ts: Date.now() };
  const list = [...(db[game] ?? []), entry].sort((a, b) => b.score - a.score).slice(0, 10);
  db[game] = list;
  save(db);
  return { entry, rank: list.indexOf(entry) + 1 };
}

export function isRecord(game: GameId, score: number): boolean {
  return score > 0 && score >= best(game);
}

export function playerName(): string {
  try { return localStorage.getItem(PKEY) ?? "anon_0perator"; } catch { return "anon_0perator"; }
}
export function setPlayerName(name: string) {
  try { localStorage.setItem(PKEY, name.slice(0, 16) || "anon_0perator"); } catch { /* noop */ }
}

/* theme-aware canvas colors (cached) */
let cache: Record<string, string> = {};
let cachedAt = 0;
export function col(name: "acc" | "dim" | "faint" | "txt" | "red" | "cyan" | "amber" | "pink" | "bg" | "bg2" | "line2"): string {
  if (Date.now() - cachedAt > 500) { cache = {}; cachedAt = Date.now(); }
  if (!cache[name]) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
    cache[name] = v || "#46f084";
  }
  return cache[name];
}
