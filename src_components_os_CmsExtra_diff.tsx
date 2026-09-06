--- src/components/os/CmsExtra.tsx (原始)


+++ src/components/os/CmsExtra.tsx (修改后)
import { useState } from "react";
import { useOS } from "./ctx";
import { useCMS } from "../../lib/cms";
import type { CmsAchievement, CmsBriefField, CmsBriefFieldType } from "../../lib/cms";
import { SectionHead, FieldForge } from "./CmsWin";

const deployBtn = "frow border border-[var(--acc)] bg-[var(--acc-dim)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--acc)]";
const addBtn = "frow mt-3 w-full border border-dashed border-[var(--line2)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:bg-[var(--acc-dim)] hover:text-[var(--acc)]";
const inputCls = "w-full border border-[var(--line2)] bg-[var(--panel2)] px-2 py-1.5 font-mono2 text-[11px] text-[var(--txt)] outline-none transition-colors focus:border-[var(--acc)]";

/* ————— tab: trophies / achievements ————— */
export function AchieveTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const toast = () => os.toast(isRoot ? "TROPHIES DEPLOYED — PERSISTED" : "TROPHIES DEPLOYED (DEMO — RESETS ON REFRESH)");

  const set = (id: string, patch: Partial<CmsAchievement>) =>
    cms.updateContent({ achievements: cms.achievements.map((a) => (a.id === id ? { ...a, ...patch } : a)) });

  return (
    <div>
      <SectionHead>trophies.sys · achievements ledger</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        what you conquered, when, and where. rendered live by the <span className="text-[var(--amber)]">★ trophies.sys</span> widget.
      </p>
      <div className="space-y-2">
        {cms.achievements.map((a) => (
          <div key={a.id} className="border border-[var(--line2)] p-2">
            <div className="grid grid-cols-[64px_96px_1fr_22px] items-center gap-2">
              <input value={a.year} onChange={(e) => set(a.id, { year: e.target.value })} placeholder="2026" className={inputCls} title="when" />
              <input value={a.field} onChange={(e) => set(a.id, { field: e.target.value })} placeholder="sphere" className={inputCls} title="sphere / category" />
              <input value={a.title} onChange={(e) => set(a.id, { title: e.target.value })} placeholder="achievement title" className={inputCls} title="achievement" />
              <button
                onClick={() => cms.updateContent({ achievements: cms.achievements.filter((x) => x.id !== a.id) })}
                className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="remove trophy"
              >
                ✕
              </button>
            </div>
            <input
              value={a.detail} onChange={(e) => set(a.id, { detail: e.target.value })} placeholder="the story behind it…"
              className={`mt-1.5 ${inputCls}`} title="detail"
            />
          </div>
        ))}
        {cms.achievements.length === 0 && (
          <div className="border border-dashed border-[var(--line2)] p-4 text-center text-[10px] text-[var(--faint)]">
            shelf is empty. suspiciously humble.
          </div>
        )}
      </div>
      <button
        onClick={() => cms.updateContent({ achievements: [...cms.achievements, { id: `a${Date.now().toString(36)}`, year: "2026", field: "new", title: "fresh trophy", detail: "…" }] })}
        className={addBtn}
      >
        + add trophy
      </button>
      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy trophies</button>
      </div>
      <FieldForge tab="achieve" />
    </div>
  );
}

/* ————— tab: briefs / order templates ————— */
const FIELD_TYPES: Array<{ t: CmsBriefFieldType; n: string }> = [
  { t: "line", n: "line" },
  { t: "text", n: "text" },
  { t: "select", n: "select" },
  { t: "toggle", n: "toggle" },
];

export function BriefsTab() {
  const os = useOS();
  const cms = useCMS();
  const isRoot = cms.mode === "root";
  const [sel, setSel] = useState(cms.briefs[0]?.id ?? "");
  const tpl = cms.briefs.find((t) => t.id === sel) ?? cms.briefs[0];
  const toast = () => os.toast(isRoot ? "BRIEF TEMPLATES DEPLOYED — PERSISTED" : "BRIEF TEMPLATES DEPLOYED (DEMO — RESETS ON REFRESH)");

  if (!tpl) {
    return (
      <div>
        <SectionHead>order.sys · brief templates</SectionHead>
        <button
          onClick={() => cms.updateContent({ briefs: [{ id: `b${Date.now().toString(36)}`, category: "new brief", fields: [{ id: "f1", label: "the idea", type: "text" }] }] })}
          className={addBtn}
        >
          + create the first template
        </button>
      </div>
    );
  }

  const patchTpl = (patch: Partial<typeof tpl>) =>
    cms.updateContent({ briefs: cms.briefs.map((t) => (t.id === tpl.id ? { ...t, ...patch } : t)) });
  const setField = (fid: string, patch: Partial<CmsBriefField>) =>
    patchTpl({ fields: tpl.fields.map((f) => (f.id === fid ? { ...f, ...patch } : f)) });

  return (
    <div>
      <SectionHead>order.sys · brief templates</SectionHead>
      <p className="mb-2 text-[9.5px] leading-relaxed text-[var(--faint)]">
        visitors pick a category in the <span className="text-[var(--acc)]">✚ order.sys</span> widget — the matching brief opens.
        design the questions per category below.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {cms.briefs.map((t) => (
          <button key={t.id} onClick={() => setSel(t.id)}
            className={`border px-2 py-1 text-[10px] transition-colors ${t.id === tpl.id ? "border-[var(--acc)] bg-[var(--acc-dim)] font-bold text-[var(--acc)]" : "border-[var(--line2)] text-[var(--dim)] hover:border-[var(--acc)] hover:text-[var(--txt)]"}`}>
            {t.category}
          </button>
        ))}
        <button
          onClick={() => {
            const id = `b${Date.now().toString(36)}`;
            cms.updateContent({ briefs: [...cms.briefs, { id, category: "new brief", fields: [{ id: "f1", label: "the idea", type: "text" }] }] });
            setSel(id);
            os.toast("TEMPLATE ADDED — NAME THE CATEGORY");
          }}
          className="border border-dashed border-[var(--line2)] px-2 py-1 text-[10px] text-[var(--dim)] transition-colors hover:border-[var(--acc)] hover:text-[var(--acc)]"
        >
          + template
        </button>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_22px] items-center gap-2">
        <label>
          <span className="mb-1 block font-mono2 text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">category name</span>
          <input value={tpl.category} onChange={(e) => patchTpl({ category: e.target.value })} className={inputCls} />
        </label>
        {cms.briefs.length > 1 && (
          <button
            onClick={() => {
              const rest = cms.briefs.filter((t) => t.id !== tpl.id);
              cms.updateContent({ briefs: rest });
              setSel(rest[0]?.id ?? "");
              os.toast("TEMPLATE DELETED");
            }}
            className="mt-4 px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="delete template"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {tpl.fields.map((f, i) => (
          <div key={f.id} className="border border-[var(--line2)] p-2">
            <div className="grid grid-cols-[24px_1fr_84px_22px] items-center gap-2">
              <span className="text-center text-[9px] text-[var(--faint)]">{String(i + 1).padStart(2, "0")}</span>
              <input value={f.label} onChange={(e) => setField(f.id, { label: e.target.value })} placeholder="question label" className={inputCls} />
              <select
                value={f.type}
                onChange={(e) => setField(f.id, { type: e.target.value as CmsBriefFieldType })}
                className={`${inputCls} uppercase`}
              >
                {FIELD_TYPES.map((ft) => <option key={ft.t} value={ft.t}>{ft.n}</option>)}
              </select>
              <button
                onClick={() => patchTpl({ fields: tpl.fields.filter((x) => x.id !== f.id) })}
                className="px-1 text-[var(--faint)] transition-colors hover:text-[var(--red)]" title="remove question"
              >
                ✕
              </button>
            </div>
            {f.type === "select" && (
              <input
                value={(f.options ?? []).join(", ")}
                onChange={(e) => setField(f.id, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                placeholder="option a, option b, option c"
                className={`mt-1.5 ${inputCls}`}
              />
            )}
            {(f.type === "line" || f.type === "text") && (
              <input
                value={f.placeholder ?? ""}
                onChange={(e) => setField(f.id, { placeholder: e.target.value })}
                placeholder="placeholder hint (optional)"
                className={`mt-1.5 ${inputCls}`}
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => patchTpl({ fields: [...tpl.fields, { id: `f${Date.now().toString(36)}`, label: "new question", type: "line" }] })}
        className={addBtn}
      >
        + add question
      </button>

      <div className="mt-4">
        <button onClick={toast} className={deployBtn}>▸ deploy brief templates</button>
      </div>
    </div>
  );
}
