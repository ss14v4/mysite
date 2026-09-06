import { PROJECTS } from "./data";

export { PROJECTS };

export const EMAIL = "alex@volkov.dev";

export const SKILL_BARS: Array<[string, number]> = [
  ["TypeScript / React", 92],
  ["Node.js / REST / WS", 88],
  ["UI motion / CSS-fu", 86],
  ["PostgreSQL / Prisma", 81],
  ["System design", 78],
  ["Rust (weekends)", 41],
];

export const EXPERIENCE = [
  {
    period: "2023 — NOW",
    role: "Freelance full-stack developer",
    org: "startups & product teams",
    note: "Web apps end-to-end: from schema and API to pixel-perfect UI. 20+ launches, zero missed deadlines.",
    tag: "CURRENT",
  },
  {
    period: "2021 — 2023",
    role: "Product engineer",
    org: "fintech, Series B",
    note: "Real-time dashboards, design system, charting engine. Cut time-to-interactive by 43%.",
    tag: "FULL-TIME",
  },
  {
    period: "2019 — 2021",
    role: "Frontend developer",
    org: "digital studio",
    note: "Awwwards-grade promo sites and e-commerce. Learned that motion is a language.",
    tag: "AGENCY",
  },
];

export const CONTACTS: Array<{ label: string; value: string; href?: string; copy?: string }> = [
  { label: "email", value: EMAIL, href: `mailto:${EMAIL}`, copy: EMAIL },
  { label: "github", value: "github.com/alexvolkov", href: "https://github.com" },
  { label: "telegram", value: "@alexvolkov_dev", href: "https://t.me" },
  { label: "linkedin", value: "in/alex-volkov", href: "https://linkedin.com" },
];

export const THEMES = ["green", "amber", "cyan", "pink"] as const;
export type ThemeName = (typeof THEMES)[number];
export const THEME_HEX: Record<ThemeName, string> = {
  green: "#46f084",
  amber: "#f2b04e",
  cyan: "#5ad0f5",
  pink: "#ff6fb2",
};

export interface FileMeta { perms: string; size: string; }
export const FILE_META: FileMeta[] = [
  { perms: "drwxr-xr-x", size: "4.2M" },
  { perms: "drwxr-xr-x", size: "3.8M" },
  { perms: "drwxr-xr-x", size: "5.1M" },
  { perms: "drwxr-xr-x", size: "2.9M" },
  { perms: "drwxr-xr-x", size: "3.3M" },
  { perms: "drwxr-xr-x", size: "4.7M" },
];

export function bar(v: number, width = 14): string {
  const full = Math.round((v / 100) * width);
  return "█".repeat(full) + "░".repeat(width - full);
}
