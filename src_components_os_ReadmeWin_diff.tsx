--- src/components/os/ReadmeWin.tsx (原始)
import { useOS } from "./ctx";
import { ARROW_ART } from "../../lib/ascii";
import { EMAIL } from "../../lib/os-data";

function H({ children }: { children: string }) {
  return (
    <div className="mb-2 mt-6 font-mono2 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--acc)] first:mt-0">
      ## {children}
    </div>
  );
}

export default function ReadmeWin() {
  const os = useOS();
  return (
    <div className="h-full px-5 py-5 font-mono2 text-[11.5px] leading-relaxed text-[var(--dim)]">
      <h2 className="font-disp text-3xl leading-none tracking-wide text-[var(--txt)]">
        README<span className="text-[var(--acc)]">.md</span>
      </h2>
      <p className="mt-2 text-[var(--faint)]">
        You are inside a portfolio disguised as an operating system. Everything on this screen is functional. There is no scroll — it is all here.
      </p>

      <H>navigate</H>
      <ul className="space-y-1.5">
        <li><span className="text-[var(--txt)]">drag</span> any window by its titlebar <span className="text-[var(--faint)]">(double-click it to maximize)</span></li>
        <li><span className="text-[var(--red)]">×</span> closes · <span className="text-[var(--amber)]">–</span> minimizes · <span className="text-[var(--cyan)]">▢</span> maximizes</li>
        <li>the <span className="text-[var(--txt)]">taskbar</span> reopens anything you closed</li>
        <li>hotkeys: <Kbd>alt</Kbd>+<Kbd>1…5</Kbd> jump to windows</li>
      </ul>
      <pre className="mt-3 w-fit border border-[var(--line)] bg-[var(--panel2)] p-2 text-[9px] leading-snug text-[var(--faint)]">{ARROW_ART}</pre>

      <H>terminal</H>
      <p>
        The shell speaks: <Cmd>help</Cmd> <Cmd>whoami</Cmd> <Cmd>ls</Cmd> <Cmd>open pulseboard</Cmd>{" "}
        <Cmd>skills</Cmd> <Cmd>contact</Cmd> <Cmd>neofetch</Cmd> <Cmd>theme amber</Cmd> <Cmd>theme dark</Cmd> <Cmd>matrix</Cmd>.
        History with <Kbd>↑</Kbd><Kbd>↓</Kbd>, autocomplete with <Kbd>tab</Kbd>.
      </p>

      <H>cms.sys — content control</H>
      <p>
        Open <Cmd>cms.sys</Cmd> from the desktop (or type <Cmd>login</Cmd>). Guest pass is printed right on the
        login screen: <span className="text-[var(--acc)]">admin / qwerty123</span> — demo mode, edits apply live
        but reset on refresh. Root credentials unlock persistent edits, credential rotation and a factory reset.
        Inside are eight tabs — <Cmd>about</Cmd> <Cmd>projects</Cmd> <Cmd>widgets</Cmd> <Cmd>playlist</Cmd>{" "}
        <Cmd>ascii arts</Cmd> <Cmd>blog</Cmd> <Cmd>desktop</Cmd> <Cmd>theme</Cmd> — every one of them drives a real
        part of the OS: dock widgets left/right/top, arrange icons (auto / free-grid drag / docked), rename them,
        write blog posts with figures and forms, or swap the operator portrait for your own photo or clip.
        The white rabbit knows the rest.
      </p>

      <H>blog.md — articles</H>
      <p>
        Type <Cmd>blog</Cmd> or open the <span className="text-[var(--acc)]">≣</span> icon. Posts are markdown-lite
        files rendered from the cms.sys template: headings, quotes, lists, <Cmd>![0]</Cmd> figures with a lightbox,
        and an embedded <Cmd>{"{{form}}"}</Cmd> that hands a visitor's note straight to the inbox.
      </p>

      <H>specs of this build</H>
      <ul className="space-y-1">
        <li><span className="text-[var(--txt)]">react 18 + typescript</span> — hand-rolled window manager, zero UI libs</li>
        <li>single viewport · CRT scanlines · phosphor themes · matrix rain on demand</li>
        <li>easter egg: park your cursor on the desktop for ~2.5s — the rain assembles a meme around it</li>
        <li>respects <span className="text-[var(--txt)]">prefers-reduced-motion</span></li>
      </ul>

      <H>hire protocol</H>
      <p>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(EMAIL);
            os.toast(`COPIED: ${EMAIL}`);
          }}
          className="alink text-[var(--acc)]"
        >
          {EMAIL} ⧉
        </button>{" "}
        <span className="text-[var(--faint)]">— click to copy, or just write me. response time: &lt; 24h.</span>
      </p>
    </div>
  );
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="border border-[var(--line2)] bg-[var(--panel2)] px-1.5 py-px text-[10px] text-[var(--txt)]">
      {children}
    </kbd>
  );
}
function Cmd({ children }: { children: string }) {
  return <code className="text-[var(--acc)]">`{children}`</code>;
}


+++ src/components/os/ReadmeWin.tsx (修改后)
import { useOS } from "./ctx";
import { ARROW_ART } from "../../lib/ascii";
import { EMAIL } from "../../lib/os-data";

function H({ children }: { children: string }) {
  return (
    <div className="mb-2 mt-6 font-mono2 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--acc)] first:mt-0">
      ## {children}
    </div>
  );
}

export default function ReadmeWin() {
  const os = useOS();
  return (
    <div className="h-full px-5 py-5 font-mono2 text-[11.5px] leading-relaxed text-[var(--dim)]">
      <h2 className="font-disp text-3xl leading-none tracking-wide text-[var(--txt)]">
        README<span className="text-[var(--acc)]">.md</span>
      </h2>
      <p className="mt-2 text-[var(--faint)]">
        You are inside a portfolio disguised as an operating system. Everything on this screen is functional. There is no scroll — it is all here.
      </p>

      <H>navigate</H>
      <ul className="space-y-1.5">
        <li><span className="text-[var(--txt)]">drag</span> any window by its titlebar <span className="text-[var(--faint)]">(double-click it to maximize)</span></li>
        <li><span className="text-[var(--red)]">×</span> closes · <span className="text-[var(--amber)]">–</span> minimizes · <span className="text-[var(--cyan)]">▢</span> maximizes</li>
        <li>the <span className="text-[var(--txt)]">taskbar</span> reopens anything you closed</li>
        <li>hotkeys: <Kbd>alt</Kbd>+<Kbd>1…5</Kbd> jump to windows</li>
      </ul>
      <pre className="mt-3 w-fit border border-[var(--line)] bg-[var(--panel2)] p-2 text-[9px] leading-snug text-[var(--faint)]">{ARROW_ART}</pre>

      <H>terminal</H>
      <p>
        The shell speaks: <Cmd>help</Cmd> <Cmd>whoami</Cmd> <Cmd>ls</Cmd> <Cmd>open pulseboard</Cmd>{" "}
        <Cmd>skills</Cmd> <Cmd>contact</Cmd> <Cmd>neofetch</Cmd> <Cmd>theme amber</Cmd> <Cmd>theme dark</Cmd> <Cmd>matrix</Cmd>.
        History with <Kbd>↑</Kbd><Kbd>↓</Kbd>, autocomplete with <Kbd>tab</Kbd>.
      </p>

      <H>cms.sys — content control</H>
      <p>
        Open <Cmd>cms.sys</Cmd> from the desktop (or type <Cmd>login</Cmd>). Guest pass is printed right on the
        login screen: <span className="text-[var(--acc)]">admin / qwerty123</span> — demo mode, edits apply live
        but reset on refresh. Root credentials unlock persistent edits, credential rotation and a factory reset.
        Inside are eight tabs — <Cmd>about</Cmd> <Cmd>projects</Cmd> <Cmd>widgets</Cmd> <Cmd>playlist</Cmd>{" "}
        <Cmd>ascii arts</Cmd> <Cmd>blog</Cmd> <Cmd>desktop</Cmd> <Cmd>theme</Cmd> — every one of them drives a real
        part of the OS: dock widgets left/right/top, arrange icons (auto / free-grid drag / docked), rename them,
        write blog posts with figures and forms, or swap the operator portrait for your own photo or clip.
        The white rabbit knows the rest.
      </p>

      <H>blog.md — articles</H>
      <p>
        Type <Cmd>blog</Cmd> or open the folder icon. Inside sit .md files — click one and it opens in a reader
        window. Posts render from the cms.sys template: headings, quotes, lists, <Cmd>![0]</Cmd> figures with a
        lightbox, and an embedded <Cmd>{"{{form}}"}</Cmd> uplink. Guests browse read-only; writing happens in cms.sys.
      </p>

      <H>arcade.sys — five games, one leaderboard</H>
      <p>
        snake · tetris · racer (boosts + neon patrol) · sniper (moving targets, civilians, don't get lit) · dino.
        Each game opens its own window; every run auto-submits to a local <span className="text-[var(--acc)]">top-10 per game</span> —
        switch tabs in the leaderboard window and set your handle there.
      </p>

      <H>windows-grade chrome</H>
      <ul className="space-y-1">
        <li><span className="text-[var(--txt)]">resize any window</span> — hover an edge or a corner, drag</li>
        <li>order.sys takes project briefs per category (templates live in cms.sys ▸ briefs)</li>
        <li>trophies.sys shows the achievements ledger (cms.sys ▸ trophies)</li>
      </ul>

      <H>specs of this build</H>
      <ul className="space-y-1">
        <li><span className="text-[var(--txt)]">react 18 + typescript</span> — hand-rolled window manager, zero UI libs</li>
        <li>single viewport · CRT scanlines · phosphor themes · matrix rain on demand</li>
        <li>easter egg: park your cursor on the desktop for ~2.5s — the rain assembles a meme around it</li>
        <li>respects <span className="text-[var(--txt)]">prefers-reduced-motion</span></li>
      </ul>

      <H>hire protocol</H>
      <p>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(EMAIL);
            os.toast(`COPIED: ${EMAIL}`);
          }}
          className="alink text-[var(--acc)]"
        >
          {EMAIL} ⧉
        </button>{" "}
        <span className="text-[var(--faint)]">— click to copy, or just write me. response time: &lt; 24h.</span>
      </p>
    </div>
  );
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="border border-[var(--line2)] bg-[var(--panel2)] px-1.5 py-px text-[10px] text-[var(--txt)]">
      {children}
    </kbd>
  );
}
function Cmd({ children }: { children: string }) {
  return <code className="text-[var(--acc)]">`{children}`</code>;
}
