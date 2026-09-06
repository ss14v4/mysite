import { useEffect, useRef, useState } from "react";
import { BOOT_LOGO } from "../../lib/ascii";
import { usePRM } from "./ctx";

const LINES = [
  "VOLKOV/OS BIOS v2.4.1 — power-on self test",
  "CPU: COFFEE-CORE™ ×8 @ 3.7GHz .............. OK",
  "MEM CHECK: 640K ............................. OK (enough for anybody)",
  "MOUNTING /home/alex ......................... OK",
  "LOADING MODULES [portfolio] [resume] [shell]  OK",
  "DECRYPTING PROJECT FILES .................... 6 FOUND",
  "STARTING WINDOW MANAGER ...",
];

export default function Boot({ onDone }: { onDone: () => void }) {
  const prm = usePRM();
  const [count, setCount] = useState(prm ? LINES.length : 0);
  const [prog, setProg] = useState(prm ? 100 : 0);
  const [ready, setReady] = useState(prm);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    if (prm) {
      const t = setTimeout(finish, 700);
      return () => clearTimeout(t);
    }
    const t1 = setInterval(() => {
      setCount((c) => {
        if (c >= LINES.length) {
          clearInterval(t1);
          return c;
        }
        return c + 1;
      });
    }, 240);
    return () => clearInterval(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prm]);

  useEffect(() => {
    if (prm || count < LINES.length) return;
    const t2 = setInterval(() => {
      setProg((p) => {
        const n = Math.min(100, p + 4 + Math.random() * 7);
        if (n >= 100) {
          clearInterval(t2);
          setReady(true);
        }
        return n;
      });
    }, 42);
    return () => clearInterval(t2);
  }, [count, prm]);

  useEffect(() => {
    if (!ready) return;
    const auto = setTimeout(finish, 3200);
    const key = () => finish();
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", key);
    return () => {
      clearTimeout(auto);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div className="boot-flicker fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)] p-6">
      <button
        onClick={finish}
        className="absolute right-4 top-3 font-mono2 text-[11px] uppercase tracking-[0.2em] text-[var(--faint)] transition-colors hover:text-[var(--acc)]"
      >
        skip »
      </button>
      <div className="w-full max-w-2xl">
        <pre className="font-mono2 overflow-x-auto text-[10px] leading-[1.15] text-[var(--acc)] sm:text-xs md:text-sm" style={{ textShadow: "0 0 14px var(--acc-glow)" }}>
          {BOOT_LOGO}
        </pre>
        <div className="mt-2 font-disp text-xl tracking-[0.3em] text-[var(--dim)]">
          VOLKOV/OS <span className="text-[var(--acc)]">v2.4.1</span> — PORTFOLIO KERNEL
        </div>

        <div className="mt-8 space-y-1.5 font-mono2 text-[12px] leading-relaxed">
          {LINES.slice(0, count).map((l, i) => (
            <div key={i} className="tick-up text-[var(--dim)]">
              <span className="mr-2 text-[var(--faint)]">[{String(i).padStart(2, "0")}]</span>
              {l.includes("OK") ? (
                <>
                  {l.split("OK")[0]}
                  <span className="text-[var(--acc)]">OK</span>
                  {l.split("OK")[1]}
                </>
              ) : (
                <span className={i === LINES.length - 1 ? "text-[var(--txt)]" : ""}>{l}</span>
              )}
            </div>
          ))}
          {count >= LINES.length && (
            <div className="mt-4 flex items-center gap-3">
              <div className="h-3 w-64 max-w-[50vw] border border-[var(--line2)] p-[2px]">
                <div className="pbar-fill h-full" style={{ width: `${prog}%` }} />
              </div>
              <span className="text-[var(--acc)]">{Math.floor(prog)}%</span>
            </div>
          )}
        </div>

        <div className="mt-8 font-mono2 text-[12px] text-[var(--acc)]">
          {ready ? (
            <span>
              ▸ PRESS ANY KEY TO ENTER THE SYSTEM <span className="term-caret" />
            </span>
          ) : (
            <span className="text-[var(--faint)]">initializing…</span>
          )}
        </div>
      </div>
    </div>
  );
}
