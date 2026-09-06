export type Project = {
  id: string;
  index: string;
  title: string;
  category: string;
  year: string;
  stack: string[];
  summary: string;
  role: string;
  image: string;
  accent: string;
  metrics: { value: string; label: string }[];
};

export const PROJECTS: Project[] = [
  {
    id: "pulseboard",
    index: "01",
    title: "Pulseboard",
    category: "Realtime Analytics SaaS",
    year: "2025",
    stack: ["React", "TypeScript", "WebSockets", "ClickHouse", "Node"],
    summary:
      "A realtime analytics platform streaming 40k events/sec into live dashboards. Custom canvas charting engine keeps 60fps even with 1M-point series, with anomaly alerts wired into Slack and PagerDuty.",
    role: "Full-stack build · charting engine · infra",
    image:
      "https://image.qwenlm.ai/generated-images/da9d99d8-85b6-4ba5-91d8-d367e287cc24/_result.png",
    accent: "#ff9d2e",
    metrics: [
      { value: "40k", label: "events / sec" },
      { value: "60fps", label: "1M-point charts" },
      { value: "38%", label: "faster incident response" },
    ],
  },
  {
    id: "karta",
    index: "02",
    title: "Karta",
    category: "Travel Planning App",
    year: "2025",
    stack: ["Next.js", "Mapbox GL", "Supabase", "tRPC"],
    summary:
      "Collaborative trip planner with a shared live map, drag-and-drop itinerary builder and offline city packs. Realtime presence shows exactly where your travel mates are pinning.",
    role: "Product engineering · realtime sync · PWA",
    image:
      "https://image.qwenlm.ai/generated-images/4aa22f1a-094a-4840-a50b-b4596a4725e1/_result.png",
    accent: "#3f6b4f",
    metrics: [
      { value: "120k", label: "trips planned" },
      { value: "4.9★", label: "average rating" },
      { value: "<1s", label: "sync latency" },
    ],
  },
  {
    id: "ledgerline",
    index: "03",
    title: "Ledgerline",
    category: "Fintech Dashboard",
    year: "2024",
    stack: ["React", "D3", "PostgreSQL", "Go"],
    summary:
      "Cashflow intelligence for SMBs — multi-entity consolidation, scenario modelling and bank-grade security (SOC 2). Built the forecasting view that became the product's signature feature.",
    role: "Frontend architecture · data viz · design system",
    image:
      "https://image.qwenlm.ai/generated-images/b53a6000-1ebb-4dca-9b4c-8bdc0d7bafa7/_result.png",
    accent: "#8fb996",
    metrics: [
      { value: "$2.4B", label: "transactions tracked" },
      { value: "SOC 2", label: "type II certified" },
      { value: "19", label: "bank integrations" },
    ],
  },
  {
    id: "bloomful",
    index: "04",
    title: "Bloomful",
    category: "Headless E-commerce",
    year: "2024",
    stack: ["Next.js", "Shopify Hydrogen", "Stripe", "Sanity"],
    summary:
      "Headless storefront for a boutique plant studio — 100/100 Lighthouse, edge-rendered PDPs, subscriptions for plant care kits and a checkout flow trimmed to 45 seconds end-to-end.",
    role: "End-to-end build · performance · CMS",
    image:
      "https://image.qwenlm.ai/generated-images/f469ebe2-58dd-40f4-a9bb-ab19ccdd20a6/_result.png",
    accent: "#c9a15a",
    metrics: [
      { value: "100", label: "Lighthouse perf" },
      { value: "+64%", label: "conversion lift" },
      { value: "0.8s", label: "LCP on 3G" },
    ],
  },
  {
    id: "nocturne",
    index: "05",
    title: "Nocturne",
    category: "Music Streaming Web App",
    year: "2023",
    stack: ["React", "Web Audio API", "Rust/WASM", "Redis"],
    summary:
      "A browser-native player with gapless playback, crossfade and a WASM-powered waveform renderer. Keyboard-first UX: the whole app is drivable without touching the mouse.",
    role: "Audio engine · WASM integration · UX",
    image:
      "https://image.qwenlm.ai/generated-images/5f37e206-7219-40a2-bdfc-da2e3bc79d75/_result.png",
    accent: "#ff5a48",
    metrics: [
      { value: "0ms", label: "gap between tracks" },
      { value: "2.1M", label: "monthly plays" },
      { value: "9", label: "keyboard shortcuts" },
    ],
  },
  {
    id: "atlas",
    index: "06",
    title: "Atlas CRM",
    category: "B2B Sales Platform",
    year: "2023",
    stack: ["React", "GraphQL", "PostgreSQL", "Temporal"],
    summary:
      "Pipeline-first CRM for 200-seat sales teams: kanban deal flows, workflow automation with human-in-the-loop approvals, and a command palette that replaced 14 clicks with 2.",
    role: "Product engineering · automation layer",
    image:
      "https://image.qwenlm.ai/generated-images/a400afcd-b515-46d0-90fd-7dbfdcf8de81/_result.png",
    accent: "#4f6fd8",
    metrics: [
      { value: "200+", label: "seats per tenant" },
      { value: "-71%", label: "admin time" },
      { value: "99.98%", label: "uptime" },
    ],
  },
];

export const PORTRAIT_URL =
  "https://image.qwenlm.ai/generated-images/1fb95d1e-88ac-4013-89a0-056a3c4d11f3/_result.png";

export const CAPABILITIES = [
  {
    index: "01",
    title: "Web Applications",
    copy: "Complex, state-heavy products — dashboards, editors, collaboration tools. Architecture that stays fast when the data stops being polite.",
    tags: ["React", "TypeScript", "WebSockets"],
  },
  {
    index: "02",
    title: "SaaS & MVPs",
    copy: "Zero-to-one builds for founders. From napkin sketch to paying users in weeks — auth, billing, analytics and the boring parts done right.",
    tags: ["Next.js", "Supabase", "Stripe"],
  },
  {
    index: "03",
    title: "Dashboards & Data Viz",
    copy: "Charts people actually read. Canvas and SVG rendering tuned for millions of points, with design that makes the signal obvious.",
    tags: ["D3", "Canvas", "ClickHouse"],
  },
  {
    index: "04",
    title: "E-commerce",
    copy: "Headless storefronts that load before the doubt kicks in. Sub-second LCP, frictionless checkout, CMS the team can actually edit.",
    tags: ["Shopify", "Edge", "Sanity"],
  },
  {
    index: "05",
    title: "Design Engineering",
    copy: "The last 10% that makes a product feel premium — motion systems, micro-interactions, accessibility and obsessive polish.",
    tags: ["Motion", "A11y", "Design Systems"],
  },
];

export const RECOGNITION = [
  { count: "03×", label: "Awwwards — Honorable Mention" },
  { count: "01×", label: "Awwwards — Developer Award" },
  { count: "02×", label: "CSSDA — Special Kudos" },
  { count: "01×", label: "FWA — FWA of the Day" },
  { count: "01×", label: "Product Hunt — #1 Product of the Day" },
  { count: "03×", label: "Hacker News — Front Page" },
];

export const FEATURED = [
  { count: "04×", label: "One Page Love — Featured" },
  { count: "02×", label: "GitHub Trending — Weekly" },
  { count: "12", label: "Open-source packages · 4.2k★" },
  { count: "06×", label: "Conference talks & workshops" },
];

export const STATS = [
  { value: 8, suffix: "", label: "Years shipping" },
  { value: 40, suffix: "+", label: "Products launched" },
  { value: 21, suffix: "", label: "Long-term clients" },
  { value: 99, suffix: "", label: "Median Lighthouse" },
];

export const STACK = [
  "React",
  "TypeScript",
  "Next.js",
  "Node",
  "PostgreSQL",
  "GraphQL",
  "Supabase",
  "Tailwind",
  "GSAP",
  "Vite",
  "Rust/WASM",
  "Docker",
];

export const CLIENTS = [
  "Nordwind",
  "Helix Labs",
  "Otto & Co",
  "Finch Bank",
  "Polaris",
  "Moss Studio",
  "Kite Health",
  "Raster",
  "Bloomful",
  "Vantage",
];

export const SOCIALS = [
  { label: "GitHub", handle: "@alexvolkov", href: "https://github.com" },
  { label: "LinkedIn", handle: "in/alexvolkov", href: "https://linkedin.com" },
  { label: "Telegram", handle: "@avolkov_dev", href: "https://telegram.org" },
  { label: "X / Twitter", handle: "@avolkov_dev", href: "https://x.com" },
];

export const EMAIL = "hello@alexvolkov.dev";
