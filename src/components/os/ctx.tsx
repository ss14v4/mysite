import { createContext, useContext, useEffect, useState } from "react";
import type { ThemeName } from "../../lib/os-data";

export type WinId = "about" | "projects" | "terminal" | "viewer" | "readme";

export interface WinState {
  id: WinId;
  open: boolean;
  min: boolean;
  max: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  born: number;
}

export interface OSApi {
  wins: Record<WinId, WinState>;
  focused: WinId | null;
  selected: string | null;
  open: (id: WinId, opts?: { center?: boolean }) => void;
  close: (id: WinId) => void;
  minimize: (id: WinId) => void;
  toggleMax: (id: WinId) => void;
  focus: (id: WinId) => void;
  move: (id: WinId, x: number, y: number) => void;
  openViewer: (slug: string) => void;
  toast: (msg: string) => void;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  cycleTheme: () => void;
  boost: () => void;
  boosted: boolean;
  launched: boolean;
}

export const OSContext = createContext<OSApi>(null!);
export const useOS = () => useContext(OSContext);

export function useMediaQuery(q: string): boolean {
  const [match, setMatch] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(q).matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia(q);
    const fn = () => setMatch(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [q]);
  return match;
}

export function usePRM(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
