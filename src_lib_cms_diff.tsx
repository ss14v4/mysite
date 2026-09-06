--- src/lib/cms.tsx (原始)
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/* ——— VolkovOS micro-CMS ———
   demo session (admin / qwerty123)  → edits live in memory only, reset on refresh
   root session (changeable creds)   → edits persist in localStorage            */

export interface CmsContact { id: string; label: string; value: string; }
export interface CmsProfile {
  name: string; role: string; handle: string; location: string;
  expLine: string; statusLine: string; availability: string; bio: string;
  contacts: CmsContact[];
}
export interface CmsProject {
  id: string; index: string; title: string; category: string; year: string;
  stack: string[]; summary: string; role: string; image: string; accent: string;
  link: string;
  gallery: string[];
  metrics: { value: string; label: string }[];
}
export interface CmsTrack { t: string; a: string; d: number; src?: string; fileName?: string; }
export interface CmsStat { k: string; v: number; }
export interface CmsArt { id: string; name: string; enabled: boolean; rows?: string[]; }
export interface CmsField { id: string; type: FieldType; label: string; value: string | boolean; }
export type FieldType = "line" | "text" | "toggle" | "number";

export type WidgetId = "operator" | "player" | "git" | "video" | "chat" | "sysmon" | "oracle";
export interface CmsWidgetEntry { id: WidgetId; dock: "left" | "right" | "top"; enabled: boolean; }

export interface CmsIcons {
  mode: "auto" | "free" | "dock";
  dock: { dir: "h" | "v"; edge: "top" | "bottom" | "left" | "right" };
  positions: Record<string, { x: number; y: number }>;
  names: Record<string, string>;
}
export interface CmsPost { id: string; title: string; date: string; tags: string[]; body: string; images: string[]; }
export interface CmsBlog { template: string; posts: CmsPost[]; }
export interface CmsOperatorMedia { media: string | null; kind: "image" | "video"; name: string; }

export interface CmsContent {
  profile: CmsProfile;
  projects: CmsProject[];
  tracks: CmsTrack[];
  stats: CmsStat[];
  arts: CmsArt[];
  defaultTheme: string;
  videoSrc: string | null;
  videoName: string;
  operator: CmsOperatorMedia;
  widgets: { order: WidgetId[]; cfg: Record<string, CmsWidgetEntry> };
  icons: CmsIcons;
  blog: CmsBlog;
  customFields: Record<string, CmsField[]>;
}

const ART_IDS = [
  "skull", "lenny", "heart", "doge", "rick", "thumbs", "coffee", "cat",
  "ghost", "rocket", "frog", "lol", "gg", "alien", "fire", "mushroom",
  "shrug", "wakeup", "rabbit", "pacman", "42", "boom", "spider", "omg",
];

const IMG = {
  pulse: "https://image.qwenlm.ai/generated-images/da9d99d8-85b6-4ba5-91d8-d367e287cc24/_result.png",
  karta: "https://image.qwenlm.ai/generated-images/4aa22f1a-094a-4840-a50b-b4596a4725e1/_result.png",
  ledger: "https://image.qwenlm.ai/generated-images/4f76a739-551b-4782-a54a-a921c0418940/_result.png",
  bloom: "https://image.qwenlm.ai/generated-images/4b45902b-885f-4e54-bc1c-399f406152b2/_result.png",
  noct: "https://image.qwenlm.ai/generated-images/28107350-a0c2-4157-b8c5-25b7e68422f2/_result.png",
  atlas: "https://image.qwenlm.ai/generated-images/3c9c03e4-e0a8-482e-9f0f-c326d6414c17/_result.png",
};

export const OPERATOR_AVATAR = "https://image.qwenlm.ai/generated-images/614bd58f-2126-42f4-ab93-3eca515f60ac/_result.png";

const BLOG_TEMPLATE = `# {{title}}

> One sharp lead sentence that hooks the reader.

## the gist

Body text goes here. Write it like you talk — short lines, no corporate fog.

- point one
- point two

![0]

## deeper

More text. Use **bold** for emphasis and \`code\` for the technical bits.

---

tags: {{tags}}

{{form}}`;

export const DEFAULT_CONTENT: CmsContent = {
  profile: {
    name: "ALEX VOLKOV",
    role: "full-stack web app developer",
    handle: "alex@volkov.dev",
    location: "planet Earth, UTC+3",
    expLine: "6+ yrs · 20+ launches",
    statusLine: "OPEN TO WORK",
    availability: "taking Q3 2026 projects · remote worldwide",
    bio: "I design and build web applications end-to-end — schema, API, auth, realtime, and the kind of UI that makes people slow down and look. Six years in, 20+ products shipped: dashboards, SaaS tools, e-commerce, interactive experiences. My favourite stack is the one that ships on Friday.",
    contacts: [
      { id: "c1", label: "github", value: "github.com/alexvolkov" },
      { id: "c2", label: "telegram", value: "@alexvolkov_dev" },
      { id: "c3", label: "linkedin", value: "in/alex-volkov" },
    ],
  },
  projects: [
    {
      id: "pulseboard", index: "01", title: "Pulseboard", category: "Realtime Analytics SaaS", year: "2025",
      stack: ["React", "TypeScript", "WebSockets", "ClickHouse", "Node"],
      summary: "A realtime analytics platform streaming 40k events/sec into live dashboards. Custom canvas charting engine keeps 60fps even with 1M-point series, with anomaly alerts wired into Slack and PagerDuty.",
      role: "Full-stack build · charting engine · infra",
      image: IMG.pulse, accent: "#ff9d2e", link: "https://pulseboard.example.com",
      gallery: [IMG.pulse, IMG.atlas],
      metrics: [
        { value: "40k", label: "events / sec" },
        { value: "60fps", label: "1M-point charts" },
        { value: "38%", label: "faster incident response" },
      ],
    },
    {
      id: "karta", index: "02", title: "Karta", category: "Travel Planning App", year: "2025",
      stack: ["Next.js", "Mapbox GL", "Supabase", "tRPC"],
      summary: "Collaborative trip planner with a shared live map, drag-and-drop itinerary builder and offline city packs. Realtime presence shows exactly where your travel mates are pinning.",
      role: "Product engineering · realtime sync · PWA",
      image: IMG.karta, accent: "#3f6b4f", link: "https://karta.example.com",
      gallery: [IMG.karta],
      metrics: [
        { value: "120k", label: "trips planned" },
        { value: "4.9★", label: "average rating" },
        { value: "<1s", label: "sync latency" },
      ],
    },
    {
      id: "ledgerline", index: "03", title: "Ledgerline", category: "Fintech Dashboard", year: "2024",
      stack: ["React", "D3", "PostgreSQL", "Go"],
      summary: "Cashflow intelligence for founders: bank sync, runway projections and a board-report generator. The area charts are hand-rolled D3 with semantic zoom.",
      role: "Design engineering · data viz · bank integrations",
      image: IMG.ledger, accent: "#1f4a38", link: "",
      gallery: [IMG.ledger],
      metrics: [
        { value: "$2.1B", label: "transactions parsed" },
        { value: "14", label: "bank integrations" },
        { value: "99.98%", label: "sync reliability" },
      ],
    },
    {
      id: "bloomful", index: "04", title: "Bloomful", category: "Plant Shop E-commerce", year: "2024",
      stack: ["Remix", "Stripe", "Sanity", "Framer Motion"],
      summary: "A boutique plant store where the cart is a greenhouse: add a monstera and the whole UI grows a leaf. Checkout converts at 4.8% — double the industry norm.",
      role: "Full-stack · creative direction · motion system",
      image: IMG.bloom, accent: "#2e5233", link: "",
      gallery: [IMG.bloom],
      metrics: [
        { value: "4.8%", label: "checkout conversion" },
        { value: "31k", label: "plants adopted" },
        { value: "0.9s", label: "LCP on 3G" },
      ],
    },
    {
      id: "nocturne", index: "05", title: "Nocturne", category: "Music Streaming Player", year: "2023",
      stack: ["React", "Web Audio API", "IndexedDB", "Rust/WASM"],
      summary: "A browser-native player that decodes lossless audio through a Rust DSP pipeline compiled to WASM. Waveforms are generated per-track, crossfades are beat-matched.",
      role: "Audio engine · WASM integration · UI",
      image: IMG.noct, accent: "#d33f2e", link: "",
      gallery: [IMG.noct],
      metrics: [
        { value: "24bit", label: "lossless decoding" },
        { value: "-14LUFS", label: "normalization" },
        { value: "18ms", label: "engine latency" },
      ],
    },
    {
      id: "atlas", index: "06", title: "Atlas CRM", category: "B2B Sales Platform", year: "2023",
      stack: ["Vue → React rewrite", "NestJS", "PostgreSQL", "Redis"],
      summary: "Pipeline CRM rebuilt from a legacy Vue monolith into a modular React app mid-flight — zero downtime migration of 4M records while the sales team kept selling.",
      role: "Tech lead · migration architecture · frontend",
      image: IMG.atlas, accent: "#2451c7", link: "",
      gallery: [IMG.atlas],
      metrics: [
        { value: "4M", label: "records migrated live" },
        { value: "0", label: "downtime minutes" },
        { value: "2.3×", label: "faster deal cycles" },
      ],
    },
  ],
  tracks: [
    { t: "Neon Rain", a: "Volkov Unit", d: 212 },
    { t: "Compile at Midnight", a: "Syntax Ghost", d: 187 },
    { t: "Phosphor Dreams", a: "CRT Lullaby", d: 244 },
    { t: "sudo make me a sandwich", a: "The Segfaults", d: 158 },
  ],
  stats: [
    { k: "frontend", v: 95 },
    { k: "backend", v: 88 },
    { k: "motion / css", v: 84 },
    { k: "devops", v: 71 },
    { k: "coffee intake", v: 99 },
  ],
  arts: ART_IDS.map((id) => ({ id, name: id, enabled: true })),
  defaultTheme: "green",
  videoSrc: null,
  videoName: "",
  operator: { media: null, kind: "image", name: "" },
  widgets: {
    order: ["operator", "player", "git", "video", "chat", "sysmon", "oracle"],
    cfg: {
      operator: { id: "operator", dock: "right", enabled: true },
      player: { id: "player", dock: "right", enabled: true },
      git: { id: "git", dock: "right", enabled: true },
      video: { id: "video", dock: "left", enabled: true },
      chat: { id: "chat", dock: "left", enabled: true },
      sysmon: { id: "sysmon", dock: "right", enabled: true },
      oracle: { id: "oracle", dock: "left", enabled: true },
    },
  },
  icons: {
    mode: "auto",
    dock: { dir: "h", edge: "bottom" },
    positions: {},
    names: {},
  },
  blog: {
    template: BLOG_TEMPLATE,
    posts: [
      {
        id: "p1",
        title: "hello_world",
        date: "2026-02-15",
        tags: ["meta", "webdev"],
        images: [IMG.pulse],
        body: `# hello_world

> Every OS needs a first process. This one renders paragraphs.

## why an OS-shaped portfolio

Because "scroll, look at three cards, close tab" is a tragedy in four acts.
A portfolio should behave like the work it shows — mine ships interfaces people
**poke at**, so the portfolio is pokable: draggable windows, a real terminal,
rain that assembles memes when you stop moving.

![0]

## what lives here

- about.txt — the dossier
- projects/ — six shipped apps with receipts
- terminal — try \`neofetch\`, then \`theme amber\`
- cms.sys — the rabbit hole (guest pass is printed on the door)

---

tags: meta, webdev

{{form}}`,
      },
      {
        id: "p2",
        title: "shipping_on_fridays",
        date: "2026-01-30",
        tags: ["process", "opinion"],
        images: [],
        body: `# shipping_on_fridays

> "Never deploy on Friday" is fear wearing a hoodie.

## the argument

Friday deploys get a bad name from teams that deploy **surprises**.
If your release is boring — feature-flagged, reversible, observed —
then Friday is just a weekday with better pizza.

## the rules that make it boring

- every merge trains for production behind a flag
- rollback is one command, not a meeting
- dashboards alert before users tweet
- changelog is written **before** the code is merged

## the result

My favourite stack is the one that ships on Friday — because by Monday
the feedback is already in, and Monday-me is smarter than Friday-me.

---

tags: process, opinion

{{form}}`,
      },
      {
        id: "p3",
        title: "ascii_rain_anatomy",
        date: "2026-01-12",
        tags: ["creative-coding", "canvas"],
        images: [IMG.noct],
        body: `# ascii_rain_anatomy

> The memes are not falling. They are **waiting**.

## the trick

The rain is a dumb particle system — a few hundred glyphs with velocity and
fade. The magic is the second layer: when your cursor idles over empty
desktop, the rain's drop positions are re-targeted onto the glyph cells of a
24-frame meme archive. Skulls, frogs, a rabbit. Each glyph eases into place
with its own delay, so the picture **condenses** instead of appearing.

![0]

## numbers

- 24 templates in the registry, priority-ordered from cms.sys
- ~900 particles re-targeted per assembly, cubic ease-out
- disperse on pointermove: gravity 300px/s², alpha bleed 0.85/s

Move the mouse and the art falls apart — literally. That part was free.

---

tags: creative-coding, canvas

{{form}}`,
      },
    ],
  },
  customFields: { about: [], projects: [], widgets: [], playlist: [], "ascii arts": [], theme: [], blog: [], desktop: [] },
};

export type CmsMode = "guest" | "demo" | "root";

const LS_CONTENT = "volkovos.cms.content.v3";
const LS_CREDS = "volkovos.cms.creds.v1";
const DEMO_USER = "admin";
const DEMO_PASS = "qwerty123";
const ROOT_USER = "u53r_#s7en";
const ROOT_PASS = "suka_blyat_nahui";

interface StoredCreds { u: string; p: string; }

function loadCreds(): StoredCreds {
  try {
    const raw = localStorage.getItem(LS_CREDS);
    if (raw) {
      const parsed = JSON.parse(atob(raw)) as StoredCreds;
      if (parsed && typeof parsed.u === "string" && typeof parsed.p === "string") return parsed;
    }
  } catch { /* corrupted — fall back */ }
  return { u: ROOT_USER, p: ROOT_PASS };
}

/* defensive merge — any missing/broken piece falls back to defaults */
function loadContent(): CmsContent {
  const d = DEFAULT_CONTENT;
  try {
    const raw = localStorage.getItem(LS_CONTENT);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CmsContent>;
      const profile = { ...d.profile, ...(parsed.profile ?? {}) };
      if (!Array.isArray(profile.contacts)) profile.contacts = d.profile.contacts;
      const widgets = parsed.widgets && Array.isArray(parsed.widgets.order)
        ? { order: parsed.widgets.order, cfg: { ...d.widgets.cfg, ...(parsed.widgets.cfg ?? {}) } }
        : d.widgets;
      return {
        profile,
        projects: Array.isArray(parsed.projects) && parsed.projects.length ? parsed.projects : d.projects,
        tracks: Array.isArray(parsed.tracks) ? parsed.tracks : d.tracks,
        stats: Array.isArray(parsed.stats) ? parsed.stats : d.stats,
        arts: Array.isArray(parsed.arts) && parsed.arts.length ? parsed.arts : d.arts,
        defaultTheme: typeof parsed.defaultTheme === "string" ? parsed.defaultTheme : d.defaultTheme,
        videoSrc: typeof parsed.videoSrc === "string" ? parsed.videoSrc : null,
        videoName: typeof parsed.videoName === "string" ? parsed.videoName : "",
        operator: parsed.operator && typeof parsed.operator === "object" ? { ...d.operator, ...parsed.operator } : d.operator,
        widgets,
        icons: { ...d.icons, ...(parsed.icons ?? {}), dock: { ...d.icons.dock, ...(parsed.icons?.dock ?? {}) }, positions: parsed.icons?.positions ?? {}, names: parsed.icons?.names ?? {} },
        blog: parsed.blog ? { template: typeof parsed.blog.template === "string" ? parsed.blog.template : d.blog.template, posts: Array.isArray(parsed.blog.posts) ? parsed.blog.posts : d.blog.posts } : d.blog,
        customFields: { ...d.customFields, ...(parsed.customFields ?? {}) },
      };
    }
  } catch { /* corrupted — defaults */ }
  return d;
}

interface CmsApi {
  content: CmsContent;
  profile: CmsProfile;
  projects: CmsProject[];
  tracks: CmsTrack[];
  stats: CmsStat[];
  arts: CmsArt[];
  defaultTheme: string;
  videoSrc: string | null;
  videoName: string;
  operator: CmsOperatorMedia;
  widgets: CmsContent["widgets"];
  widgetCfg: CmsWidgetEntry[];
  icons: CmsIcons;
  blog: CmsBlog;
  customFields: Record<string, CmsField[]>;
  mode: CmsMode;
  sessionUser: string | null;
  persistError: boolean;
  login: (user: string, pass: string) => CmsMode | null;
  logout: () => void;
  updateContent: (patch: Partial<CmsContent>) => void;
  saveCreds: (u: string, p: string) => void;
  resetContent: () => void;
  setWidget: (id: WidgetId, patch: Partial<Omit<CmsWidgetEntry, "id">>) => void;
  moveWidget: (index: number, dir: -1 | 1) => void;
  addTrack: () => void;
  removeTrack: (index: number) => void;
  addField: (tab: string, type: FieldType, label: string) => void;
  setFieldValue: (tab: string, fieldId: string, value: string | boolean) => void;
  removeField: (tab: string, fieldId: string) => void;
  addProject: () => string;
  removeProject: (id: string) => void;
  addArt: (name: string, rows: string[]) => string;
  removeArt: (id: string) => void;
  setArt: (id: string, patch: Partial<CmsArt>) => void;
  setIcons: (patch: Partial<CmsIcons>) => void;
  addPost: () => string;
  removePost: (id: string) => void;
  setPost: (id: string, patch: Partial<CmsPost>) => void;
}

const CmsContext = createContext<CmsApi>(null!);
export const useCMS = () => useContext(CmsContext);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<CmsContent>(loadContent);
  const [mode, setMode] = useState<CmsMode>("guest");
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const [persistError, setPersistError] = useState(false);

  const login = useCallback((user: string, pass: string): CmsMode | null => {
    const creds = loadCreds();
    if (user === creds.u && pass === creds.p) { setMode("root"); setSessionUser(user); return "root"; }
    if (user === DEMO_USER && pass === DEMO_PASS) { setMode("demo"); setSessionUser(user); return "demo"; }
    return null;
  }, []);

  const logout = useCallback(() => { setMode("guest"); setSessionUser(null); }, []);

  const updateContent = useCallback((patch: Partial<CmsContent>) => {
    setContent((prev) => {
      const next = { ...prev, ...patch };
      if (mode === "root") {
        try {
          localStorage.setItem(LS_CONTENT, JSON.stringify(next));
          setPersistError(false);
        } catch {
          setPersistError(true); // quota exceeded — edits stay in memory
        }
      }
      return next;
    });
  }, [mode]);

  const saveCreds = useCallback((u: string, p: string) => {
    try { localStorage.setItem(LS_CREDS, btoa(JSON.stringify({ u, p }))); } catch { /* full */ }
  }, []);

  const resetContent = useCallback(() => {
    try { localStorage.removeItem(LS_CONTENT); } catch { /* ignore */ }
    setPersistError(false);
    setContent(DEFAULT_CONTENT);
  }, []);

  /* widgets */
  const setWidget = useCallback((id: WidgetId, patch: Partial<Omit<CmsWidgetEntry, "id">>) => {
    setContent((prev) => {
      const cfg = { ...prev.widgets.cfg, [id]: { ...prev.widgets.cfg[id], ...patch, id } };
      const next = { ...prev, widgets: { ...prev.widgets, cfg } };
      if (mode === "root") { try { localStorage.setItem(LS_CONTENT, JSON.stringify(next)); } catch { setPersistError(true); } }
      return next;
    });
  }, [mode]);

  const moveWidget = useCallback((index: number, dir: -1 | 1) => {
    setContent((prev) => {
      const order = [...prev.widgets.order];
      const j = index + dir;
      if (j < 0 || j >= order.length) return prev;
      [order[index], order[j]] = [order[j], order[index]];
      const next = { ...prev, widgets: { ...prev.widgets, order } };
      if (mode === "root") { try { localStorage.setItem(LS_CONTENT, JSON.stringify(next)); } catch { setPersistError(true); } }
      return next;
    });
  }, [mode]);

  /* tracks */
  const addTrack = useCallback(() => {
    updateContent({ tracks: [...content.tracks, { t: "untitled_track", a: "Unknown Daemon", d: 180 }] });
  }, [content.tracks, updateContent]);

  const removeTrack = useCallback((index: number) => {
    updateContent({ tracks: content.tracks.filter((_, i) => i !== index) });
  }, [content.tracks, updateContent]);

  /* field forge */
  const patchFields = useCallback((fn: (prev: CmsContent) => CmsContent) => {
    setContent((prev) => {
      const next = fn(prev);
      if (mode === "root") { try { localStorage.setItem(LS_CONTENT, JSON.stringify(next)); } catch { setPersistError(true); } }
      return next;
    });
  }, [mode]);

  const addField = useCallback((tab: string, type: FieldType, label: string) => {
    const f: CmsField = { id: `f_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4)}`, type, label, value: type === "toggle" ? false : type === "number" ? "0" : "" };
    patchFields((prev) => ({ ...prev, customFields: { ...prev.customFields, [tab]: [...(prev.customFields[tab] ?? []), f] } }));
  }, [patchFields]);

  const setFieldValue = useCallback((tab: string, fieldId: string, value: string | boolean) => {
    patchFields((prev) => ({ ...prev, customFields: { ...prev.customFields, [tab]: (prev.customFields[tab] ?? []).map((f) => (f.id === fieldId ? { ...f, value } : f)) } }));
  }, [patchFields]);

  const removeField = useCallback((tab: string, fieldId: string) => {
    patchFields((prev) => ({ ...prev, customFields: { ...prev.customFields, [tab]: (prev.customFields[tab] ?? []).filter((f) => f.id !== fieldId) } }));
  }, [patchFields]);

  /* projects */
  const addProject = useCallback((): string => {
    const id = `app_${Date.now().toString(36)}`;
    const idx = String(content.projects.length + 1).padStart(2, "0");
    const p: CmsProject = {
      id, index: idx, title: "Untitled App", category: "Web Application", year: "2026",
      stack: ["React", "TypeScript"], summary: "A brand new project — fill in the story, stack the metrics, mount a screenshot.",
      role: "Full-stack build", image: "", accent: "#46f084", link: "", gallery: [],
      metrics: [{ value: "v0.1", label: "status" }, { value: "∞", label: "potential" }, { value: "100%", label: "love" }],
    };
    updateContent({ projects: [...content.projects, p] });
    return id;
  }, [content.projects, updateContent]);

  const removeProject = useCallback((id: string) => {
    if (content.projects.length <= 1) return;
    updateContent({ projects: content.projects.filter((p) => p.id !== id) });
  }, [content.projects, updateContent]);

  /* arts */
  const addArt = useCallback((name: string, rows: string[]): string => {
    const id = `art_${Date.now().toString(36)}`;
    const a: CmsArt = { id, name: name.trim() || "custom art", enabled: true, rows: rows.slice(0, 24) };
    updateContent({ arts: [a, ...content.arts] });
    return id;
  }, [content.arts, updateContent]);

  const removeArt = useCallback((id: string) => {
    updateContent({ arts: content.arts.filter((a) => a.id !== id) });
  }, [content.arts, updateContent]);

  const setArt = useCallback((id: string, patch: Partial<CmsArt>) => {
    updateContent({ arts: content.arts.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  }, [content.arts, updateContent]);

  /* icons */
  const setIcons = useCallback((patch: Partial<CmsIcons>) => {
    updateContent({ icons: { ...content.icons, ...patch } });
  }, [content.icons, updateContent]);

  /* blog */
  const addPost = useCallback((): string => {
    const id = `post_${Date.now().toString(36)}`;
    const date = new Date().toISOString().slice(0, 10);
    const body = content.blog.template
      .split("{{title}}").join("untitled_post")
      .split("{{date}}").join(date)
      .split("{{tags}}").join("misc");
    const post: CmsPost = { id, title: "untitled_post", date, tags: ["misc"], body, images: [] };
    updateContent({ blog: { ...content.blog, posts: [post, ...content.blog.posts] } });
    return id;
  }, [content.blog, updateContent]);

  const removePost = useCallback((id: string) => {
    updateContent({ blog: { ...content.blog, posts: content.blog.posts.filter((p) => p.id !== id) } });
  }, [content.blog, updateContent]);

  const setPost = useCallback((id: string, patch: Partial<CmsPost>) => {
    updateContent({ blog: { ...content.blog, posts: content.blog.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) } });
  }, [content.blog, updateContent]);

  const widgetCfg = useMemo<CmsWidgetEntry[]>(
    () => content.widgets.order.map((id) => content.widgets.cfg[id]).filter(Boolean),
    [content.widgets]
  );

  const api = useMemo<CmsApi>(() => ({
    content,
    profile: content.profile,
    projects: content.projects,
    tracks: content.tracks,
    stats: content.stats,
    arts: content.arts,
    defaultTheme: content.defaultTheme,
    videoSrc: content.videoSrc,
    videoName: content.videoName,
    operator: content.operator,
    widgets: content.widgets,
    widgetCfg,
    icons: content.icons,
    blog: content.blog,
    customFields: content.customFields,
    mode, sessionUser, persistError,
    login, logout, updateContent, saveCreds, resetContent,
    setWidget, moveWidget, addTrack, removeTrack,
    addField, setFieldValue, removeField,
    addProject, removeProject, addArt, removeArt, setArt, setIcons,
    addPost, removePost, setPost,
  }), [content, widgetCfg, mode, sessionUser, persistError, login, logout, updateContent, saveCreds, resetContent, setWidget, moveWidget, addTrack, removeTrack, addField, setFieldValue, removeField, addProject, removeProject, addArt, removeArt, setArt, setIcons, addPost, removePost, setPost]);

  return <CmsContext.Provider value={api}>{children}</CmsContext.Provider>;
}

/* ——— shared file helpers ——— */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function downscaleImage(file: File, maxW = 1280, q = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) { reject(new Error("not an image")); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(""); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", q));
    };
    img.onerror = reject;
    img.src = url;
  });
}


+++ src/lib/cms.tsx (修改后)
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/* ——— VolkovOS micro-CMS ———
   demo session (admin / qwerty123)  → edits live in memory only, reset on refresh
   root session (changeable creds)   → edits persist in localStorage            */

export interface CmsContact { id: string; label: string; value: string; }
export interface CmsProfile {
  name: string; role: string; handle: string; location: string;
  expLine: string; statusLine: string; availability: string; bio: string;
  contacts: CmsContact[];
}
export interface CmsProject {
  id: string; index: string; title: string; category: string; year: string;
  stack: string[]; summary: string; role: string; image: string; accent: string;
  link: string;
  gallery: string[];
  metrics: { value: string; label: string }[];
}
export interface CmsTrack { t: string; a: string; d: number; src?: string; fileName?: string; }
export interface CmsStat { k: string; v: number; }
export interface CmsArt { id: string; name: string; enabled: boolean; rows?: string[]; }
export interface CmsField { id: string; type: FieldType; label: string; value: string | boolean; }
export type FieldType = "line" | "text" | "toggle" | "number";

export type WidgetId = "operator" | "player" | "git" | "video" | "chat" | "sysmon" | "oracle" | "achieve" | "order" | "arcade";
export interface CmsWidgetEntry { id: WidgetId; dock: "left" | "right" | "top"; enabled: boolean; }

export interface CmsAchievement { id: string; year: string; field: string; title: string; detail: string; }
export type CmsBriefFieldType = "line" | "text" | "select" | "toggle";
export interface CmsBriefField { id: string; label: string; type: CmsBriefFieldType; options?: string[]; placeholder?: string; }
export interface CmsBriefTemplate { id: string; category: string; fields: CmsBriefField[]; }

export interface CmsIcons {
  mode: "auto" | "free" | "dock";
  dock: { dir: "h" | "v"; edge: "top" | "bottom" | "left" | "right" };
  positions: Record<string, { x: number; y: number }>;
  names: Record<string, string>;
}
export interface CmsPost { id: string; title: string; date: string; tags: string[]; body: string; images: string[]; }
export interface CmsBlog { template: string; posts: CmsPost[]; }
export interface CmsOperatorMedia { media: string | null; kind: "image" | "video"; name: string; }

export interface CmsContent {
  profile: CmsProfile;
  projects: CmsProject[];
  tracks: CmsTrack[];
  stats: CmsStat[];
  arts: CmsArt[];
  defaultTheme: string;
  videoSrc: string | null;
  videoName: string;
  operator: CmsOperatorMedia;
  widgets: { order: WidgetId[]; cfg: Record<string, CmsWidgetEntry> };
  icons: CmsIcons;
  blog: CmsBlog;
  achievements: CmsAchievement[];
  briefs: CmsBriefTemplate[];
  customFields: Record<string, CmsField[]>;
}

const ART_IDS = [
  "skull", "lenny", "heart", "doge", "rick", "thumbs", "coffee", "cat",
  "ghost", "rocket", "frog", "lol", "gg", "alien", "fire", "mushroom",
  "shrug", "wakeup", "rabbit", "pacman", "42", "boom", "spider", "omg",
];

const IMG = {
  pulse: "https://image.qwenlm.ai/generated-images/da9d99d8-85b6-4ba5-91d8-d367e287cc24/_result.png",
  karta: "https://image.qwenlm.ai/generated-images/4aa22f1a-094a-4840-a50b-b4596a4725e1/_result.png",
  ledger: "https://image.qwenlm.ai/generated-images/4f76a739-551b-4782-a54a-a921c0418940/_result.png",
  bloom: "https://image.qwenlm.ai/generated-images/4b45902b-885f-4e54-bc1c-399f406152b2/_result.png",
  noct: "https://image.qwenlm.ai/generated-images/28107350-a0c2-4157-b8c5-25b7e68422f2/_result.png",
  atlas: "https://image.qwenlm.ai/generated-images/3c9c03e4-e0a8-482e-9f0f-c326d6414c17/_result.png",
};

export const OPERATOR_AVATAR = "https://image.qwenlm.ai/generated-images/614bd58f-2126-42f4-ab93-3eca515f60ac/_result.png";

const BLOG_TEMPLATE = `# {{title}}

> One sharp lead sentence that hooks the reader.

## the gist

Body text goes here. Write it like you talk — short lines, no corporate fog.

- point one
- point two

![0]

## deeper

More text. Use **bold** for emphasis and \`code\` for the technical bits.

---

tags: {{tags}}

{{form}}`;

export const DEFAULT_CONTENT: CmsContent = {
  profile: {
    name: "ALEX VOLKOV",
    role: "full-stack web app developer",
    handle: "alex@volkov.dev",
    location: "planet Earth, UTC+3",
    expLine: "6+ yrs · 20+ launches",
    statusLine: "OPEN TO WORK",
    availability: "taking Q3 2026 projects · remote worldwide",
    bio: "I design and build web applications end-to-end — schema, API, auth, realtime, and the kind of UI that makes people slow down and look. Six years in, 20+ products shipped: dashboards, SaaS tools, e-commerce, interactive experiences. My favourite stack is the one that ships on Friday.",
    contacts: [
      { id: "c1", label: "github", value: "github.com/alexvolkov" },
      { id: "c2", label: "telegram", value: "@alexvolkov_dev" },
      { id: "c3", label: "linkedin", value: "in/alex-volkov" },
    ],
  },
  projects: [
    {
      id: "pulseboard", index: "01", title: "Pulseboard", category: "Realtime Analytics SaaS", year: "2025",
      stack: ["React", "TypeScript", "WebSockets", "ClickHouse", "Node"],
      summary: "A realtime analytics platform streaming 40k events/sec into live dashboards. Custom canvas charting engine keeps 60fps even with 1M-point series, with anomaly alerts wired into Slack and PagerDuty.",
      role: "Full-stack build · charting engine · infra",
      image: IMG.pulse, accent: "#ff9d2e", link: "https://pulseboard.example.com",
      gallery: [IMG.pulse, IMG.atlas],
      metrics: [
        { value: "40k", label: "events / sec" },
        { value: "60fps", label: "1M-point charts" },
        { value: "38%", label: "faster incident response" },
      ],
    },
    {
      id: "karta", index: "02", title: "Karta", category: "Travel Planning App", year: "2025",
      stack: ["Next.js", "Mapbox GL", "Supabase", "tRPC"],
      summary: "Collaborative trip planner with a shared live map, drag-and-drop itinerary builder and offline city packs. Realtime presence shows exactly where your travel mates are pinning.",
      role: "Product engineering · realtime sync · PWA",
      image: IMG.karta, accent: "#3f6b4f", link: "https://karta.example.com",
      gallery: [IMG.karta],
      metrics: [
        { value: "120k", label: "trips planned" },
        { value: "4.9★", label: "average rating" },
        { value: "<1s", label: "sync latency" },
      ],
    },
    {
      id: "ledgerline", index: "03", title: "Ledgerline", category: "Fintech Dashboard", year: "2024",
      stack: ["React", "D3", "PostgreSQL", "Go"],
      summary: "Cashflow intelligence for founders: bank sync, runway projections and a board-report generator. The area charts are hand-rolled D3 with semantic zoom.",
      role: "Design engineering · data viz · bank integrations",
      image: IMG.ledger, accent: "#1f4a38", link: "",
      gallery: [IMG.ledger],
      metrics: [
        { value: "$2.1B", label: "transactions parsed" },
        { value: "14", label: "bank integrations" },
        { value: "99.98%", label: "sync reliability" },
      ],
    },
    {
      id: "bloomful", index: "04", title: "Bloomful", category: "Plant Shop E-commerce", year: "2024",
      stack: ["Remix", "Stripe", "Sanity", "Framer Motion"],
      summary: "A boutique plant store where the cart is a greenhouse: add a monstera and the whole UI grows a leaf. Checkout converts at 4.8% — double the industry norm.",
      role: "Full-stack · creative direction · motion system",
      image: IMG.bloom, accent: "#2e5233", link: "",
      gallery: [IMG.bloom],
      metrics: [
        { value: "4.8%", label: "checkout conversion" },
        { value: "31k", label: "plants adopted" },
        { value: "0.9s", label: "LCP on 3G" },
      ],
    },
    {
      id: "nocturne", index: "05", title: "Nocturne", category: "Music Streaming Player", year: "2023",
      stack: ["React", "Web Audio API", "IndexedDB", "Rust/WASM"],
      summary: "A browser-native player that decodes lossless audio through a Rust DSP pipeline compiled to WASM. Waveforms are generated per-track, crossfades are beat-matched.",
      role: "Audio engine · WASM integration · UI",
      image: IMG.noct, accent: "#d33f2e", link: "",
      gallery: [IMG.noct],
      metrics: [
        { value: "24bit", label: "lossless decoding" },
        { value: "-14LUFS", label: "normalization" },
        { value: "18ms", label: "engine latency" },
      ],
    },
    {
      id: "atlas", index: "06", title: "Atlas CRM", category: "B2B Sales Platform", year: "2023",
      stack: ["Vue → React rewrite", "NestJS", "PostgreSQL", "Redis"],
      summary: "Pipeline CRM rebuilt from a legacy Vue monolith into a modular React app mid-flight — zero downtime migration of 4M records while the sales team kept selling.",
      role: "Tech lead · migration architecture · frontend",
      image: IMG.atlas, accent: "#2451c7", link: "",
      gallery: [IMG.atlas],
      metrics: [
        { value: "4M", label: "records migrated live" },
        { value: "0", label: "downtime minutes" },
        { value: "2.3×", label: "faster deal cycles" },
      ],
    },
  ],
  tracks: [
    { t: "Neon Rain", a: "Volkov Unit", d: 212 },
    { t: "Compile at Midnight", a: "Syntax Ghost", d: 187 },
    { t: "Phosphor Dreams", a: "CRT Lullaby", d: 244 },
    { t: "sudo make me a sandwich", a: "The Segfaults", d: 158 },
  ],
  stats: [
    { k: "frontend", v: 95 },
    { k: "backend", v: 88 },
    { k: "motion / css", v: 84 },
    { k: "devops", v: 71 },
    { k: "coffee intake", v: 99 },
  ],
  arts: ART_IDS.map((id) => ({ id, name: id, enabled: true })),
  defaultTheme: "green",
  videoSrc: null,
  videoName: "",
  operator: { media: null, kind: "image", name: "" },
  widgets: {
    order: ["operator", "player", "git", "video", "chat", "sysmon", "oracle", "achieve", "order", "arcade"],
    cfg: {
      operator: { id: "operator", dock: "right", enabled: true },
      player: { id: "player", dock: "right", enabled: true },
      achieve: { id: "achieve", dock: "right", enabled: true },
      order: { id: "order", dock: "right", enabled: true },
      arcade: { id: "arcade", dock: "left", enabled: true },
      git: { id: "git", dock: "right", enabled: true },
      video: { id: "video", dock: "left", enabled: true },
      chat: { id: "chat", dock: "left", enabled: true },
      sysmon: { id: "sysmon", dock: "right", enabled: true },
      oracle: { id: "oracle", dock: "left", enabled: true },
    },
  },
  icons: {
    mode: "auto",
    dock: { dir: "h", edge: "bottom" },
    positions: {},
    names: {},
  },
  blog: {
    template: BLOG_TEMPLATE,
    posts: [
      {
        id: "p1",
        title: "hello_world",
        date: "2026-02-15",
        tags: ["meta", "webdev"],
        images: [IMG.pulse],
        body: `# hello_world

> Every OS needs a first process. This one renders paragraphs.

## why an OS-shaped portfolio

Because "scroll, look at three cards, close tab" is a tragedy in four acts.
A portfolio should behave like the work it shows — mine ships interfaces people
**poke at**, so the portfolio is pokable: draggable windows, a real terminal,
rain that assembles memes when you stop moving.

![0]

## what lives here

- about.txt — the dossier
- projects/ — six shipped apps with receipts
- terminal — try \`neofetch\`, then \`theme amber\`
- cms.sys — the rabbit hole (guest pass is printed on the door)

---

tags: meta, webdev

{{form}}`,
      },
      {
        id: "p2",
        title: "shipping_on_fridays",
        date: "2026-01-30",
        tags: ["process", "opinion"],
        images: [],
        body: `# shipping_on_fridays

> "Never deploy on Friday" is fear wearing a hoodie.

## the argument

Friday deploys get a bad name from teams that deploy **surprises**.
If your release is boring — feature-flagged, reversible, observed —
then Friday is just a weekday with better pizza.

## the rules that make it boring

- every merge trains for production behind a flag
- rollback is one command, not a meeting
- dashboards alert before users tweet
- changelog is written **before** the code is merged

## the result

My favourite stack is the one that ships on Friday — because by Monday
the feedback is already in, and Monday-me is smarter than Friday-me.

---

tags: process, opinion

{{form}}`,
      },
      {
        id: "p3",
        title: "ascii_rain_anatomy",
        date: "2026-01-12",
        tags: ["creative-coding", "canvas"],
        images: [IMG.noct],
        body: `# ascii_rain_anatomy

> The memes are not falling. They are **waiting**.

## the trick

The rain is a dumb particle system — a few hundred glyphs with velocity and
fade. The magic is the second layer: when your cursor idles over empty
desktop, the rain's drop positions are re-targeted onto the glyph cells of a
24-frame meme archive. Skulls, frogs, a rabbit. Each glyph eases into place
with its own delay, so the picture **condenses** instead of appearing.

![0]

## numbers

- 24 templates in the registry, priority-ordered from cms.sys
- ~900 particles re-targeted per assembly, cubic ease-out
- disperse on pointermove: gravity 300px/s², alpha bleed 0.85/s

Move the mouse and the art falls apart — literally. That part was free.

---

tags: creative-coding, canvas

{{form}}`,
      },
    ],
  },
  achievements: [
    { id: "a1", year: "2025", field: "awwwards", title: "Site of the Day ×2", detail: "two promo builds hit the front page" },
    { id: "a2", year: "2025", field: "oss", title: "1.2k stars on github", detail: "tiny state-machine lib, big community love" },
    { id: "a3", year: "2024", field: "shipping", title: "20+ products launched", detail: "dashboards · saas · e-com · zero missed deadlines" },
    { id: "a4", year: "2024", field: "performance", title: "TTI −43%", detail: "resuscitated a fintech dashboard on life support" },
    { id: "a5", year: "2023", field: "hackathon", title: "48h → live MVP", detail: "won the rail-tech hackathon, still running" },
  ],
  briefs: [
    {
      id: "webapp", category: "web app",
      fields: [
        { id: "f1", label: "the idea in 2–3 sentences", type: "text", placeholder: "what does it do, for whom?" },
        { id: "f2", label: "target users", type: "line", placeholder: "e.g. 10k monthly traders" },
        { id: "f3", label: "stack preference", type: "select", options: ["react + node", "react + go", "whatever ships fastest"] },
        { id: "f4", label: "deadline", type: "select", options: ["asap", "1–2 months", "flexible"] },
        { id: "f5", label: "budget range", type: "select", options: ["< $2k", "$2–5k", "$5k+", "equity & vibes"] },
      ],
    },
    {
      id: "landing", category: "landing / promo",
      fields: [
        { id: "f1", label: "product / event", type: "line", placeholder: "what are we hyping?" },
        { id: "f2", label: "vibe", type: "select", options: ["brutal", "minimal", "wow-factor", "wtf-wow"] },
        { id: "f3", label: "references", type: "text", placeholder: "links to sites you like" },
        { id: "f4", label: "deadline", type: "select", options: ["asap", "1–2 months", "flexible"] },
      ],
    },
    {
      id: "dashboard", category: "dashboard / saas",
      fields: [
        { id: "f1", label: "domain", type: "line", placeholder: "fintech? logistics? fitness?" },
        { id: "f2", label: "data sources", type: "text", placeholder: "APIs, databases, files…" },
        { id: "f3", label: "needs realtime", type: "toggle" },
        { id: "f4", label: "deadline", type: "select", options: ["asap", "1–2 months", "flexible"] },
      ],
    },
  ],
  customFields: { about: [], projects: [], widgets: [], playlist: [], "ascii arts": [], theme: [], blog: [], desktop: [], achieve: [], briefs: [] },
};

export type CmsMode = "guest" | "demo" | "root";

const LS_CONTENT = "volkovos.cms.content.v3";
const LS_CREDS = "volkovos.cms.creds.v1";
const DEMO_USER = "admin";
const DEMO_PASS = "qwerty123";
const ROOT_USER = "u53r_#s7en";
const ROOT_PASS = "suka_blyat_nahui";

interface StoredCreds { u: string; p: string; }

function loadCreds(): StoredCreds {
  try {
    const raw = localStorage.getItem(LS_CREDS);
    if (raw) {
      const parsed = JSON.parse(atob(raw)) as StoredCreds;
      if (parsed && typeof parsed.u === "string" && typeof parsed.p === "string") return parsed;
    }
  } catch { /* corrupted — fall back */ }
  return { u: ROOT_USER, p: ROOT_PASS };
}

/* defensive merge — any missing/broken piece falls back to defaults */
function loadContent(): CmsContent {
  const d = DEFAULT_CONTENT;
  try {
    const raw = localStorage.getItem(LS_CONTENT);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CmsContent>;
      const profile = { ...d.profile, ...(parsed.profile ?? {}) };
      if (!Array.isArray(profile.contacts)) profile.contacts = d.profile.contacts;
      const parsedWidgets = parsed.widgets && Array.isArray(parsed.widgets.order)
        ? { order: parsed.widgets.order, cfg: { ...d.widgets.cfg, ...(parsed.widgets.cfg ?? {}) } }
        : d.widgets;
      /* graft newly-introduced widgets onto older saved layouts */
      const widgets = { order: [...parsedWidgets.order], cfg: { ...parsedWidgets.cfg } };
      (["achieve", "order", "arcade"] as WidgetId[]).forEach((wid) => {
        if (!widgets.order.includes(wid)) {
          widgets.order.push(wid);
          if (!widgets.cfg[wid]) widgets.cfg[wid] = d.widgets.cfg[wid];
        }
      });
      return {
        profile,
        projects: Array.isArray(parsed.projects) && parsed.projects.length ? parsed.projects : d.projects,
        tracks: Array.isArray(parsed.tracks) ? parsed.tracks : d.tracks,
        stats: Array.isArray(parsed.stats) ? parsed.stats : d.stats,
        arts: Array.isArray(parsed.arts) && parsed.arts.length ? parsed.arts : d.arts,
        defaultTheme: typeof parsed.defaultTheme === "string" ? parsed.defaultTheme : d.defaultTheme,
        videoSrc: typeof parsed.videoSrc === "string" ? parsed.videoSrc : null,
        videoName: typeof parsed.videoName === "string" ? parsed.videoName : "",
        operator: parsed.operator && typeof parsed.operator === "object" ? { ...d.operator, ...parsed.operator } : d.operator,
        widgets,
        icons: { ...d.icons, ...(parsed.icons ?? {}), dock: { ...d.icons.dock, ...(parsed.icons?.dock ?? {}) }, positions: parsed.icons?.positions ?? {}, names: parsed.icons?.names ?? {} },
        blog: parsed.blog ? { template: typeof parsed.blog.template === "string" ? parsed.blog.template : d.blog.template, posts: Array.isArray(parsed.blog.posts) ? parsed.blog.posts : d.blog.posts } : d.blog,
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : d.achievements,
        briefs: Array.isArray(parsed.briefs) && parsed.briefs.length ? parsed.briefs : d.briefs,
        customFields: { ...d.customFields, ...(parsed.customFields ?? {}) },
      };
    }
  } catch { /* corrupted — defaults */ }
  return d;
}

interface CmsApi {
  content: CmsContent;
  profile: CmsProfile;
  projects: CmsProject[];
  tracks: CmsTrack[];
  stats: CmsStat[];
  arts: CmsArt[];
  defaultTheme: string;
  videoSrc: string | null;
  videoName: string;
  operator: CmsOperatorMedia;
  widgets: CmsContent["widgets"];
  widgetCfg: CmsWidgetEntry[];
  icons: CmsIcons;
  blog: CmsBlog;
  achievements: CmsAchievement[];
  briefs: CmsBriefTemplate[];
  customFields: Record<string, CmsField[]>;
  mode: CmsMode;
  sessionUser: string | null;
  persistError: boolean;
  login: (user: string, pass: string) => CmsMode | null;
  logout: () => void;
  updateContent: (patch: Partial<CmsContent>) => void;
  saveCreds: (u: string, p: string) => void;
  resetContent: () => void;
  setWidget: (id: WidgetId, patch: Partial<Omit<CmsWidgetEntry, "id">>) => void;
  moveWidget: (index: number, dir: -1 | 1) => void;
  addTrack: () => void;
  removeTrack: (index: number) => void;
  addField: (tab: string, type: FieldType, label: string) => void;
  setFieldValue: (tab: string, fieldId: string, value: string | boolean) => void;
  removeField: (tab: string, fieldId: string) => void;
  addProject: () => string;
  removeProject: (id: string) => void;
  addArt: (name: string, rows: string[]) => string;
  removeArt: (id: string) => void;
  setArt: (id: string, patch: Partial<CmsArt>) => void;
  setIcons: (patch: Partial<CmsIcons>) => void;
  addPost: () => string;
  removePost: (id: string) => void;
  setPost: (id: string, patch: Partial<CmsPost>) => void;
}

const CmsContext = createContext<CmsApi>(null!);
export const useCMS = () => useContext(CmsContext);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<CmsContent>(loadContent);
  const [mode, setMode] = useState<CmsMode>("guest");
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const [persistError, setPersistError] = useState(false);

  const login = useCallback((user: string, pass: string): CmsMode | null => {
    const creds = loadCreds();
    if (user === creds.u && pass === creds.p) { setMode("root"); setSessionUser(user); return "root"; }
    if (user === DEMO_USER && pass === DEMO_PASS) { setMode("demo"); setSessionUser(user); return "demo"; }
    return null;
  }, []);

  const logout = useCallback(() => { setMode("guest"); setSessionUser(null); }, []);

  const updateContent = useCallback((patch: Partial<CmsContent>) => {
    setContent((prev) => {
      const next = { ...prev, ...patch };
      if (mode === "root") {
        try {
          localStorage.setItem(LS_CONTENT, JSON.stringify(next));
          setPersistError(false);
        } catch {
          setPersistError(true); // quota exceeded — edits stay in memory
        }
      }
      return next;
    });
  }, [mode]);

  const saveCreds = useCallback((u: string, p: string) => {
    try { localStorage.setItem(LS_CREDS, btoa(JSON.stringify({ u, p }))); } catch { /* full */ }
  }, []);

  const resetContent = useCallback(() => {
    try { localStorage.removeItem(LS_CONTENT); } catch { /* ignore */ }
    setPersistError(false);
    setContent(DEFAULT_CONTENT);
  }, []);

  /* widgets */
  const setWidget = useCallback((id: WidgetId, patch: Partial<Omit<CmsWidgetEntry, "id">>) => {
    setContent((prev) => {
      const cfg = { ...prev.widgets.cfg, [id]: { ...prev.widgets.cfg[id], ...patch, id } };
      const next = { ...prev, widgets: { ...prev.widgets, cfg } };
      if (mode === "root") { try { localStorage.setItem(LS_CONTENT, JSON.stringify(next)); } catch { setPersistError(true); } }
      return next;
    });
  }, [mode]);

  const moveWidget = useCallback((index: number, dir: -1 | 1) => {
    setContent((prev) => {
      const order = [...prev.widgets.order];
      const j = index + dir;
      if (j < 0 || j >= order.length) return prev;
      [order[index], order[j]] = [order[j], order[index]];
      const next = { ...prev, widgets: { ...prev.widgets, order } };
      if (mode === "root") { try { localStorage.setItem(LS_CONTENT, JSON.stringify(next)); } catch { setPersistError(true); } }
      return next;
    });
  }, [mode]);

  /* tracks */
  const addTrack = useCallback(() => {
    updateContent({ tracks: [...content.tracks, { t: "untitled_track", a: "Unknown Daemon", d: 180 }] });
  }, [content.tracks, updateContent]);

  const removeTrack = useCallback((index: number) => {
    updateContent({ tracks: content.tracks.filter((_, i) => i !== index) });
  }, [content.tracks, updateContent]);

  /* field forge */
  const patchFields = useCallback((fn: (prev: CmsContent) => CmsContent) => {
    setContent((prev) => {
      const next = fn(prev);
      if (mode === "root") { try { localStorage.setItem(LS_CONTENT, JSON.stringify(next)); } catch { setPersistError(true); } }
      return next;
    });
  }, [mode]);

  const addField = useCallback((tab: string, type: FieldType, label: string) => {
    const f: CmsField = { id: `f_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4)}`, type, label, value: type === "toggle" ? false : type === "number" ? "0" : "" };
    patchFields((prev) => ({ ...prev, customFields: { ...prev.customFields, [tab]: [...(prev.customFields[tab] ?? []), f] } }));
  }, [patchFields]);

  const setFieldValue = useCallback((tab: string, fieldId: string, value: string | boolean) => {
    patchFields((prev) => ({ ...prev, customFields: { ...prev.customFields, [tab]: (prev.customFields[tab] ?? []).map((f) => (f.id === fieldId ? { ...f, value } : f)) } }));
  }, [patchFields]);

  const removeField = useCallback((tab: string, fieldId: string) => {
    patchFields((prev) => ({ ...prev, customFields: { ...prev.customFields, [tab]: (prev.customFields[tab] ?? []).filter((f) => f.id !== fieldId) } }));
  }, [patchFields]);

  /* projects */
  const addProject = useCallback((): string => {
    const id = `app_${Date.now().toString(36)}`;
    const idx = String(content.projects.length + 1).padStart(2, "0");
    const p: CmsProject = {
      id, index: idx, title: "Untitled App", category: "Web Application", year: "2026",
      stack: ["React", "TypeScript"], summary: "A brand new project — fill in the story, stack the metrics, mount a screenshot.",
      role: "Full-stack build", image: "", accent: "#46f084", link: "", gallery: [],
      metrics: [{ value: "v0.1", label: "status" }, { value: "∞", label: "potential" }, { value: "100%", label: "love" }],
    };
    updateContent({ projects: [...content.projects, p] });
    return id;
  }, [content.projects, updateContent]);

  const removeProject = useCallback((id: string) => {
    if (content.projects.length <= 1) return;
    updateContent({ projects: content.projects.filter((p) => p.id !== id) });
  }, [content.projects, updateContent]);

  /* arts */
  const addArt = useCallback((name: string, rows: string[]): string => {
    const id = `art_${Date.now().toString(36)}`;
    const a: CmsArt = { id, name: name.trim() || "custom art", enabled: true, rows: rows.slice(0, 24) };
    updateContent({ arts: [a, ...content.arts] });
    return id;
  }, [content.arts, updateContent]);

  const removeArt = useCallback((id: string) => {
    updateContent({ arts: content.arts.filter((a) => a.id !== id) });
  }, [content.arts, updateContent]);

  const setArt = useCallback((id: string, patch: Partial<CmsArt>) => {
    updateContent({ arts: content.arts.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  }, [content.arts, updateContent]);

  /* icons */
  const setIcons = useCallback((patch: Partial<CmsIcons>) => {
    updateContent({ icons: { ...content.icons, ...patch } });
  }, [content.icons, updateContent]);

  /* blog */
  const addPost = useCallback((): string => {
    const id = `post_${Date.now().toString(36)}`;
    const date = new Date().toISOString().slice(0, 10);
    const body = content.blog.template
      .split("{{title}}").join("untitled_post")
      .split("{{date}}").join(date)
      .split("{{tags}}").join("misc");
    const post: CmsPost = { id, title: "untitled_post", date, tags: ["misc"], body, images: [] };
    updateContent({ blog: { ...content.blog, posts: [post, ...content.blog.posts] } });
    return id;
  }, [content.blog, updateContent]);

  const removePost = useCallback((id: string) => {
    updateContent({ blog: { ...content.blog, posts: content.blog.posts.filter((p) => p.id !== id) } });
  }, [content.blog, updateContent]);

  const setPost = useCallback((id: string, patch: Partial<CmsPost>) => {
    updateContent({ blog: { ...content.blog, posts: content.blog.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) } });
  }, [content.blog, updateContent]);

  const widgetCfg = useMemo<CmsWidgetEntry[]>(
    () => content.widgets.order.map((id) => content.widgets.cfg[id]).filter(Boolean),
    [content.widgets]
  );

  const api = useMemo<CmsApi>(() => ({
    content,
    profile: content.profile,
    projects: content.projects,
    tracks: content.tracks,
    stats: content.stats,
    arts: content.arts,
    defaultTheme: content.defaultTheme,
    videoSrc: content.videoSrc,
    videoName: content.videoName,
    operator: content.operator,
    widgets: content.widgets,
    widgetCfg,
    icons: content.icons,
    blog: content.blog,
    achievements: content.achievements,
    briefs: content.briefs,
    customFields: content.customFields,
    mode, sessionUser, persistError,
    login, logout, updateContent, saveCreds, resetContent,
    setWidget, moveWidget, addTrack, removeTrack,
    addField, setFieldValue, removeField,
    addProject, removeProject, addArt, removeArt, setArt, setIcons,
    addPost, removePost, setPost,
  }), [content, widgetCfg, mode, sessionUser, persistError, login, logout, updateContent, saveCreds, resetContent, setWidget, moveWidget, addTrack, removeTrack, addField, setFieldValue, removeField, addProject, removeProject, addArt, removeArt, setArt, setIcons, addPost, removePost, setPost]);

  return <CmsContext.Provider value={api}>{children}</CmsContext.Provider>;
}

/* ——— shared file helpers ——— */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function downscaleImage(file: File, maxW = 1280, q = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) { reject(new Error("not an image")); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(""); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", q));
    };
    img.onerror = reject;
    img.src = url;
  });
}
