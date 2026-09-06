--- src/components/os/CmsWin.tsx (原始)
import { useEffect, useState } from "react";
import { useOS } from "./ctx";
import { useCMS, DEFAULT_CONTENT, downscaleImage, fileToDataURL } from "../../lib/cms";
import type { CmsProfile, CmsProject, CmsTrack, CmsStat, CmsArt, FieldType, WidgetId, CmsPost } from "../../lib/cms";
import { RABBIT_ART, ARTS } from "../../lib/ascii";
import { THEMES, THEME_HEX } from "../../lib/os-data";

const deployBtn = "frow border border-[var(--acc)] bg-[var(--acc-dim)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--acc)]";
const ghostBtn = "border border-[var(--line2)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--txt)] hover:text-[var(--txt)]";
const addBtn = "frow mt-3 w-full border border-dashed border-[var(--line2)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:bg-[var(--acc-dim)] hover:text-[var(--acc)]";
const inputCls = "w-full border border-[var(--line2)] bg-[var(--panel2)] px-2 py-1.5 font-mono2 text-[11px] text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]";

function Field({ label, value, onChange, wide = false, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; wide?: boolean; placeholder?: string;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">{label}</span>
      {wide ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder}
          className="w-full resize-none border border-[var(--line2)] bg-[var(--panel2)] px-2 py-1.5 font-mono2 text-[11px] leading-relaxed text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      )}
    </label>
  );
}

function SectionHead({ children }: { children: string }) {
  return (
    <div className="mb-2 mt-5 flex items-center gap-2 first:mt-0">
      <span className="font-mono2 text-[9.5px] font-bold uppercase tracking-[0.26em] text-[var(--acc)]">## {children}</span>
      <span className="h-px flex-1 bg-[var(--line2)]" />
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-pressed={on}
      className="relative h-4 w-9 shrink-0 border border-[var(--line2)] bg-[var(--bg2)] transition-colors hover:border-[var(--acc)]">
      <span className={`absolute top-1/2 h-2.5 w-3.5 -translate-y-1/2 transition-all duration-200 ${on ? "left-[calc(100%-18px)] bg-[var(--acc)] shadow-[0_0_8px_var(--acc-glow)]" : "left-[2px] bg-[var(--faint)]"}`} />
    </button>
  );
}

/* shrink+persist image files as dataURLs for the gallery */
function fileToDataUrl(file: File, maxW = 1280): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = rej;
    img.src = url;
  });
}

/* ————— FieldForge — append your own form controls to any tab ————— */
const FIELD_TYPES: Array<{ t: FieldType; glyph: string; label: string; desc: string }> = [
  { t: "line", glyph: "▭", label: "line", desc: "single-line input" },
  { t: "text", glyph: "▤", label: "text", desc: "multi-line block" },
  { t: "toggle", glyph: "◉", label: "toggle", desc: "on / off switch" },
  { t: "number", glyph: "#", label: "number", desc: "numeric input" },
];

function FieldForge({ tab }: { tab: string }) {
  const os = useOS();
  const cms = useCMS();
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<FieldType>("line");
  const [label, setLabel] = useState("");
  const fields = cms.customFields[tab] ?? [];

  const commit = () => {
    if (!label.trim()) { os.toast("FIELD NEEDS A LABEL"); return; }
    cms.addField(tab, type, label.trim());
    setLabel(""); setAdding(false);
    os.toast(`FORM FIELD ADDED TO [${tab.toUpperCase()}]`);
  };

  return (
    <>
      <SectionHead>{`custom forms · ${tab}`}</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        append your own controls to this tab — one-line inputs, text blocks, toggles, numbers.
        values are stored with the content{cms.mode === "root" ? " and persist" : " (demo: reset on refresh)"}.
      </p>
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f.id} className="border border-[var(--line2)] bg-[var(--panel2)] p-2">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--acc)]">{f.label}</span>
              <span className="border border-[var(--line)] px-1 text-[8px] uppercase tracking-widest text-[var(--faint)]">{f.type}</span>
              <button onClick={() => cms.removeField(tab, f.id)} className="ml-auto text-[9px] text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="remove field">✕</button>
            </div>
            {f.type === "line" && (
              <input value={f.value as string} onChange={(e) => cms.setFieldValue(tab, f.id, e.target.value)} className={`${inputCls} bg-[var(--bg2)]`} placeholder="type here…" />
            )}
            {f.type === "text" && (
              <textarea value={f.value as string} onChange={(e) => cms.setFieldValue(tab, f.id, e.target.value)} rows={3} className="w-full resize-y border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 font-mono2 text-[11px] leading-relaxed text-[var(--txt)] outline-none focus:border-[var(--acc)]" placeholder="multi-line text block…" />
            )}
            {f.type === "toggle" && (
              <div className="flex items-center gap-2">
                <Toggle on={f.value === true} onToggle={() => cms.setFieldValue(tab, f.id, !(f.value === true))} />
                <span className={`text-[9px] uppercase tracking-widest ${f.value ? "text-[var(--acc)]" : "text-[var(--faint)]"}`}>{f.value ? "enabled" : "disabled"}</span>
              </div>
            )}
            {f.type === "number" && (
              <input type="number" value={f.value as string} onChange={(e) => cms.setFieldValue(tab, f.id, e.target.value)} className="w-28 border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 font-mono2 text-[11px] text-[var(--txt)] outline-none focus:border-[var(--acc)]" />
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-2 border border-[var(--acc)] bg-[var(--acc-dim)] p-2.5">
          <div className="mb-2 grid grid-cols-4 gap-1.5">
            {FIELD_TYPES.map((ft) => (
              <button key={ft.t} onClick={() => setType(ft.t)} title={ft.desc}
                className={`border px-1 py-1.5 text-center transition-colors ${type === ft.t ? "border-[var(--acc)] bg-[var(--panel)] text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)]"}`}>
                <span className="block text-[13px] leading-none">{ft.glyph}</span>
                <span className="mt-1 block text-[8px] uppercase tracking-widest">{ft.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commit()}
              placeholder="field label, e.g. favourite editor" autoFocus className={`min-w-0 flex-1 ${inputCls} bg-[var(--bg2)]`} />
            <button onClick={commit} className="border border-[var(--acc)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--acc)]">ok</button>
            <button onClick={() => setAdding(false)} className="border border-[var(--line2)] px-2.5 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)]">✕</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className={addBtn}>+ add form field</button>
      )}
    </>
  );
}

export default function CmsWin() {
  const cms = useCMS();
  return cms.mode === "guest" ? <Login /> : <Panel />;
}

/* ————— login: follow the white rabbit ————— */
function Login() {
  const os = useOS();
  const cms = useCMS();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(0);
  const [checking, setChecking] = useState(false);

  const submit = () => {
    if (!user || !pass) { setErr((e) => e + 1); return; }
    setChecking(true);
    window.setTimeout(() => {
      const m = cms.login(user.trim(), pass);
      setChecking(false);
      if (!m) { setErr((e) => e + 1); setPass(""); os.toast("ACCESS DENIED — INVALID CREDENTIALS"); }
      else os.toast(m === "root" ? "ROOT ACCESS GRANTED — EDITS PERSIST" : "DEMO MODE — EDITS RESET ON REFRESH");
    }, 550);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 py-5 font-mono2 text-[11.5px]">
      <div className="flex flex-col items-start gap-5 md:flex-row">
        <pre className="shrink-0 text-[9px] leading-[1.2] text-[var(--acc)]" style={{ textShadow: "0 0 12px var(--acc-glow)" }}>{RABBIT_ART}</pre>
        <div className="min-w-0">
          <div className="font-disp text-3xl leading-none tracking-wide text-[var(--txt)]">
            FOLLOW THE <span className="text-[var(--acc)]">WHITE RABBIT</span>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--dim)]">
            This terminal controls the content of the whole OS. Knock, knock — authenticate to enter the content matrix.
          </p>
          <div className="mt-3 border border-[var(--line2)] bg-[var(--panel2)] p-2.5 text-[10px] leading-relaxed">
            <div className="text-[9px] uppercase tracking-[0.24em] text-[var(--faint)]">guest access (demo)</div>
            <div className="mt-1">login <span className="text-[var(--acc)]">admin</span> · pass <span className="text-[var(--acc)]">qwerty123</span></div>
            <div className="mt-0.5 text-[var(--faint)]">demo edits apply instantly but vanish on refresh. root credentials are not for tourists.</div>
          </div>
        </div>
      </div>

      <div key={err} className={`mt-5 max-w-md ${err ? "shake" : ""}`}>
        <div className="grid grid-cols-[64px_1fr] items-center gap-x-3 gap-y-2">
          <span className="text-right text-[10px] uppercase tracking-widest text-[var(--faint)]">login</span>
          <input value={user} onChange={(e) => setUser(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} autoFocus spellCheck={false}
            className="border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 text-[12px] text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]" placeholder="admin" />
          <span className="text-right text-[10px] uppercase tracking-widest text-[var(--faint)]">pass</span>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            className="border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 text-[12px] text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]" placeholder="••••••••" />
        </div>
        {err > 0 && (
          <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--red)]">
            ✗ access denied — {err} failed attempt{err > 1 ? "s" : ""}. the rabbit is not impressed.
          </div>
        )}
        <button onClick={submit} disabled={checking}
          className="frow mt-3 border border-[var(--acc)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--acc)] disabled:opacity-50">
          {checking ? "▮ checking…" : "▸ authenticate"}
        </button>
      </div>
    </div>
  );
}

/* ————— admin panel with per-window tabs ————— */
const TABS = [
  { id: "profile", glyph: "▤", label: "about" },
  { id: "projects", glyph: "▦", label: "projects" },
  { id: "widgets", glyph: "◱", label: "widgets" },
  { id: "playlist", glyph: "♪", label: "playlist" },
  { id: "arts", glyph: "▒", label: "ascii arts" },
  { id: "blog", glyph: "≣", label: "blog" },
  { id: "desktop", glyph: "⌗", label: "desktop" },
  { id: "theme", glyph: "◍", label: "theme" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function Panel() {
  const os = useOS();
  const cms = useCMS();
  const [tab, setTab] = useState<TabId>("profile");
  const isRoot = cms.mode === "root";

  return (
    <div className="flex h-full flex-col font-mono2 text-[11.5px]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--panel2)] px-4 py-2">
        <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] ${isRoot ? "border-[var(--red)] text-[var(--red)]" : "border-[var(--amber)] text-[var(--amber)] badge-blink"}`}>
          {isRoot ? "● root" : "● demo"}
        </span>
        <span className="text-[10px] text-[var(--dim)]">user: <span className="text-[var(--txt)]">{cms.sessionUser}</span></span>
        <span className="ml-auto text-[9px] uppercase tracking-widest text-[var(--faint)]">{isRoot ? "writes → localStorage" : "writes → memory only"}</span>
        <button onClick={() => { cms.logout(); os.toast("SESSION CLOSED — BACK TO GUEST MODE"); }}
          className="border border-[var(--line2)] px-2 py-0.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">
          logout
        </button>
      </div>

      {!isRoot && (
        <div className="border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--amber)_7%,transparent)] px-4 py-1.5 text-[9.5px] text-[var(--amber)]">
          ⚠ demo mode — changes apply live, page refresh restores defaults.
        </div>
      )}
      {isRoot && cms.persistError && (
        <div className="border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--red)_8%,transparent)] px-4 py-1.5 text-[9.5px] text-[var(--red)]">
          ⚠ localStorage quota hit (large media?) — latest changes live in memory only.
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-[var(--line)] bg-[var(--panel2)] px-3 py-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 border px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.18em] transition-colors ${tab === t.id ? "border-[var(--acc)] bg-[var(--acc-dim)] font-bold text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)] hover:text-[var(--txt)]"}`}>
            <span className="mr-1.5">{t.glyph}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "profile" && <ProfileTab />}
        {tab === "projects" && <ProjectsTab />}
        {tab === "widgets" && <WidgetsTab />}
        {tab === "blog" && <BlogTab />}
        {tab === "desktop" && <DesktopTab />}
        {tab === "playlist" && <PlaylistTab />}
        {tab === "arts" && <ArtsTab />}
        {tab === "theme" && <ThemeTab />}
      </div>

      <div className="border-t border-[var(--line)] bg-[var(--panel2)] px-4 py-1.5 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">
        cms.sys v3.0 · edits propagate instantly to the whole OS
      </div>
    </div>
  );
}

/* ————— tab: about / profile ————— */
function ProfileTab() {
  const os = useOS();
  const cms = useCMS();
  const [f, setF] = useState<CmsProfile>({ ...cms.profile, contacts: cms.profile.contacts.map((c) => ({ ...c })) });
  const [nu, setNu] = useState("");
  const [np, setNp] = useState("");
  const isRoot = cms.mode === "root";
  const set = (k: keyof CmsProfile) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const toast = () => os.toast(isRoot ? "CONTENT DEPLOYED — PERSISTED TO DISK" : "CONTENT DEPLOYED (DEMO — RESETS ON REFRESH)");
  const setContact = (i: number, patch: Partial<{ label: string; value: string }>) =>
    setF((p) => ({ ...p, contacts: p.contacts.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));

  return (
    <div>
      <SectionHead>identity</SectionHead>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="display name" value={f.name} onChange={set("name")} />
        <Field label="role / title" value={f.role} onChange={set("role")} />
        <Field label="handle / email" value={f.handle} onChange={set("handle")} />
        <Field label="location" value={f.location} onChange={set("location")} />
        <Field label="experience line" value={f.expLine} onChange={set("expLine")} />
        <Field label="status line" value={f.statusLine} onChange={set("statusLine")} />
      </div>

      <SectionHead>voice</SectionHead>
      <div className="grid gap-3">
        <Field label="availability" value={f.availability} onChange={set("availability")} />
        <Field label="bio (about.txt + dossier)" value={f.bio} onChange={set("bio")} wide />
      </div>

      <SectionHead>uplinks · contacts & sites</SectionHead>
      <div className="space-y-2">
        {f.contacts.map((c, i) => (
          <div key={c.id} className="grid grid-cols-[88px_1fr_22px] items-center gap-2">
            <input value={c.label} onChange={(e) => setContact(i, { label: e.target.value })} className={inputCls} />
            <input value={c.value} onChange={(e) => setContact(i, { value: e.target.value })} className={inputCls} placeholder="url, @handle or email" />
            <button onClick={() => setF((p) => ({ ...p, contacts: p.contacts.filter((_, j) => j !== i) }))}
              className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="remove uplink">✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => setF((p) => ({ ...p, contacts: [...p.contacts, { id: `c-${Date.now().toString(36)}`, label: "site", value: "https://" }] }))} className={addBtn}>
        + add uplink
      </button>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => { cms.updateContent({ profile: f }); toast(); }} className={deployBtn}>▸ deploy changes</button>
        <button onClick={() => setF({ ...cms.profile, contacts: cms.profile.contacts.map((c) => ({ ...c })) })} className={ghostBtn}>revert</button>
      </div>

      <FieldForge tab="about" />

      {isRoot && (
        <>
          <SectionHead>root · credentials</SectionHead>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="new login" value={nu} onChange={setNu} />
            <Field label="new password" value={np} onChange={setNp} />
          </div>
          <button
            onClick={() => {
              if (nu.trim().length < 3 || np.length < 6) { os.toast("CREDENTIALS TOO SHORT — LOGIN ≥3, PASS ≥6"); return; }
              cms.saveCreds(nu.trim(), np); setNu(""); setNp("");
              os.toast("ROOT CREDENTIALS ROTATED");
            }}
            className="mt-2 border border-[var(--line2)] px-3 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]">
            rotate credentials
          </button>

          <SectionHead>root · danger zone</SectionHead>
          <button
            onClick={() => { cms.resetContent(); setF({ ...DEFAULT_CONTENT.profile, contacts: DEFAULT_CONTENT.profile.contacts.map((c) => ({ ...c })) }); os.toast("ALL CONTENT FACTORY-RESET"); }}
            className="border border-[var(--red)] px-3 py-1 text-[9px] uppercase tracking-widest text-[var(--red)] transition-colors hover:bg-[color-mix(in_srgb,var(--red)_12%,transparent)]">
            ⚠ reset all content (profile · projects · widgets · playlist · arts · forms · theme)
          </button>
        </>
      )}
    </div>
  );
}

/* ————— shared project template form ————— */
function ProjectForm({ p, onDeleted }: { p: CmsProject; onDeleted: () => void }) {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const [uploading, setUploading] = useState(false);
  const patch = (patch: Partial<CmsProject>) =>
    cms.updateContent({ projects: cms.projects.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) });
  const setMetric = (i: number, key: "value" | "label", v: string) =>
    patch({ metrics: p.metrics.map((m, j) => (j === i ? { ...m, [key]: v } : m)) });
  const toast = () => os.toast(isRoot ? "PROJECT DEPLOYED — PERSISTED" : "PROJECT DEPLOYED (DEMO — RESETS ON REFRESH)");

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const room = 6 - (p.gallery?.length ?? 0);
    const files = Array.from(e.target.files ?? []).slice(0, Math.max(0, room));
    e.target.value = "";
    if (!files.length) { if (room <= 0) os.toast("GALLERY FULL — 6 PHOTOS MAX"); return; }
    setUploading(true);
    const urls: string[] = [];
    for (const f of files) { try { urls.push(await fileToDataUrl(f)); } catch { /* skip broken file */ } }
    patch({ gallery: [...(p.gallery ?? []), ...urls] });
    setUploading(false);
    os.toast(`${urls.length} PHOTO(S) DEVELOPED INTO GALLERY`);
  };

  return (
    <div>
      <SectionHead>{`template · editing ${p.id}/`}</SectionHead>
      <p className="mb-2 text-[9.5px] text-[var(--faint)]">one shared schema for every project — what you deploy here rewrites the explorer, viewer and terminal instantly.</p>

      {p.image && (
        <div className="img-scan mb-3 overflow-hidden border border-[var(--line2)]">
          <img src={p.image} alt={p.title} className="max-h-36 w-full object-cover" />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="title" value={p.title} onChange={(v) => patch({ title: v })} />
        <Field label="category" value={p.category} onChange={(v) => patch({ category: v })} />
        <Field label="year" value={p.year} onChange={(v) => patch({ year: v })} />
        <Field label="role" value={p.role} onChange={(v) => patch({ role: v })} />
        <Field label="project link (live / repo)" value={p.link} onChange={(v) => patch({ link: v })} placeholder="https://…" />
        <Field label="cover image url" value={p.image} onChange={(v) => patch({ image: v })} placeholder="https://…/shot.png" />
        <Field label="summary" value={p.summary} onChange={(v) => patch({ summary: v })} wide />
        <Field label="stack (comma separated)" value={p.stack.join(", ")} onChange={(v) => patch({ stack: v.split(",").map((s) => s.trim()).filter(Boolean) })} wide />
      </div>

      <div className="mt-3">
        <span className="mb-1.5 block font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">metrics (value · label)</span>
        <div className="grid grid-cols-3 gap-2">
          {p.metrics.map((m, i) => (
            <div key={i} className="space-y-1.5">
              <input value={m.value} onChange={(e) => setMetric(i, "value", e.target.value)} className="w-full border border-[var(--line2)] bg-[var(--panel2)] px-2 py-1 text-[11px] text-[var(--acc)] outline-none focus:border-[var(--acc)]" />
              <input value={m.label} onChange={(e) => setMetric(i, "label", e.target.value)} className="w-full border border-[var(--line2)] bg-[var(--panel2)] px-2 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] outline-none focus:border-[var(--acc)]" />
            </div>
          ))}
        </div>
      </div>

      <SectionHead>photo gallery · slider on the viewer</SectionHead>
      <div className="flex flex-wrap gap-2">
        {(p.gallery ?? []).map((g, i) => (
          <div key={i} className="group relative h-16 w-24 overflow-hidden border border-[var(--line2)]">
            <img src={g} alt={`${p.id} gallery ${i + 1}`} className="h-full w-full object-cover" />
            <button
              onClick={() => patch({ gallery: (p.gallery ?? []).filter((_, j) => j !== i) })}
              className="absolute right-0.5 top-0.5 hidden bg-[rgba(0,0,0,0.7)] px-1 text-[9px] text-[var(--red)] group-hover:block"
              title="remove photo">✕</button>
            <span className="absolute bottom-0.5 left-1 text-[8px] text-[var(--txt)]" style={{ textShadow: "0 1px 2px #000" }}>{i + 1}</span>
          </div>
        ))}
        <label className={`grid h-16 w-24 cursor-pointer place-items-center border border-dashed border-[var(--line2)] font-mono2 text-[9px] uppercase tracking-widest text-[var(--faint)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)] ${uploading ? "opacity-50" : ""}`}>
          {uploading ? "dev…" : "+ photos"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </label>
      </div>
      <p className="mt-1.5 text-[8.5px] text-[var(--faint)]">images are downscaled + compressed in-browser · 6 max · shown as a fullscreen-capable slider in the viewer window.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={toast} className={deployBtn}>▸ deploy project</button>
        {cms.projects.length > 1 && (
          <button
            onClick={() => { cms.removeProject(p.id); onDeleted(); os.toast(`PROJECT ${p.id}/ DELETED`); }}
            className="border border-[var(--red)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--red)] transition-colors hover:bg-[color-mix(in_srgb,var(--red)_12%,transparent)]">
            ✕ delete project
          </button>
        )}
      </div>
    </div>
  );
}

/* ————— tab: projects (chips + trailing "+" tab) ————— */
function ProjectsTab() {
  const os = useOS();
  const cms = useCMS();
  const [sel, setSel] = useState(cms.projects[0]?.id ?? "");
  const p = cms.projects.find((x) => x.id === sel);

  const addNew = () => {
    const id = cms.addProject();
    setSel(id);
    os.toast("NEW PROJECT APPENDED — SAME TEMPLATE, YOUR CONTENT");
  };

  return (
    <div>
      <SectionHead>project registry</SectionHead>
      <div className="flex flex-wrap items-center gap-1.5">
        {cms.projects.map((x) => (
          <button key={x.id} onClick={() => setSel(x.id)}
            className={`shrink-0 border px-2.5 py-1.5 text-[10px] transition-colors ${x.id === sel ? "border-[var(--acc)] bg-[var(--acc-dim)] font-bold text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)] hover:text-[var(--txt)]"}`}>
            {x.id}/
          </button>
        ))}
        <button onClick={addNew} title="add project — opens the shared template"
          className="shrink-0 border border-dashed border-[var(--line2)] px-3 py-1.5 text-[12px] font-bold leading-none text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:bg-[var(--acc-dim)] hover:text-[var(--acc)]">
          +
        </button>
      </div>

      {p ? (
        <ProjectForm key={p.id} p={p} onDeleted={() => setSel(cms.projects.find((x) => x.id !== p.id)?.id ?? "")} />
      ) : (
        <button onClick={addNew} className={addBtn}>+ add the first project</button>
      )}

      <FieldForge tab="projects" />
    </div>
  );
}

/* ————— tab: widgets (layout + video source) ————— */
const WIDGET_META: Record<WidgetId, { glyph: string; name: string; desc: string }> = {
  operator: { glyph: "▤", name: "operator.json", desc: "identity card + skill bars" },
  player: { glyph: "♪", name: "now_playing.d", desc: "bg music queue — mp3 plays for real" },
  git: { glyph: "▦", name: "git activity", desc: "commit heatmap" },
  sysmon: { glyph: "◍", name: "sysmon", desc: "cpu / mem / net graphs" },
  video: { glyph: "▶", name: "video.d", desc: "media player widget" },
  chat: { glyph: "✉", name: "chat.sys", desc: "visitor message → your inbox" },
  oracle: { glyph: "◬", name: "oracle.sys", desc: "ask the machine" },
};

function WidgetsTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const toast = () => os.toast(isRoot ? "WIDGET LAYOUT DEPLOYED — PERSISTED" : "WIDGET LAYOUT DEPLOYED (DEMO — RESETS ON REFRESH)");

  const onVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) os.toast("⚠ LARGE FILE — MAY NOT PERSIST AFTER REFRESH");
    const r = new FileReader();
    r.onload = () => {
      cms.updateContent({ videoSrc: String(r.result), videoName: f.name });
      os.toast(`VIDEO LOADED INTO video.d → ${f.name}`);
    };
    r.readAsDataURL(f);
  };

  const onOperatorMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type.startsWith("image/")) {
      try {
        const data = await downscaleImage(f, 512, 0.85);
        cms.updateContent({ operator: { media: data, kind: "image", name: f.name } });
        os.toast(`OPERATOR PORTRAIT MOUNTED → ${f.name}`);
      } catch {
        os.toast("COULD NOT READ IMAGE");
      }
      return;
    }
    if (f.type.startsWith("video/")) {
      if (f.size > 8 * 1024 * 1024) os.toast("⚠ LARGE CLIP — MAY NOT PERSIST AFTER REFRESH");
      const r = new FileReader();
      r.onload = () => {
        cms.updateContent({ operator: { media: String(r.result), kind: "video", name: f.name } });
        os.toast(`OPERATOR FEED MOUNTED → ${f.name} (loops muted)`);
      };
      r.readAsDataURL(f);
      return;
    }
    os.toast("ONLY IMAGE OR VIDEO FILES");
  };

  return (
    <div>
      <SectionHead>desktop layout · order / dock / visibility</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        ▲▼ sets stacking order · <span className="text-[var(--acc)]">◧/◨</span> pins the widget to the left or right rail ·{" "}
        <span className="text-[var(--acc)]">▲</span> docks it to the top strip (left → right) · toggle hides it.
        rails render on wide screens (≥1280px).
      </p>
      <div className="space-y-1.5">
        {cms.widgetCfg.map((w, i) => {
          const meta = WIDGET_META[w.id];
          return (
            <div key={w.id} className={`flex items-center gap-2 border p-2 transition-colors ${w.enabled ? "border-[var(--line2)]" : "border-[var(--line)] opacity-50"}`}>
              <span className="w-5 text-center text-[11px] text-[var(--acc)]">{meta.glyph}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] font-bold text-[var(--txt)]">{meta.name}</div>
                <div className="truncate text-[8.5px] uppercase tracking-widest text-[var(--faint)]">{meta.desc}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => cms.setWidget(w.id, { dock: "left" })}
                  className={`pbtn ${w.dock === "left" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="pin to left rail">◧</button>
                <button onClick={() => cms.setWidget(w.id, { dock: "right" })}
                  className={`pbtn ${w.dock === "right" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="pin to right rail">◨</button>
                <button onClick={() => cms.setWidget(w.id, { dock: "top" })}
                  className={`pbtn ${w.dock === "top" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="dock to top strip (left → right)">▲</button>
                <button onClick={() => cms.moveWidget(i, -1)} className="pbtn" title="earlier in order">▲</button>
                <button onClick={() => cms.moveWidget(i, 1)} className="pbtn" title="later in order">▼</button>
                <Toggle on={w.enabled} onToggle={() => cms.setWidget(w.id, { enabled: !w.enabled })} />
              </div>
            </div>
          );
        })}
      </div>

      <SectionHead>video.d · media source</SectionHead>
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer border border-[var(--line2)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
          ▸ upload video / audio file
          <input type="file" accept="video/*,audio/*" className="hidden" onChange={onVideo} />
        </label>
        {cms.videoSrc && (
          <>
            <span className="max-w-52 truncate text-[10px] text-[var(--acc)]">{cms.videoName || "clip"}</span>
            <button onClick={() => cms.updateContent({ videoSrc: "", videoName: "" })}
              className="border border-[var(--line2)] px-2 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">
              eject
            </button>
          </>
        )}
        {!cms.videoSrc && <span className="text-[9.5px] text-[var(--faint)]">nothing mounted — widget shows static.</span>}
      </div>

      <SectionHead>operator.json · photo / video feed</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        mount your own photo or a looping clip onto the operator card — it replaces the default portrait
        and gets re-tinted with the active phosphor theme.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer border border-[var(--line2)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
          ▸ upload photo / video
          <input type="file" accept="image/*,video/*" className="hidden" onChange={onOperatorMedia} />
        </label>
        {cms.operator.media ? (
          <>
            <span className="flex items-center gap-2 border border-[var(--line2)] px-2 py-1">
              {cms.operator.kind === "video" ? (
                <video src={cms.operator.media} className="h-8 w-8 object-cover" muted loop autoPlay playsInline />
              ) : (
                <img src={cms.operator.media} alt="operator media" className="avatar-img h-8 w-8 object-cover" />
              )}
              <span className="max-w-40 truncate text-[9px] text-[var(--acc)]">{cms.operator.name || cms.operator.kind}</span>
            </span>
            <button onClick={() => cms.updateContent({ operator: { media: null, kind: "image", name: "" } })}
              className="border border-[var(--line2)] px-2 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">
              eject → default portrait
            </button>
          </>
        ) : (
          <span className="text-[9.5px] text-[var(--faint)]">default portrait mounted.</span>
        )}
      </div>

      <SectionHead>chat.sys · delivery</SectionHead>
      <p className="text-[9.5px] leading-relaxed text-[var(--faint)]">
        visitor messages are handed off to the mail client addressed to{" "}
        <span className="text-[var(--acc)]">{cms.profile.handle}</span> with the visitor's email as reply-to.
        change the inbox in the <span className="text-[var(--txt)]">about</span> tab.
      </p>

      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy widget layout</button>
      </div>

      <FieldForge tab="widgets" />
    </div>
  );
}

/* ————— tab: playlist ————— */
function PlaylistTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const toast = () => os.toast(isRoot ? "PLAYLIST DEPLOYED — PERSISTED" : "PLAYLIST DEPLOYED (DEMO — RESETS ON REFRESH)");
  const setTrack = (i: number, patch: Partial<CmsTrack>) =>
    cms.updateContent({ tracks: cms.tracks.map((t, j) => (j === i ? { ...t, ...patch } : t)) });

  const onAudio = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) os.toast("⚠ LARGE FILE — MAY NOT PERSIST AFTER REFRESH");
    const r = new FileReader();
    r.onload = () => {
      setTrack(i, { src: String(r.result), fileName: f.name });
      os.toast(`AUDIO MOUNTED → ${f.name} (plays with real sound)`);
    };
    r.readAsDataURL(f);
  };

  return (
    <div>
      <SectionHead>now_playing.d queue</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        mount an <span className="text-[var(--acc)]">mp3 / ogg / wav / m4a</span> per track and the desktop player
        will actually play it — with seek, progress and auto-advance. tracks without a file stay simulated.
      </p>
      <div className="space-y-2">
        {cms.tracks.map((t, i) => (
          <div key={i} className="border border-[var(--line2)] p-2">
            <div className="grid grid-cols-[20px_1fr_1fr_64px_22px] items-center gap-2">
              <span className="text-center text-[9px] text-[var(--faint)]">{String(i + 1).padStart(2, "0")}</span>
              <input value={t.t} onChange={(e) => setTrack(i, { t: e.target.value })} placeholder="track" className={`min-w-0 ${inputCls}`} />
              <input value={t.a} onChange={(e) => setTrack(i, { a: e.target.value })} placeholder="artist" className={`min-w-0 ${inputCls}`} />
              <input type="number" min={10} value={t.d} onChange={(e) => setTrack(i, { d: Math.max(10, Number(e.target.value) || 10) })}
                className={inputCls} title="simulated duration, seconds (ignored when audio mounted)" />
              <button onClick={() => cms.removeTrack(i)} className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="remove track">✕</button>
            </div>
            <div className="mt-1.5 flex items-center gap-2 pl-7">
              <label className="cursor-pointer border border-[var(--line2)] px-2 py-0.5 text-[8.5px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
                ♪ mount audio
                <input type="file" accept="audio/*,video/*" className="hidden" onChange={onAudio(i)} />
              </label>
              {t.src ? (
                <>
                  <span className="max-w-48 truncate text-[9px] text-[var(--acc)]">▸ {t.fileName || "audio mounted"}</span>
                  <button onClick={() => setTrack(i, { src: undefined, fileName: undefined })}
                    className="text-[8.5px] uppercase tracking-widest text-[var(--faint)] transition-colors hover:text-[var(--red)]">eject</button>
                </>
              ) : (
                <span className="text-[9px] text-[var(--faint)]">simulated · {t.d}s</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => cms.addTrack()} className={addBtn}>+ add track</button>
      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy playlist</button>
      </div>

      <FieldForge tab="playlist" />
    </div>
  );
}

/* ————— ascii art editor (clipboard-friendly) ————— */
function ArtEditor({ onSave, onClose }: { onSave: (name: string, rows: string[]) => void; onClose: () => void }) {
  const os = useOS();
  const [name, setName] = useState("my_art");
  const [text, setText] = useState("");

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) { setText(t); os.toast("CLIPBOARD ABSORBED"); return; }
      os.toast("CLIPBOARD EMPTY");
    } catch {
      os.toast("CLIPBOARD BLOCKED — PASTE WITH CTRL+V");
    }
  };

  const save = () => {
    const rows = text.replace(/\s+$/, "").split("\n");
    if (!rows.some((r) => r.trim())) { os.toast("EDITOR IS EMPTY — PASTE SOME GLYPHS"); return; }
    onSave(name, rows.slice(0, 24));
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[rgba(2,5,3,0.88)] p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="crt-in w-full max-w-4xl border border-[var(--acc)] bg-[var(--panel)] shadow-[0_30px_90px_rgba(0,0,0,0.7)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--panel2)] px-3 py-2 font-mono2">
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--acc)]">▒ ascii editor</span>
          <input value={name} onChange={(e) => setName(e.target.value)} spellCheck={false}
            className="w-36 border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 text-[10.5px] text-[var(--txt)] outline-none focus:border-[var(--acc)]" placeholder="art name" />
          <button onClick={paste} className="ml-auto border border-[var(--line2)] px-2.5 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
            ⧉ paste from clipboard
          </button>
          <button onClick={onClose} className="border border-[var(--line2)] px-2.5 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">esc · close</button>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-[var(--line)] md:border-b-0 md:border-r">
            <div className="px-3 py-1.5 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">input · formatted text ok</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              autoFocus
              rows={16}
              placeholder={"paste your art here — ctrl+v works.\nmonospace glyphs, box drawing, block chars:\n\n  ███▄▄  \n  █░░░█  \n  ▀█▄█▀  "}
              className="h-[340px] w-full resize-none bg-[var(--bg2)] px-3 py-2 font-mono2 text-[11px] leading-[1.3] text-[var(--acc)] outline-none"
            />
          </div>
          <div>
            <div className="px-3 py-1.5 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">live preview · phosphor</div>
            <div className="grid h-[340px] place-items-center overflow-auto bg-[var(--bg)] p-4">
              <pre className="max-w-full text-[11px] leading-[1.25] text-[var(--acc)]" style={{ textShadow: "0 0 12px var(--acc-glow)" }}>
                {text || "· awaiting glyphs ·"}
              </pre>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-[var(--line)] bg-[var(--panel2)] px-3 py-2 font-mono2">
          <span className="text-[8.5px] uppercase tracking-widest text-[var(--faint)]">{text ? `${text.split("\n").length} rows · ${text.length} chars · max 24 rows kept` : "empty"}</span>
          <button onClick={save} className="ml-auto border border-[var(--acc)] bg-[var(--acc-dim)] px-4 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.22em] text-[var(--acc)]">
            ▸ save to queue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ————— tab: ascii arts ————— */
const rowsOf = (a: CmsArt): string[] => a.rows ?? ARTS.find((d) => d.id === a.id)?.rows ?? [];

function MiniArt({ rows }: { rows: string[] }) {
  return (
    <pre className="w-20 shrink-0 overflow-hidden border border-[var(--line)] bg-[var(--bg2)] p-1 text-center text-[4px] leading-[1.15] text-[var(--acc)]">
      {rows.slice(0, 10).join("\n") || "· empty ·"}
    </pre>
  );
}

function ArtsTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const [editor, setEditor] = useState(false);
  const arts = cms.arts;
  const enabledCount = arts.filter((a) => a.enabled).length;

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= arts.length) return;
    const next = [...arts];
    [next[i], next[j]] = [next[j], next[i]];
    cms.updateContent({ arts: next });
  };
  const setAll = (enabled: boolean) => cms.updateContent({ arts: arts.map((a) => ({ ...a, enabled })) });
  const toast = () => os.toast(isRoot ? "ART QUEUE DEPLOYED — PERSISTED" : "ART QUEUE DEPLOYED (DEMO — RESETS ON REFRESH)");

  return (
    <div>
      <SectionHead>idle-rain art queue</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        when the cursor idles over the desktop, the rain assembles these — top of the list shows first, cycling downward.{" "}
        <span className="text-[var(--acc)]">{enabledCount}/{arts.length} armed</span> · leave your cursor still to preview.
      </p>

      <div className="space-y-1.5">
        {arts.map((a, i) => {
          const isCustom = !!a.rows;
          return (
            <div key={a.id} data-art={a.id} className={`border p-2 transition-colors ${a.enabled ? "border-[var(--line2)]" : "border-[var(--line)] opacity-50"}`}>
              <div className="flex items-center gap-2">
                <span className="w-6 text-center text-[9px] font-bold text-[var(--acc)]">{String(i + 1).padStart(2, "0")}</span>
                <MiniArt rows={rowsOf(a)} />
                <div className="min-w-0 flex-1">
                  {isCustom ? (
                    <input value={a.name} onChange={(e) => cms.setArt(a.id, { name: e.target.value })}
                      className="w-full border border-transparent bg-transparent px-1 py-0.5 text-[10.5px] font-bold text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)] focus:bg-[var(--panel2)]" />
                  ) : (
                    <div className="truncate px-1 text-[10.5px] font-bold text-[var(--txt)]">{a.name}</div>
                  )}
                  <div className="px-1 text-[8.5px] uppercase tracking-widest text-[var(--faint)]">
                    {isCustom ? "custom · editable" : "built-in"} · {rowsOf(a).length} rows · prio {i + 1}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, -1)} className="pbtn" title="higher priority">▲</button>
                  <button onClick={() => move(i, 1)} className="pbtn" title="lower priority">▼</button>
                  <Toggle on={a.enabled} onToggle={() => cms.setArt(a.id, { enabled: !a.enabled })} />
                  {isCustom && (
                    <button onClick={() => { cms.removeArt(a.id); os.toast(`ART '${a.name}' DELETED`); }}
                      className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="delete custom art">✕</button>
                  )}
                </div>
              </div>
              {isCustom && (
                <textarea
                  value={(a.rows ?? []).join("\n")}
                  onChange={(e) => cms.setArt(a.id, { rows: e.target.value.split("\n").slice(0, 24) })}
                  rows={Math.min(8, Math.max(3, (a.rows ?? []).length))}
                  spellCheck={false}
                  className="mt-2 w-full resize-y border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 font-mono2 text-[10px] leading-[1.25] text-[var(--acc)] outline-none focus:border-[var(--acc)]"
                  placeholder={"paste your ascii art here…\nuse █ ▄ ▀ ░ ▒ # @ or plain text"}
                />
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => setEditor(true)} className={addBtn}>+ add custom ascii art (editor)</button>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setAll(true)} className={ghostBtn}>enable all</button>
        <button onClick={() => setAll(false)} className={ghostBtn}>disable all</button>
        <button onClick={toast} className={deployBtn}>▸ deploy art queue</button>
      </div>

      <FieldForge tab="ascii arts" />

      {editor && (
        <ArtEditor
          onClose={() => setEditor(false)}
          onSave={(name, rows) => {
            const id = cms.addArt(name, rows);
            setEditor(false);
            os.toast(`ART '${name}' ARMED AT PRIORITY 01`);
            window.setTimeout(() => {
              document.querySelector(`[data-art="${id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }, 80);
          }}
        />
      )}
    </div>
  );
}

/* ————— tab: blog ————— */
function BlogTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<CmsPost | null>(null);
  const toast = () => os.toast(isRoot ? "BLOG DEPLOYED — PERSISTED" : "BLOG DEPLOYED (DEMO — RESETS ON REFRESH)");

  const startEdit = (p: CmsPost) => { setEditing(p.id); setDraft({ ...p, tags: [...p.tags], images: [...p.images] }); };
  const startNew = () => {
    const id = cms.addPost();
    const date = new Date().toISOString().slice(0, 10);
    const body = cms.blog.template
      .split("{{title}}").join("untitled_post")
      .split("{{date}}").join(date)
      .split("{{tags}}").join("misc");
    setEditing(id);
    setDraft({ id, title: "untitled_post", date, tags: ["misc"], body, images: [] });
    os.toast("NEW POST CREATED FROM TEMPLATE");
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || !draft) return;
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, 6 - draft.images.length)) {
      if (!f.type.startsWith("image/")) continue;
      try { urls.push(await downscaleImage(f, 1024, 0.8)); } catch { /* skip */ }
    }
    if (urls.length) setDraft((d) => (d ? { ...d, images: [...d.images, ...urls] } : d));
    if (urls.length) os.toast(`${urls.length} IMAGE(S) MOUNTED INTO POST`);
  };

  const onUploadText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const text = String(r.result ?? "");
      const title = f.name.replace(/\.(md|txt|text)$/i, "").replace(/\s+/g, "_");
      const id = `post_${Date.now().toString(36)}`;
      const date = new Date().toISOString().slice(0, 10);
      const post: CmsPost = { id, title, date, tags: ["imported"], body: text, images: [] };
      /* one atomic update — addPost + setPost in sequence would race the closure */
      cms.updateContent({ blog: { ...cms.blog, posts: [post, ...cms.blog.posts] } });
      setEditing(id);
      setDraft(post);
      os.toast(`IMPORTED → ${title}.md`);
    };
    r.readAsText(f);
  };

  const saveDraft = () => {
    if (!draft) return;
    cms.setPost(draft.id, { ...draft });
    setEditing(null);
    setDraft(null);
    toast();
  };

  return (
    <div>
      <SectionHead>formatting template</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        applied to every new post. markers: <span className="text-[var(--acc)]">{"{{title}} {{date}} {{tags}}"}</span> are
        substituted on creation · <span className="text-[var(--acc)]">![0]…![5]</span> mount gallery images ·{" "}
        <span className="text-[var(--acc)]">{"{{form}}"}</span> embeds a visitor feedback form ·{" "}
        <span className="text-[var(--acc)]"># ## &gt; - --- **bold** `code`</span> render as markdown.
      </p>
      <textarea
        value={cms.blog.template}
        onChange={(e) => cms.updateContent({ blog: { ...cms.blog, template: e.target.value } })}
        rows={9}
        spellCheck={false}
        className="w-full resize-y border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 font-mono2 text-[10.5px] leading-[1.35] text-[var(--acc)] outline-none focus:border-[var(--acc)]"
      />

      <SectionHead>{`posts · ${cms.blog.posts.length} on disk`}</SectionHead>
      <div className="flex flex-wrap gap-2">
        <button onClick={startNew} className={ghostBtn}>+ new post from template</button>
        <label className="cursor-pointer border border-[var(--line2)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
          ▸ upload .md / .txt
          <input type="file" accept=".md,.txt,.text,text/plain,text/markdown" className="hidden" onChange={onUploadText} />
        </label>
      </div>

      <div className="mt-3 space-y-1.5">
        {cms.blog.posts.map((p) => (
          <div key={p.id} className="border border-[var(--line2)] p-2">
            <div className="flex items-center gap-2">
              <span className="text-[var(--acc)]">≣</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10.5px] font-bold text-[var(--txt)]">{p.title}.md</div>
                <div className="truncate text-[8.5px] uppercase tracking-widest text-[var(--faint)]">
                  {p.date} · {p.tags.join(" · ") || "no tags"} · {p.images.length} img
                </div>
              </div>
              <button onClick={() => startEdit(p)} className={ghostBtn}>edit</button>
              <button onClick={() => { cms.removePost(p.id); os.toast(`DELETED → ${p.title}.md`); }}
                className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="delete post">✕</button>
            </div>

            {editing === p.id && draft && (
              <div className="mt-2 space-y-2 border-t border-[var(--line)] pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
                  <Field label="date (yyyy-mm-dd)" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} />
                  <Field label="tags (comma separated)" value={draft.tags.join(", ")}
                    onChange={(v) => setDraft({ ...draft, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} wide />
                </div>
                <div>
                  <span className="mb-1 block font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">body · markdown + markers</span>
                  <textarea
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    rows={11}
                    spellCheck={false}
                    className="w-full resize-y border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 font-mono2 text-[10.5px] leading-[1.35] text-[var(--txt)] outline-none focus:border-[var(--acc)]"
                  />
                </div>
                <div>
                  <span className="mb-1 block font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">gallery · reference as ![0]…![{Math.max(0, draft.images.length - 1)}]</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {draft.images.map((src, i) => (
                      <div key={i} className="group relative h-14 w-20 border border-[var(--line2)]">
                        <img src={src} alt={`post image ${i}`} className="h-full w-full object-cover" />
                        <span className="absolute left-0 top-0 bg-[var(--bg)] px-1 text-[8px] font-bold text-[var(--acc)]">![{i}]</span>
                        <button onClick={() => setDraft({ ...draft, images: draft.images.filter((_, j) => j !== i) })}
                          className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center border border-[var(--line2)] bg-[var(--bg)] text-[9px] text-[var(--faint)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">✕</button>
                      </div>
                    ))}
                    {draft.images.length < 6 && (
                      <label className="grid h-14 w-20 cursor-pointer place-items-center border border-dashed border-[var(--line2)] text-[9px] uppercase tracking-widest text-[var(--faint)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
                        + img
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveDraft} className={deployBtn}>▸ save post</button>
                  <button onClick={() => { setEditing(null); setDraft(null); }} className={ghostBtn}>cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {cms.blog.posts.length === 0 && (
          <div className="border border-dashed border-[var(--line2)] p-4 text-center text-[10px] text-[var(--faint)]">
            ~/blog is empty — create the first post from the template.
          </div>
        )}
      </div>

      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy blog</button>
      </div>

      <FieldForge tab="blog" />
    </div>
  );
}

/* ————— tab: desktop (icon layout + renaming) ————— */
const ICON_DEFAULTS: Array<{ id: string; glyph: string; label: string }> = [
  { id: "about", glyph: "▤", label: "about.txt" },
  { id: "projects", glyph: "▦", label: "projects/" },
  { id: "terminal", glyph: ">_", label: "terminal" },
  { id: "readme", glyph: "?", label: "README.md" },
  { id: "blog", glyph: "≣", label: "blog.md" },
];

function DesktopTab() {
  const os = useOS();
  const cms = useCMS();
  const ic = cms.icons;

  return (
    <div>
      <SectionHead>icon arrangement mode</SectionHead>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { m: "auto", g: "⌂", n: "auto", d: "row, bottom-left of the desktop" },
            { m: "free", g: "✥", n: "free grid", d: "drag icons — they snap to cells" },
            { m: "dock", g: "⊞", n: "dock", d: "row / column on any edge" },
          ] as const
        ).map((o) => (
          <button key={o.m} onClick={() => { cms.setIcons({ mode: o.m }); os.toast(`ICON MODE → ${o.n.toUpperCase()}`); }}
            className={`border p-2.5 text-left transition-colors ${ic.mode === o.m ? "border-[var(--acc)] bg-[var(--acc-dim)]" : "border-[var(--line2)] hover:border-[var(--acc)]"}`}>
            <span className={`block text-[15px] ${ic.mode === o.m ? "text-[var(--acc)]" : "text-[var(--dim)]"}`}>{o.g}</span>
            <span className={`mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] ${ic.mode === o.m ? "text-[var(--acc)]" : "text-[var(--txt)]"}`}>{o.n}</span>
            <span className="mt-0.5 block text-[8.5px] leading-snug text-[var(--faint)]">{o.d}</span>
          </button>
        ))}
      </div>

      {ic.mode === "free" && (
        <div className="mt-3 border border-[var(--line2)] bg-[var(--panel2)] px-3 py-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
          hold <span className="text-[var(--acc)]">LMB</span> on any desktop icon and drag — it snaps to the nearest free
          grid cell on release. occupied cells reject the drop.{" "}
          <button onClick={() => { cms.setIcons({ positions: {} }); os.toast("GRID POSITIONS CLEARED"); }}
            className="text-[var(--dim)] underline decoration-dotted transition-colors hover:text-[var(--red)]">
            clear saved positions
          </button>
        </div>
      )}

      {ic.mode === "dock" && (
        <>
          <SectionHead>dock · direction + edge</SectionHead>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-[var(--faint)]">dir</span>
            <button onClick={() => cms.setIcons({ dock: { ...ic.dock, dir: "h" } })}
              className={`pbtn ${ic.dock.dir === "h" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="horizontal row">— h</button>
            <button onClick={() => cms.setIcons({ dock: { ...ic.dock, dir: "v" } })}
              className={`pbtn ${ic.dock.dir === "v" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="vertical column">│ v</button>
            <span className="ml-3 text-[9px] uppercase tracking-widest text-[var(--faint)]">edge</span>
            {(
              [
                { e: "top", g: "▲" }, { e: "bottom", g: "▼" }, { e: "left", g: "◧" }, { e: "right", g: "◨" },
              ] as const
            ).map((o) => (
              <button key={o.e} onClick={() => cms.setIcons({ dock: { ...ic.dock, edge: o.e } })}
                className={`pbtn ${ic.dock.edge === o.e ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title={`dock to ${o.e}`}>{o.g}</button>
            ))}
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-[var(--faint)]">
            the dock auto-positions outside widget rails — it shifts away from whichever rails are armed.
          </p>
        </>
      )}

      <SectionHead>icon labels · rename anything</SectionHead>
      <div className="space-y-1.5">
        {ICON_DEFAULTS.map((d) => (
          <div key={d.id} className="flex items-center gap-2 border border-[var(--line2)] p-2">
            <span className="w-8 text-center font-disp text-[15px] text-[var(--acc)]">{d.glyph}</span>
            <span className="w-20 text-[9px] uppercase tracking-widest text-[var(--faint)]">{d.id}</span>
            <input
              value={ic.names[d.id] ?? d.label}
              onChange={(e) => cms.setIcons({ names: { ...ic.names, [d.id]: e.target.value } })}
              className={`min-w-0 flex-1 ${inputCls}`}
            />
            {(ic.names[d.id] ?? "") !== "" && ic.names[d.id] !== d.label && (
              <button onClick={() => { const n = { ...ic.names }; delete n[d.id]; cms.setIcons({ names: n }); }}
                className="text-[9px] uppercase tracking-widest text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="reset to default">↺</button>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px] text-[var(--faint)]">labels update live on the desktop + tooltips.</p>

      <FieldForge tab="desktop" />
    </div>
  );
}

/* ————— tab: theme ————— */
function ThemeTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const toast = () => os.toast(isRoot ? "DEFAULT THEME DEPLOYED — PERSISTED" : "DEFAULT THEME DEPLOYED (DEMO — RESETS ON REFRESH)");

  return (
    <div>
      <SectionHead>default phosphor theme</SectionHead>
      <p className="mb-2 text-[9.5px] text-[var(--faint)]">applied on next boot — and applied right now, so you can preview it.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {THEMES.map((t) => (
          <button key={t} onClick={() => { cms.updateContent({ defaultTheme: t }); os.setTheme(t); }}
            className={`border p-3 text-left transition-colors ${cms.defaultTheme === t ? "border-[var(--acc)] bg-[var(--acc-dim)]" : "border-[var(--line2)] hover:border-[var(--acc)]"}`}>
            <span className="mb-2 block h-3 w-full"
              style={{ background: THEME_HEX[t], opacity: cms.defaultTheme === t ? 1 : 0.4, boxShadow: cms.defaultTheme === t ? `0 0 10px ${THEME_HEX[t]}` : undefined }} />
            <span className={`text-[10px] font-bold uppercase tracking-[0.22em] ${cms.defaultTheme === t ? "text-[var(--acc)]" : "text-[var(--dim)]"}`}>{t}</span>
            {cms.defaultTheme === t && <span className="ml-1 text-[9px] text-[var(--acc)]">● default</span>}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy default theme</button>
      </div>

      <FieldForge tab="theme" />
    </div>
  );
}


+++ src/components/os/CmsWin.tsx (修改后)
import { useEffect, useState } from "react";
import { useOS } from "./ctx";
import { useCMS, DEFAULT_CONTENT, downscaleImage, fileToDataURL } from "../../lib/cms";
import { AchieveTab, BriefsTab } from "./CmsExtra";
import type { CmsProfile, CmsProject, CmsTrack, CmsStat, CmsArt, FieldType, WidgetId, CmsPost } from "../../lib/cms";
import { RABBIT_ART, ARTS } from "../../lib/ascii";
import { THEMES, THEME_HEX } from "../../lib/os-data";

const deployBtn = "frow border border-[var(--acc)] bg-[var(--acc-dim)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--acc)]";
const ghostBtn = "border border-[var(--line2)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--txt)] hover:text-[var(--txt)]";
const addBtn = "frow mt-3 w-full border border-dashed border-[var(--line2)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:bg-[var(--acc-dim)] hover:text-[var(--acc)]";
const inputCls = "w-full border border-[var(--line2)] bg-[var(--panel2)] px-2 py-1.5 font-mono2 text-[11px] text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]";

function Field({ label, value, onChange, wide = false, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; wide?: boolean; placeholder?: string;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">{label}</span>
      {wide ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder}
          className="w-full resize-none border border-[var(--line2)] bg-[var(--panel2)] px-2 py-1.5 font-mono2 text-[11px] leading-relaxed text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      )}
    </label>
  );
}

export function SectionHead({ children }: { children: string }) {
  return (
    <div className="mb-2 mt-5 flex items-center gap-2 first:mt-0">
      <span className="font-mono2 text-[9.5px] font-bold uppercase tracking-[0.26em] text-[var(--acc)]">## {children}</span>
      <span className="h-px flex-1 bg-[var(--line2)]" />
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-pressed={on}
      className="relative h-4 w-9 shrink-0 border border-[var(--line2)] bg-[var(--bg2)] transition-colors hover:border-[var(--acc)]">
      <span className={`absolute top-1/2 h-2.5 w-3.5 -translate-y-1/2 transition-all duration-200 ${on ? "left-[calc(100%-18px)] bg-[var(--acc)] shadow-[0_0_8px_var(--acc-glow)]" : "left-[2px] bg-[var(--faint)]"}`} />
    </button>
  );
}

/* shrink+persist image files as dataURLs for the gallery */
function fileToDataUrl(file: File, maxW = 1280): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = rej;
    img.src = url;
  });
}

/* ————— FieldForge — append your own form controls to any tab ————— */
const FIELD_TYPES: Array<{ t: FieldType; glyph: string; label: string; desc: string }> = [
  { t: "line", glyph: "▭", label: "line", desc: "single-line input" },
  { t: "text", glyph: "▤", label: "text", desc: "multi-line block" },
  { t: "toggle", glyph: "◉", label: "toggle", desc: "on / off switch" },
  { t: "number", glyph: "#", label: "number", desc: "numeric input" },
];

export function FieldForge({ tab }: { tab: string }) {
  const os = useOS();
  const cms = useCMS();
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<FieldType>("line");
  const [label, setLabel] = useState("");
  const fields = cms.customFields[tab] ?? [];

  const commit = () => {
    if (!label.trim()) { os.toast("FIELD NEEDS A LABEL"); return; }
    cms.addField(tab, type, label.trim());
    setLabel(""); setAdding(false);
    os.toast(`FORM FIELD ADDED TO [${tab.toUpperCase()}]`);
  };

  return (
    <>
      <SectionHead>{`custom forms · ${tab}`}</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        append your own controls to this tab — one-line inputs, text blocks, toggles, numbers.
        values are stored with the content{cms.mode === "root" ? " and persist" : " (demo: reset on refresh)"}.
      </p>
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f.id} className="border border-[var(--line2)] bg-[var(--panel2)] p-2">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--acc)]">{f.label}</span>
              <span className="border border-[var(--line)] px-1 text-[8px] uppercase tracking-widest text-[var(--faint)]">{f.type}</span>
              <button onClick={() => cms.removeField(tab, f.id)} className="ml-auto text-[9px] text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="remove field">✕</button>
            </div>
            {f.type === "line" && (
              <input value={f.value as string} onChange={(e) => cms.setFieldValue(tab, f.id, e.target.value)} className={`${inputCls} bg-[var(--bg2)]`} placeholder="type here…" />
            )}
            {f.type === "text" && (
              <textarea value={f.value as string} onChange={(e) => cms.setFieldValue(tab, f.id, e.target.value)} rows={3} className="w-full resize-y border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 font-mono2 text-[11px] leading-relaxed text-[var(--txt)] outline-none focus:border-[var(--acc)]" placeholder="multi-line text block…" />
            )}
            {f.type === "toggle" && (
              <div className="flex items-center gap-2">
                <Toggle on={f.value === true} onToggle={() => cms.setFieldValue(tab, f.id, !(f.value === true))} />
                <span className={`text-[9px] uppercase tracking-widest ${f.value ? "text-[var(--acc)]" : "text-[var(--faint)]"}`}>{f.value ? "enabled" : "disabled"}</span>
              </div>
            )}
            {f.type === "number" && (
              <input type="number" value={f.value as string} onChange={(e) => cms.setFieldValue(tab, f.id, e.target.value)} className="w-28 border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 font-mono2 text-[11px] text-[var(--txt)] outline-none focus:border-[var(--acc)]" />
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-2 border border-[var(--acc)] bg-[var(--acc-dim)] p-2.5">
          <div className="mb-2 grid grid-cols-4 gap-1.5">
            {FIELD_TYPES.map((ft) => (
              <button key={ft.t} onClick={() => setType(ft.t)} title={ft.desc}
                className={`border px-1 py-1.5 text-center transition-colors ${type === ft.t ? "border-[var(--acc)] bg-[var(--panel)] text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)]"}`}>
                <span className="block text-[13px] leading-none">{ft.glyph}</span>
                <span className="mt-1 block text-[8px] uppercase tracking-widest">{ft.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commit()}
              placeholder="field label, e.g. favourite editor" autoFocus className={`min-w-0 flex-1 ${inputCls} bg-[var(--bg2)]`} />
            <button onClick={commit} className="border border-[var(--acc)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--acc)]">ok</button>
            <button onClick={() => setAdding(false)} className="border border-[var(--line2)] px-2.5 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)]">✕</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className={addBtn}>+ add form field</button>
      )}
    </>
  );
}

export default function CmsWin() {
  const cms = useCMS();
  return cms.mode === "guest" ? <Login /> : <Panel />;
}

/* ————— login: follow the white rabbit ————— */
function Login() {
  const os = useOS();
  const cms = useCMS();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(0);
  const [checking, setChecking] = useState(false);

  const submit = () => {
    if (!user || !pass) { setErr((e) => e + 1); return; }
    setChecking(true);
    window.setTimeout(() => {
      const m = cms.login(user.trim(), pass);
      setChecking(false);
      if (!m) { setErr((e) => e + 1); setPass(""); os.toast("ACCESS DENIED — INVALID CREDENTIALS"); }
      else os.toast(m === "root" ? "ROOT ACCESS GRANTED — EDITS PERSIST" : "DEMO MODE — EDITS RESET ON REFRESH");
    }, 550);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 py-5 font-mono2 text-[11.5px]">
      <div className="flex flex-col items-start gap-5 md:flex-row">
        <pre className="shrink-0 text-[9px] leading-[1.2] text-[var(--acc)]" style={{ textShadow: "0 0 12px var(--acc-glow)" }}>{RABBIT_ART}</pre>
        <div className="min-w-0">
          <div className="font-disp text-3xl leading-none tracking-wide text-[var(--txt)]">
            FOLLOW THE <span className="text-[var(--acc)]">WHITE RABBIT</span>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--dim)]">
            This terminal controls the content of the whole OS. Knock, knock — authenticate to enter the content matrix.
          </p>
          <div className="mt-3 border border-[var(--line2)] bg-[var(--panel2)] p-2.5 text-[10px] leading-relaxed">
            <div className="text-[9px] uppercase tracking-[0.24em] text-[var(--faint)]">guest access (demo)</div>
            <div className="mt-1">login <span className="text-[var(--acc)]">admin</span> · pass <span className="text-[var(--acc)]">qwerty123</span></div>
            <div className="mt-0.5 text-[var(--faint)]">demo edits apply instantly but vanish on refresh. root credentials are not for tourists.</div>
          </div>
        </div>
      </div>

      <div key={err} className={`mt-5 max-w-md ${err ? "shake" : ""}`}>
        <div className="grid grid-cols-[64px_1fr] items-center gap-x-3 gap-y-2">
          <span className="text-right text-[10px] uppercase tracking-widest text-[var(--faint)]">login</span>
          <input value={user} onChange={(e) => setUser(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} autoFocus spellCheck={false}
            className="border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 text-[12px] text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]" placeholder="admin" />
          <span className="text-right text-[10px] uppercase tracking-widest text-[var(--faint)]">pass</span>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            className="border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 text-[12px] text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]" placeholder="••••••••" />
        </div>
        {err > 0 && (
          <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--red)]">
            ✗ access denied — {err} failed attempt{err > 1 ? "s" : ""}. the rabbit is not impressed.
          </div>
        )}
        <button onClick={submit} disabled={checking}
          className="frow mt-3 border border-[var(--acc)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--acc)] disabled:opacity-50">
          {checking ? "▮ checking…" : "▸ authenticate"}
        </button>
      </div>
    </div>
  );
}

/* ————— admin panel with per-window tabs ————— */
const TABS = [
  { id: "profile", glyph: "▤", label: "about" },
  { id: "projects", glyph: "▦", label: "projects" },
  { id: "widgets", glyph: "◱", label: "widgets" },
  { id: "achieve", glyph: "★", label: "trophies" },
  { id: "briefs", glyph: "✚", label: "briefs" },
  { id: "playlist", glyph: "♪", label: "playlist" },
  { id: "arts", glyph: "▒", label: "ascii arts" },
  { id: "blog", glyph: "≣", label: "blog" },
  { id: "desktop", glyph: "⌗", label: "desktop" },
  { id: "theme", glyph: "◍", label: "theme" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function Panel() {
  const os = useOS();
  const cms = useCMS();
  const [tab, setTab] = useState<TabId>("profile");
  const isRoot = cms.mode === "root";

  return (
    <div className="flex h-full flex-col font-mono2 text-[11.5px]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--panel2)] px-4 py-2">
        <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] ${isRoot ? "border-[var(--red)] text-[var(--red)]" : "border-[var(--amber)] text-[var(--amber)] badge-blink"}`}>
          {isRoot ? "● root" : "● demo"}
        </span>
        <span className="text-[10px] text-[var(--dim)]">user: <span className="text-[var(--txt)]">{cms.sessionUser}</span></span>
        <span className="ml-auto text-[9px] uppercase tracking-widest text-[var(--faint)]">{isRoot ? "writes → localStorage" : "writes → memory only"}</span>
        <button onClick={() => { cms.logout(); os.toast("SESSION CLOSED — BACK TO GUEST MODE"); }}
          className="border border-[var(--line2)] px-2 py-0.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">
          logout
        </button>
      </div>

      {!isRoot && (
        <div className="border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--amber)_7%,transparent)] px-4 py-1.5 text-[9.5px] text-[var(--amber)]">
          ⚠ demo mode — changes apply live, page refresh restores defaults.
        </div>
      )}
      {isRoot && cms.persistError && (
        <div className="border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--red)_8%,transparent)] px-4 py-1.5 text-[9.5px] text-[var(--red)]">
          ⚠ localStorage quota hit (large media?) — latest changes live in memory only.
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-b border-[var(--line)] bg-[var(--panel2)] px-3 py-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 border px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.18em] transition-colors ${tab === t.id ? "border-[var(--acc)] bg-[var(--acc-dim)] font-bold text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)] hover:text-[var(--txt)]"}`}>
            <span className="mr-1.5">{t.glyph}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "profile" && <ProfileTab />}
        {tab === "projects" && <ProjectsTab />}
        {tab === "widgets" && <WidgetsTab />}
        {tab === "achieve" && <AchieveTab />}
        {tab === "briefs" && <BriefsTab />}
        {tab === "blog" && <BlogTab />}
        {tab === "desktop" && <DesktopTab />}
        {tab === "playlist" && <PlaylistTab />}
        {tab === "arts" && <ArtsTab />}
        {tab === "theme" && <ThemeTab />}
      </div>

      <div className="border-t border-[var(--line)] bg-[var(--panel2)] px-4 py-1.5 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">
        cms.sys v3.0 · edits propagate instantly to the whole OS
      </div>
    </div>
  );
}

/* ————— tab: about / profile ————— */
function ProfileTab() {
  const os = useOS();
  const cms = useCMS();
  const [f, setF] = useState<CmsProfile>({ ...cms.profile, contacts: cms.profile.contacts.map((c) => ({ ...c })) });
  const [nu, setNu] = useState("");
  const [np, setNp] = useState("");
  const isRoot = cms.mode === "root";
  const set = (k: keyof CmsProfile) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const toast = () => os.toast(isRoot ? "CONTENT DEPLOYED — PERSISTED TO DISK" : "CONTENT DEPLOYED (DEMO — RESETS ON REFRESH)");
  const setContact = (i: number, patch: Partial<{ label: string; value: string }>) =>
    setF((p) => ({ ...p, contacts: p.contacts.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));

  return (
    <div>
      <SectionHead>identity</SectionHead>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="display name" value={f.name} onChange={set("name")} />
        <Field label="role / title" value={f.role} onChange={set("role")} />
        <Field label="handle / email" value={f.handle} onChange={set("handle")} />
        <Field label="location" value={f.location} onChange={set("location")} />
        <Field label="experience line" value={f.expLine} onChange={set("expLine")} />
        <Field label="status line" value={f.statusLine} onChange={set("statusLine")} />
      </div>

      <SectionHead>voice</SectionHead>
      <div className="grid gap-3">
        <Field label="availability" value={f.availability} onChange={set("availability")} />
        <Field label="bio (about.txt + dossier)" value={f.bio} onChange={set("bio")} wide />
      </div>

      <SectionHead>uplinks · contacts & sites</SectionHead>
      <div className="space-y-2">
        {f.contacts.map((c, i) => (
          <div key={c.id} className="grid grid-cols-[88px_1fr_22px] items-center gap-2">
            <input value={c.label} onChange={(e) => setContact(i, { label: e.target.value })} className={inputCls} />
            <input value={c.value} onChange={(e) => setContact(i, { value: e.target.value })} className={inputCls} placeholder="url, @handle or email" />
            <button onClick={() => setF((p) => ({ ...p, contacts: p.contacts.filter((_, j) => j !== i) }))}
              className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="remove uplink">✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => setF((p) => ({ ...p, contacts: [...p.contacts, { id: `c-${Date.now().toString(36)}`, label: "site", value: "https://" }] }))} className={addBtn}>
        + add uplink
      </button>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => { cms.updateContent({ profile: f }); toast(); }} className={deployBtn}>▸ deploy changes</button>
        <button onClick={() => setF({ ...cms.profile, contacts: cms.profile.contacts.map((c) => ({ ...c })) })} className={ghostBtn}>revert</button>
      </div>

      <FieldForge tab="about" />

      {isRoot && (
        <>
          <SectionHead>root · credentials</SectionHead>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="new login" value={nu} onChange={setNu} />
            <Field label="new password" value={np} onChange={setNp} />
          </div>
          <button
            onClick={() => {
              if (nu.trim().length < 3 || np.length < 6) { os.toast("CREDENTIALS TOO SHORT — LOGIN ≥3, PASS ≥6"); return; }
              cms.saveCreds(nu.trim(), np); setNu(""); setNp("");
              os.toast("ROOT CREDENTIALS ROTATED");
            }}
            className="mt-2 border border-[var(--line2)] px-3 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--amber)] hover:text-[var(--amber)]">
            rotate credentials
          </button>

          <SectionHead>root · danger zone</SectionHead>
          <button
            onClick={() => { cms.resetContent(); setF({ ...DEFAULT_CONTENT.profile, contacts: DEFAULT_CONTENT.profile.contacts.map((c) => ({ ...c })) }); os.toast("ALL CONTENT FACTORY-RESET"); }}
            className="border border-[var(--red)] px-3 py-1 text-[9px] uppercase tracking-widest text-[var(--red)] transition-colors hover:bg-[color-mix(in_srgb,var(--red)_12%,transparent)]">
            ⚠ reset all content (profile · projects · widgets · playlist · arts · forms · theme)
          </button>
        </>
      )}
    </div>
  );
}

/* ————— shared project template form ————— */
function ProjectForm({ p, onDeleted }: { p: CmsProject; onDeleted: () => void }) {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const [uploading, setUploading] = useState(false);
  const patch = (patch: Partial<CmsProject>) =>
    cms.updateContent({ projects: cms.projects.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) });
  const setMetric = (i: number, key: "value" | "label", v: string) =>
    patch({ metrics: p.metrics.map((m, j) => (j === i ? { ...m, [key]: v } : m)) });
  const toast = () => os.toast(isRoot ? "PROJECT DEPLOYED — PERSISTED" : "PROJECT DEPLOYED (DEMO — RESETS ON REFRESH)");

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const room = 6 - (p.gallery?.length ?? 0);
    const files = Array.from(e.target.files ?? []).slice(0, Math.max(0, room));
    e.target.value = "";
    if (!files.length) { if (room <= 0) os.toast("GALLERY FULL — 6 PHOTOS MAX"); return; }
    setUploading(true);
    const urls: string[] = [];
    for (const f of files) { try { urls.push(await fileToDataUrl(f)); } catch { /* skip broken file */ } }
    patch({ gallery: [...(p.gallery ?? []), ...urls] });
    setUploading(false);
    os.toast(`${urls.length} PHOTO(S) DEVELOPED INTO GALLERY`);
  };

  return (
    <div>
      <SectionHead>{`template · editing ${p.id}/`}</SectionHead>
      <p className="mb-2 text-[9.5px] text-[var(--faint)]">one shared schema for every project — what you deploy here rewrites the explorer, viewer and terminal instantly.</p>

      {p.image && (
        <div className="img-scan mb-3 overflow-hidden border border-[var(--line2)]">
          <img src={p.image} alt={p.title} className="max-h-36 w-full object-cover" />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="title" value={p.title} onChange={(v) => patch({ title: v })} />
        <Field label="category" value={p.category} onChange={(v) => patch({ category: v })} />
        <Field label="year" value={p.year} onChange={(v) => patch({ year: v })} />
        <Field label="role" value={p.role} onChange={(v) => patch({ role: v })} />
        <Field label="project link (live / repo)" value={p.link} onChange={(v) => patch({ link: v })} placeholder="https://…" />
        <Field label="cover image url" value={p.image} onChange={(v) => patch({ image: v })} placeholder="https://…/shot.png" />
        <Field label="summary" value={p.summary} onChange={(v) => patch({ summary: v })} wide />
        <Field label="stack (comma separated)" value={p.stack.join(", ")} onChange={(v) => patch({ stack: v.split(",").map((s) => s.trim()).filter(Boolean) })} wide />
      </div>

      <div className="mt-3">
        <span className="mb-1.5 block font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">metrics (value · label)</span>
        <div className="grid grid-cols-3 gap-2">
          {p.metrics.map((m, i) => (
            <div key={i} className="space-y-1.5">
              <input value={m.value} onChange={(e) => setMetric(i, "value", e.target.value)} className="w-full border border-[var(--line2)] bg-[var(--panel2)] px-2 py-1 text-[11px] text-[var(--acc)] outline-none focus:border-[var(--acc)]" />
              <input value={m.label} onChange={(e) => setMetric(i, "label", e.target.value)} className="w-full border border-[var(--line2)] bg-[var(--panel2)] px-2 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] outline-none focus:border-[var(--acc)]" />
            </div>
          ))}
        </div>
      </div>

      <SectionHead>photo gallery · slider on the viewer</SectionHead>
      <div className="flex flex-wrap gap-2">
        {(p.gallery ?? []).map((g, i) => (
          <div key={i} className="group relative h-16 w-24 overflow-hidden border border-[var(--line2)]">
            <img src={g} alt={`${p.id} gallery ${i + 1}`} className="h-full w-full object-cover" />
            <button
              onClick={() => patch({ gallery: (p.gallery ?? []).filter((_, j) => j !== i) })}
              className="absolute right-0.5 top-0.5 hidden bg-[rgba(0,0,0,0.7)] px-1 text-[9px] text-[var(--red)] group-hover:block"
              title="remove photo">✕</button>
            <span className="absolute bottom-0.5 left-1 text-[8px] text-[var(--txt)]" style={{ textShadow: "0 1px 2px #000" }}>{i + 1}</span>
          </div>
        ))}
        <label className={`grid h-16 w-24 cursor-pointer place-items-center border border-dashed border-[var(--line2)] font-mono2 text-[9px] uppercase tracking-widest text-[var(--faint)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)] ${uploading ? "opacity-50" : ""}`}>
          {uploading ? "dev…" : "+ photos"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </label>
      </div>
      <p className="mt-1.5 text-[8.5px] text-[var(--faint)]">images are downscaled + compressed in-browser · 6 max · shown as a fullscreen-capable slider in the viewer window.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={toast} className={deployBtn}>▸ deploy project</button>
        {cms.projects.length > 1 && (
          <button
            onClick={() => { cms.removeProject(p.id); onDeleted(); os.toast(`PROJECT ${p.id}/ DELETED`); }}
            className="border border-[var(--red)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--red)] transition-colors hover:bg-[color-mix(in_srgb,var(--red)_12%,transparent)]">
            ✕ delete project
          </button>
        )}
      </div>
    </div>
  );
}

/* ————— tab: projects (chips + trailing "+" tab) ————— */
function ProjectsTab() {
  const os = useOS();
  const cms = useCMS();
  const [sel, setSel] = useState(cms.projects[0]?.id ?? "");
  const p = cms.projects.find((x) => x.id === sel);

  const addNew = () => {
    const id = cms.addProject();
    setSel(id);
    os.toast("NEW PROJECT APPENDED — SAME TEMPLATE, YOUR CONTENT");
  };

  return (
    <div>
      <SectionHead>project registry</SectionHead>
      <div className="flex flex-wrap items-center gap-1.5">
        {cms.projects.map((x) => (
          <button key={x.id} onClick={() => setSel(x.id)}
            className={`shrink-0 border px-2.5 py-1.5 text-[10px] transition-colors ${x.id === sel ? "border-[var(--acc)] bg-[var(--acc-dim)] font-bold text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)] hover:text-[var(--txt)]"}`}>
            {x.id}/
          </button>
        ))}
        <button onClick={addNew} title="add project — opens the shared template"
          className="shrink-0 border border-dashed border-[var(--line2)] px-3 py-1.5 text-[12px] font-bold leading-none text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:bg-[var(--acc-dim)] hover:text-[var(--acc)]">
          +
        </button>
      </div>

      {p ? (
        <ProjectForm key={p.id} p={p} onDeleted={() => setSel(cms.projects.find((x) => x.id !== p.id)?.id ?? "")} />
      ) : (
        <button onClick={addNew} className={addBtn}>+ add the first project</button>
      )}

      <FieldForge tab="projects" />
    </div>
  );
}

/* ————— tab: widgets (layout + video source) ————— */
const WIDGET_META: Record<WidgetId, { glyph: string; name: string; desc: string }> = {
  operator: { glyph: "▤", name: "operator.json", desc: "identity card + skill bars" },
  player: { glyph: "♪", name: "now_playing.d", desc: "bg music queue — mp3 plays for real" },
  git: { glyph: "▦", name: "git activity", desc: "commit heatmap" },
  sysmon: { glyph: "◍", name: "sysmon", desc: "cpu / mem / net graphs" },
  video: { glyph: "▶", name: "video.d", desc: "media player widget" },
  chat: { glyph: "✉", name: "chat.sys", desc: "visitor message → your inbox" },
  oracle: { glyph: "◬", name: "oracle.sys", desc: "ask the machine" },
  achieve: { glyph: "★", name: "trophies.sys", desc: "achievements ledger" },
  order: { glyph: "✚", name: "order.sys", desc: "project brief intake" },
  arcade: { glyph: "▲", name: "arcade.sys", desc: "5 mini games + local top-10" },
};

function WidgetsTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const toast = () => os.toast(isRoot ? "WIDGET LAYOUT DEPLOYED — PERSISTED" : "WIDGET LAYOUT DEPLOYED (DEMO — RESETS ON REFRESH)");

  const onVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) os.toast("⚠ LARGE FILE — MAY NOT PERSIST AFTER REFRESH");
    const r = new FileReader();
    r.onload = () => {
      cms.updateContent({ videoSrc: String(r.result), videoName: f.name });
      os.toast(`VIDEO LOADED INTO video.d → ${f.name}`);
    };
    r.readAsDataURL(f);
  };

  const onOperatorMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type.startsWith("image/")) {
      try {
        const data = await downscaleImage(f, 512, 0.85);
        cms.updateContent({ operator: { media: data, kind: "image", name: f.name } });
        os.toast(`OPERATOR PORTRAIT MOUNTED → ${f.name}`);
      } catch {
        os.toast("COULD NOT READ IMAGE");
      }
      return;
    }
    if (f.type.startsWith("video/")) {
      if (f.size > 8 * 1024 * 1024) os.toast("⚠ LARGE CLIP — MAY NOT PERSIST AFTER REFRESH");
      const r = new FileReader();
      r.onload = () => {
        cms.updateContent({ operator: { media: String(r.result), kind: "video", name: f.name } });
        os.toast(`OPERATOR FEED MOUNTED → ${f.name} (loops muted)`);
      };
      r.readAsDataURL(f);
      return;
    }
    os.toast("ONLY IMAGE OR VIDEO FILES");
  };

  return (
    <div>
      <SectionHead>desktop layout · order / dock / visibility</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        ▲▼ sets stacking order · <span className="text-[var(--acc)]">◧/◨</span> pins the widget to the left or right rail ·{" "}
        <span className="text-[var(--acc)]">▲</span> docks it to the top strip (left → right) · toggle hides it.
        rails render on wide screens (≥1280px).
      </p>
      <div className="space-y-1.5">
        {cms.widgetCfg.map((w, i) => {
          const meta = WIDGET_META[w.id];
          return (
            <div key={w.id} className={`flex items-center gap-2 border p-2 transition-colors ${w.enabled ? "border-[var(--line2)]" : "border-[var(--line)] opacity-50"}`}>
              <span className="w-5 text-center text-[11px] text-[var(--acc)]">{meta.glyph}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] font-bold text-[var(--txt)]">{meta.name}</div>
                <div className="truncate text-[8.5px] uppercase tracking-widest text-[var(--faint)]">{meta.desc}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => cms.setWidget(w.id, { dock: "left" })}
                  className={`pbtn ${w.dock === "left" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="pin to left rail">◧</button>
                <button onClick={() => cms.setWidget(w.id, { dock: "right" })}
                  className={`pbtn ${w.dock === "right" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="pin to right rail">◨</button>
                <button onClick={() => cms.setWidget(w.id, { dock: "top" })}
                  className={`pbtn ${w.dock === "top" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="dock to top strip (left → right)">▲</button>
                <button onClick={() => cms.moveWidget(i, -1)} className="pbtn" title="earlier in order">▲</button>
                <button onClick={() => cms.moveWidget(i, 1)} className="pbtn" title="later in order">▼</button>
                <Toggle on={w.enabled} onToggle={() => cms.setWidget(w.id, { enabled: !w.enabled })} />
              </div>
            </div>
          );
        })}
      </div>

      <SectionHead>video.d · media source</SectionHead>
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer border border-[var(--line2)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
          ▸ upload video / audio file
          <input type="file" accept="video/*,audio/*" className="hidden" onChange={onVideo} />
        </label>
        {cms.videoSrc && (
          <>
            <span className="max-w-52 truncate text-[10px] text-[var(--acc)]">{cms.videoName || "clip"}</span>
            <button onClick={() => cms.updateContent({ videoSrc: "", videoName: "" })}
              className="border border-[var(--line2)] px-2 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">
              eject
            </button>
          </>
        )}
        {!cms.videoSrc && <span className="text-[9.5px] text-[var(--faint)]">nothing mounted — widget shows static.</span>}
      </div>

      <SectionHead>operator.json · photo / video feed</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        mount your own photo or a looping clip onto the operator card — it replaces the default portrait
        and gets re-tinted with the active phosphor theme.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer border border-[var(--line2)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
          ▸ upload photo / video
          <input type="file" accept="image/*,video/*" className="hidden" onChange={onOperatorMedia} />
        </label>
        {cms.operator.media ? (
          <>
            <span className="flex items-center gap-2 border border-[var(--line2)] px-2 py-1">
              {cms.operator.kind === "video" ? (
                <video src={cms.operator.media} className="h-8 w-8 object-cover" muted loop autoPlay playsInline />
              ) : (
                <img src={cms.operator.media} alt="operator media" className="avatar-img h-8 w-8 object-cover" />
              )}
              <span className="max-w-40 truncate text-[9px] text-[var(--acc)]">{cms.operator.name || cms.operator.kind}</span>
            </span>
            <button onClick={() => cms.updateContent({ operator: { media: null, kind: "image", name: "" } })}
              className="border border-[var(--line2)] px-2 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">
              eject → default portrait
            </button>
          </>
        ) : (
          <span className="text-[9.5px] text-[var(--faint)]">default portrait mounted.</span>
        )}
      </div>

      <SectionHead>chat.sys · delivery</SectionHead>
      <p className="text-[9.5px] leading-relaxed text-[var(--faint)]">
        visitor messages are handed off to the mail client addressed to{" "}
        <span className="text-[var(--acc)]">{cms.profile.handle}</span> with the visitor's email as reply-to.
        change the inbox in the <span className="text-[var(--txt)]">about</span> tab.
      </p>

      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy widget layout</button>
      </div>

      <FieldForge tab="widgets" />
    </div>
  );
}

/* ————— tab: playlist ————— */
function PlaylistTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const toast = () => os.toast(isRoot ? "PLAYLIST DEPLOYED — PERSISTED" : "PLAYLIST DEPLOYED (DEMO — RESETS ON REFRESH)");
  const setTrack = (i: number, patch: Partial<CmsTrack>) =>
    cms.updateContent({ tracks: cms.tracks.map((t, j) => (j === i ? { ...t, ...patch } : t)) });

  const onAudio = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) os.toast("⚠ LARGE FILE — MAY NOT PERSIST AFTER REFRESH");
    const r = new FileReader();
    r.onload = () => {
      setTrack(i, { src: String(r.result), fileName: f.name });
      os.toast(`AUDIO MOUNTED → ${f.name} (plays with real sound)`);
    };
    r.readAsDataURL(f);
  };

  return (
    <div>
      <SectionHead>now_playing.d queue</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        mount an <span className="text-[var(--acc)]">mp3 / ogg / wav / m4a</span> per track and the desktop player
        will actually play it — with seek, progress and auto-advance. tracks without a file stay simulated.
      </p>
      <div className="space-y-2">
        {cms.tracks.map((t, i) => (
          <div key={i} className="border border-[var(--line2)] p-2">
            <div className="grid grid-cols-[20px_1fr_1fr_64px_22px] items-center gap-2">
              <span className="text-center text-[9px] text-[var(--faint)]">{String(i + 1).padStart(2, "0")}</span>
              <input value={t.t} onChange={(e) => setTrack(i, { t: e.target.value })} placeholder="track" className={`min-w-0 ${inputCls}`} />
              <input value={t.a} onChange={(e) => setTrack(i, { a: e.target.value })} placeholder="artist" className={`min-w-0 ${inputCls}`} />
              <input type="number" min={10} value={t.d} onChange={(e) => setTrack(i, { d: Math.max(10, Number(e.target.value) || 10) })}
                className={inputCls} title="simulated duration, seconds (ignored when audio mounted)" />
              <button onClick={() => cms.removeTrack(i)} className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="remove track">✕</button>
            </div>
            <div className="mt-1.5 flex items-center gap-2 pl-7">
              <label className="cursor-pointer border border-[var(--line2)] px-2 py-0.5 text-[8.5px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
                ♪ mount audio
                <input type="file" accept="audio/*,video/*" className="hidden" onChange={onAudio(i)} />
              </label>
              {t.src ? (
                <>
                  <span className="max-w-48 truncate text-[9px] text-[var(--acc)]">▸ {t.fileName || "audio mounted"}</span>
                  <button onClick={() => setTrack(i, { src: undefined, fileName: undefined })}
                    className="text-[8.5px] uppercase tracking-widest text-[var(--faint)] transition-colors hover:text-[var(--red)]">eject</button>
                </>
              ) : (
                <span className="text-[9px] text-[var(--faint)]">simulated · {t.d}s</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => cms.addTrack()} className={addBtn}>+ add track</button>
      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy playlist</button>
      </div>

      <FieldForge tab="playlist" />
    </div>
  );
}

/* ————— ascii art editor (clipboard-friendly) ————— */
function ArtEditor({ onSave, onClose }: { onSave: (name: string, rows: string[]) => void; onClose: () => void }) {
  const os = useOS();
  const [name, setName] = useState("my_art");
  const [text, setText] = useState("");

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) { setText(t); os.toast("CLIPBOARD ABSORBED"); return; }
      os.toast("CLIPBOARD EMPTY");
    } catch {
      os.toast("CLIPBOARD BLOCKED — PASTE WITH CTRL+V");
    }
  };

  const save = () => {
    const rows = text.replace(/\s+$/, "").split("\n");
    if (!rows.some((r) => r.trim())) { os.toast("EDITOR IS EMPTY — PASTE SOME GLYPHS"); return; }
    onSave(name, rows.slice(0, 24));
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[rgba(2,5,3,0.88)] p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="crt-in w-full max-w-4xl border border-[var(--acc)] bg-[var(--panel)] shadow-[0_30px_90px_rgba(0,0,0,0.7)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--panel2)] px-3 py-2 font-mono2">
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--acc)]">▒ ascii editor</span>
          <input value={name} onChange={(e) => setName(e.target.value)} spellCheck={false}
            className="w-36 border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1 text-[10.5px] text-[var(--txt)] outline-none focus:border-[var(--acc)]" placeholder="art name" />
          <button onClick={paste} className="ml-auto border border-[var(--line2)] px-2.5 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
            ⧉ paste from clipboard
          </button>
          <button onClick={onClose} className="border border-[var(--line2)] px-2.5 py-1 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">esc · close</button>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-[var(--line)] md:border-b-0 md:border-r">
            <div className="px-3 py-1.5 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">input · formatted text ok</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              autoFocus
              rows={16}
              placeholder={"paste your art here — ctrl+v works.\nmonospace glyphs, box drawing, block chars:\n\n  ███▄▄  \n  █░░░█  \n  ▀█▄█▀  "}
              className="h-[340px] w-full resize-none bg-[var(--bg2)] px-3 py-2 font-mono2 text-[11px] leading-[1.3] text-[var(--acc)] outline-none"
            />
          </div>
          <div>
            <div className="px-3 py-1.5 font-mono2 text-[8.5px] uppercase tracking-[0.22em] text-[var(--faint)]">live preview · phosphor</div>
            <div className="grid h-[340px] place-items-center overflow-auto bg-[var(--bg)] p-4">
              <pre className="max-w-full text-[11px] leading-[1.25] text-[var(--acc)]" style={{ textShadow: "0 0 12px var(--acc-glow)" }}>
                {text || "· awaiting glyphs ·"}
              </pre>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-[var(--line)] bg-[var(--panel2)] px-3 py-2 font-mono2">
          <span className="text-[8.5px] uppercase tracking-widest text-[var(--faint)]">{text ? `${text.split("\n").length} rows · ${text.length} chars · max 24 rows kept` : "empty"}</span>
          <button onClick={save} className="ml-auto border border-[var(--acc)] bg-[var(--acc-dim)] px-4 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.22em] text-[var(--acc)]">
            ▸ save to queue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ————— tab: ascii arts ————— */
const rowsOf = (a: CmsArt): string[] => a.rows ?? ARTS.find((d) => d.id === a.id)?.rows ?? [];

function MiniArt({ rows }: { rows: string[] }) {
  return (
    <pre className="w-20 shrink-0 overflow-hidden border border-[var(--line)] bg-[var(--bg2)] p-1 text-center text-[4px] leading-[1.15] text-[var(--acc)]">
      {rows.slice(0, 10).join("\n") || "· empty ·"}
    </pre>
  );
}

function ArtsTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const [editor, setEditor] = useState(false);
  const arts = cms.arts;
  const enabledCount = arts.filter((a) => a.enabled).length;

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= arts.length) return;
    const next = [...arts];
    [next[i], next[j]] = [next[j], next[i]];
    cms.updateContent({ arts: next });
  };
  const setAll = (enabled: boolean) => cms.updateContent({ arts: arts.map((a) => ({ ...a, enabled })) });
  const toast = () => os.toast(isRoot ? "ART QUEUE DEPLOYED — PERSISTED" : "ART QUEUE DEPLOYED (DEMO — RESETS ON REFRESH)");

  return (
    <div>
      <SectionHead>idle-rain art queue</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        when the cursor idles over the desktop, the rain assembles these — top of the list shows first, cycling downward.{" "}
        <span className="text-[var(--acc)]">{enabledCount}/{arts.length} armed</span> · leave your cursor still to preview.
      </p>

      <div className="space-y-1.5">
        {arts.map((a, i) => {
          const isCustom = !!a.rows;
          return (
            <div key={a.id} data-art={a.id} className={`border p-2 transition-colors ${a.enabled ? "border-[var(--line2)]" : "border-[var(--line)] opacity-50"}`}>
              <div className="flex items-center gap-2">
                <span className="w-6 text-center text-[9px] font-bold text-[var(--acc)]">{String(i + 1).padStart(2, "0")}</span>
                <MiniArt rows={rowsOf(a)} />
                <div className="min-w-0 flex-1">
                  {isCustom ? (
                    <input value={a.name} onChange={(e) => cms.setArt(a.id, { name: e.target.value })}
                      className="w-full border border-transparent bg-transparent px-1 py-0.5 text-[10.5px] font-bold text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)] focus:bg-[var(--panel2)]" />
                  ) : (
                    <div className="truncate px-1 text-[10.5px] font-bold text-[var(--txt)]">{a.name}</div>
                  )}
                  <div className="px-1 text-[8.5px] uppercase tracking-widest text-[var(--faint)]">
                    {isCustom ? "custom · editable" : "built-in"} · {rowsOf(a).length} rows · prio {i + 1}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, -1)} className="pbtn" title="higher priority">▲</button>
                  <button onClick={() => move(i, 1)} className="pbtn" title="lower priority">▼</button>
                  <Toggle on={a.enabled} onToggle={() => cms.setArt(a.id, { enabled: !a.enabled })} />
                  {isCustom && (
                    <button onClick={() => { cms.removeArt(a.id); os.toast(`ART '${a.name}' DELETED`); }}
                      className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="delete custom art">✕</button>
                  )}
                </div>
              </div>
              {isCustom && (
                <textarea
                  value={(a.rows ?? []).join("\n")}
                  onChange={(e) => cms.setArt(a.id, { rows: e.target.value.split("\n").slice(0, 24) })}
                  rows={Math.min(8, Math.max(3, (a.rows ?? []).length))}
                  spellCheck={false}
                  className="mt-2 w-full resize-y border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 font-mono2 text-[10px] leading-[1.25] text-[var(--acc)] outline-none focus:border-[var(--acc)]"
                  placeholder={"paste your ascii art here…\nuse █ ▄ ▀ ░ ▒ # @ or plain text"}
                />
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => setEditor(true)} className={addBtn}>+ add custom ascii art (editor)</button>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setAll(true)} className={ghostBtn}>enable all</button>
        <button onClick={() => setAll(false)} className={ghostBtn}>disable all</button>
        <button onClick={toast} className={deployBtn}>▸ deploy art queue</button>
      </div>

      <FieldForge tab="ascii arts" />

      {editor && (
        <ArtEditor
          onClose={() => setEditor(false)}
          onSave={(name, rows) => {
            const id = cms.addArt(name, rows);
            setEditor(false);
            os.toast(`ART '${name}' ARMED AT PRIORITY 01`);
            window.setTimeout(() => {
              document.querySelector(`[data-art="${id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }, 80);
          }}
        />
      )}
    </div>
  );
}

/* ————— tab: blog ————— */
function BlogTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<CmsPost | null>(null);
  const toast = () => os.toast(isRoot ? "BLOG DEPLOYED — PERSISTED" : "BLOG DEPLOYED (DEMO — RESETS ON REFRESH)");

  const startEdit = (p: CmsPost) => { setEditing(p.id); setDraft({ ...p, tags: [...p.tags], images: [...p.images] }); };
  const startNew = () => {
    const id = cms.addPost();
    const date = new Date().toISOString().slice(0, 10);
    const body = cms.blog.template
      .split("{{title}}").join("untitled_post")
      .split("{{date}}").join(date)
      .split("{{tags}}").join("misc");
    setEditing(id);
    setDraft({ id, title: "untitled_post", date, tags: ["misc"], body, images: [] });
    os.toast("NEW POST CREATED FROM TEMPLATE");
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || !draft) return;
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, 6 - draft.images.length)) {
      if (!f.type.startsWith("image/")) continue;
      try { urls.push(await downscaleImage(f, 1024, 0.8)); } catch { /* skip */ }
    }
    if (urls.length) setDraft((d) => (d ? { ...d, images: [...d.images, ...urls] } : d));
    if (urls.length) os.toast(`${urls.length} IMAGE(S) MOUNTED INTO POST`);
  };

  const onUploadText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const text = String(r.result ?? "");
      const title = f.name.replace(/\.(md|txt|text)$/i, "").replace(/\s+/g, "_");
      const id = `post_${Date.now().toString(36)}`;
      const date = new Date().toISOString().slice(0, 10);
      const post: CmsPost = { id, title, date, tags: ["imported"], body: text, images: [] };
      /* one atomic update — addPost + setPost in sequence would race the closure */
      cms.updateContent({ blog: { ...cms.blog, posts: [post, ...cms.blog.posts] } });
      setEditing(id);
      setDraft(post);
      os.toast(`IMPORTED → ${title}.md`);
    };
    r.readAsText(f);
  };

  const saveDraft = () => {
    if (!draft) return;
    cms.setPost(draft.id, { ...draft });
    setEditing(null);
    setDraft(null);
    toast();
  };

  return (
    <div>
      <SectionHead>formatting template</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        applied to every new post. markers: <span className="text-[var(--acc)]">{"{{title}} {{date}} {{tags}}"}</span> are
        substituted on creation · <span className="text-[var(--acc)]">![0]…![5]</span> mount gallery images ·{" "}
        <span className="text-[var(--acc)]">{"{{form}}"}</span> embeds a visitor feedback form ·{" "}
        <span className="text-[var(--acc)]"># ## &gt; - --- **bold** `code`</span> render as markdown.
      </p>
      <textarea
        value={cms.blog.template}
        onChange={(e) => cms.updateContent({ blog: { ...cms.blog, template: e.target.value } })}
        rows={9}
        spellCheck={false}
        className="w-full resize-y border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 font-mono2 text-[10.5px] leading-[1.35] text-[var(--acc)] outline-none focus:border-[var(--acc)]"
      />

      <SectionHead>{`posts · ${cms.blog.posts.length} on disk`}</SectionHead>
      <div className="flex flex-wrap gap-2">
        <button onClick={startNew} className={ghostBtn}>+ new post from template</button>
        <label className="cursor-pointer border border-[var(--line2)] px-3 py-1.5 text-[9px] uppercase tracking-widest text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
          ▸ upload .md / .txt
          <input type="file" accept=".md,.txt,.text,text/plain,text/markdown" className="hidden" onChange={onUploadText} />
        </label>
      </div>

      <div className="mt-3 space-y-1.5">
        {cms.blog.posts.map((p) => (
          <div key={p.id} className="border border-[var(--line2)] p-2">
            <div className="flex items-center gap-2">
              <span className="text-[var(--acc)]">≣</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10.5px] font-bold text-[var(--txt)]">{p.title}.md</div>
                <div className="truncate text-[8.5px] uppercase tracking-widest text-[var(--faint)]">
                  {p.date} · {p.tags.join(" · ") || "no tags"} · {p.images.length} img
                </div>
              </div>
              <button onClick={() => startEdit(p)} className={ghostBtn}>edit</button>
              <button onClick={() => { cms.removePost(p.id); os.toast(`DELETED → ${p.title}.md`); }}
                className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="delete post">✕</button>
            </div>

            {editing === p.id && draft && (
              <div className="mt-2 space-y-2 border-t border-[var(--line)] pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
                  <Field label="date (yyyy-mm-dd)" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} />
                  <Field label="tags (comma separated)" value={draft.tags.join(", ")}
                    onChange={(v) => setDraft({ ...draft, tags: v.split(",").map((s) => s.trim()).filter(Boolean) })} wide />
                </div>
                <div>
                  <span className="mb-1 block font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">body · markdown + markers</span>
                  <textarea
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    rows={11}
                    spellCheck={false}
                    className="w-full resize-y border border-[var(--line2)] bg-[var(--bg2)] px-2 py-1.5 font-mono2 text-[10.5px] leading-[1.35] text-[var(--txt)] outline-none focus:border-[var(--acc)]"
                  />
                </div>
                <div>
                  <span className="mb-1 block font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">gallery · reference as ![0]…![{Math.max(0, draft.images.length - 1)}]</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {draft.images.map((src, i) => (
                      <div key={i} className="group relative h-14 w-20 border border-[var(--line2)]">
                        <img src={src} alt={`post image ${i}`} className="h-full w-full object-cover" />
                        <span className="absolute left-0 top-0 bg-[var(--bg)] px-1 text-[8px] font-bold text-[var(--acc)]">![{i}]</span>
                        <button onClick={() => setDraft({ ...draft, images: draft.images.filter((_, j) => j !== i) })}
                          className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center border border-[var(--line2)] bg-[var(--bg)] text-[9px] text-[var(--faint)] transition-colors hover:border-[var(--red)] hover:text-[var(--red)]">✕</button>
                      </div>
                    ))}
                    {draft.images.length < 6 && (
                      <label className="grid h-14 w-20 cursor-pointer place-items-center border border-dashed border-[var(--line2)] text-[9px] uppercase tracking-widest text-[var(--faint)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]">
                        + img
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveDraft} className={deployBtn}>▸ save post</button>
                  <button onClick={() => { setEditing(null); setDraft(null); }} className={ghostBtn}>cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {cms.blog.posts.length === 0 && (
          <div className="border border-dashed border-[var(--line2)] p-4 text-center text-[10px] text-[var(--faint)]">
            ~/blog is empty — create the first post from the template.
          </div>
        )}
      </div>

      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy blog</button>
      </div>

      <FieldForge tab="blog" />
    </div>
  );
}

/* ————— tab: desktop (icon layout + renaming) ————— */
const ICON_DEFAULTS: Array<{ id: string; glyph: string; label: string }> = [
  { id: "about", glyph: "▤", label: "about.txt" },
  { id: "projects", glyph: "▦", label: "projects/" },
  { id: "terminal", glyph: ">_", label: "terminal" },
  { id: "readme", glyph: "?", label: "README.md" },
  { id: "blog", glyph: "≣", label: "blog.md" },
];

function DesktopTab() {
  const os = useOS();
  const cms = useCMS();
  const ic = cms.icons;

  return (
    <div>
      <SectionHead>icon arrangement mode</SectionHead>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { m: "auto", g: "⌂", n: "auto", d: "row, bottom-left of the desktop" },
            { m: "free", g: "✥", n: "free grid", d: "drag icons — they snap to cells" },
            { m: "dock", g: "⊞", n: "dock", d: "row / column on any edge" },
          ] as const
        ).map((o) => (
          <button key={o.m} onClick={() => { cms.setIcons({ mode: o.m }); os.toast(`ICON MODE → ${o.n.toUpperCase()}`); }}
            className={`border p-2.5 text-left transition-colors ${ic.mode === o.m ? "border-[var(--acc)] bg-[var(--acc-dim)]" : "border-[var(--line2)] hover:border-[var(--acc)]"}`}>
            <span className={`block text-[15px] ${ic.mode === o.m ? "text-[var(--acc)]" : "text-[var(--dim)]"}`}>{o.g}</span>
            <span className={`mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] ${ic.mode === o.m ? "text-[var(--acc)]" : "text-[var(--txt)]"}`}>{o.n}</span>
            <span className="mt-0.5 block text-[8.5px] leading-snug text-[var(--faint)]">{o.d}</span>
          </button>
        ))}
      </div>

      {ic.mode === "free" && (
        <div className="mt-3 border border-[var(--line2)] bg-[var(--panel2)] px-3 py-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
          hold <span className="text-[var(--acc)]">LMB</span> on any desktop icon and drag — it snaps to the nearest free
          grid cell on release. occupied cells reject the drop.{" "}
          <button onClick={() => { cms.setIcons({ positions: {} }); os.toast("GRID POSITIONS CLEARED"); }}
            className="text-[var(--dim)] underline decoration-dotted transition-colors hover:text-[var(--red)]">
            clear saved positions
          </button>
        </div>
      )}

      {ic.mode === "dock" && (
        <>
          <SectionHead>dock · direction + edge</SectionHead>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-[var(--faint)]">dir</span>
            <button onClick={() => cms.setIcons({ dock: { ...ic.dock, dir: "h" } })}
              className={`pbtn ${ic.dock.dir === "h" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="horizontal row">— h</button>
            <button onClick={() => cms.setIcons({ dock: { ...ic.dock, dir: "v" } })}
              className={`pbtn ${ic.dock.dir === "v" ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title="vertical column">│ v</button>
            <span className="ml-3 text-[9px] uppercase tracking-widest text-[var(--faint)]">edge</span>
            {(
              [
                { e: "top", g: "▲" }, { e: "bottom", g: "▼" }, { e: "left", g: "◧" }, { e: "right", g: "◨" },
              ] as const
            ).map((o) => (
              <button key={o.e} onClick={() => cms.setIcons({ dock: { ...ic.dock, edge: o.e } })}
                className={`pbtn ${ic.dock.edge === o.e ? "border-[var(--acc)] text-[var(--acc)]" : ""}`} title={`dock to ${o.e}`}>{o.g}</button>
            ))}
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-[var(--faint)]">
            the dock auto-positions outside widget rails — it shifts away from whichever rails are armed.
          </p>
        </>
      )}

      <SectionHead>icon labels · rename anything</SectionHead>
      <div className="space-y-1.5">
        {ICON_DEFAULTS.map((d) => (
          <div key={d.id} className="flex items-center gap-2 border border-[var(--line2)] p-2">
            <span className="w-8 text-center font-disp text-[15px] text-[var(--acc)]">{d.glyph}</span>
            <span className="w-20 text-[9px] uppercase tracking-widest text-[var(--faint)]">{d.id}</span>
            <input
              value={ic.names[d.id] ?? d.label}
              onChange={(e) => cms.setIcons({ names: { ...ic.names, [d.id]: e.target.value } })}
              className={`min-w-0 flex-1 ${inputCls}`}
            />
            {(ic.names[d.id] ?? "") !== "" && ic.names[d.id] !== d.label && (
              <button onClick={() => { const n = { ...ic.names }; delete n[d.id]; cms.setIcons({ names: n }); }}
                className="text-[9px] uppercase tracking-widest text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="reset to default">↺</button>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px] text-[var(--faint)]">labels update live on the desktop + tooltips.</p>

      <FieldForge tab="desktop" />
    </div>
  );
}

/* ————— tab: theme ————— */
function ThemeTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const toast = () => os.toast(isRoot ? "DEFAULT THEME DEPLOYED — PERSISTED" : "DEFAULT THEME DEPLOYED (DEMO — RESETS ON REFRESH)");

  return (
    <div>
      <SectionHead>default phosphor theme</SectionHead>
      <p className="mb-2 text-[9.5px] text-[var(--faint)]">applied on next boot — and applied right now, so you can preview it.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {THEMES.map((t) => (
          <button key={t} onClick={() => { cms.updateContent({ defaultTheme: t }); os.setTheme(t); }}
            className={`border p-3 text-left transition-colors ${cms.defaultTheme === t ? "border-[var(--acc)] bg-[var(--acc-dim)]" : "border-[var(--line2)] hover:border-[var(--acc)]"}`}>
            <span className="mb-2 block h-3 w-full"
              style={{ background: THEME_HEX[t], opacity: cms.defaultTheme === t ? 1 : 0.4, boxShadow: cms.defaultTheme === t ? `0 0 10px ${THEME_HEX[t]}` : undefined }} />
            <span className={`text-[10px] font-bold uppercase tracking-[0.22em] ${cms.defaultTheme === t ? "text-[var(--acc)]" : "text-[var(--dim)]"}`}>{t}</span>
            {cms.defaultTheme === t && <span className="ml-1 text-[9px] text-[var(--acc)]">● default</span>}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy default theme</button>
      </div>

      <FieldForge tab="theme" />
    </div>
  );
}
