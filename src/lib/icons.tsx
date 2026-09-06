type IconProps = { className?: string; strokeWidth?: number };

const base = (className?: string) => className ?? "h-5 w-5";

export function Asterisk({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} aria-hidden>
      <path
        d="M12 2v20M3.34 7l17.32 10M20.66 7L3.34 17"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowUpRight({ className, strokeWidth = 2 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} aria-hidden>
      <path
        d="M6 18L18 6M9 6h9v9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ArrowDown({ className, strokeWidth = 2 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} aria-hidden>
      <path
        d="M12 4v16m0 0l-6-6m6 6l6-6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ArrowLoop({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} aria-hidden>
      <path
        d="M4 12a8 8 0 0113.66-5.66L20 8.5M20 12a8 8 0 01-13.66 5.66L4 15.5M20 3v5.5h-5.5M4 21v-5.5h5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

/* capability glyphs — geometric, drawn for this site */
export function GlyphApp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={base(className)} aria-hidden>
      <rect x="3" y="5" width="26" height="20" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h26M7 7.5h.01M10 7.5h.01" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 16l-3 2.5L11 21M21 16l3 2.5L21 21M17.5 14.5l-3 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      <path d="M12 29h8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function GlyphRocket({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={base(className)} aria-hidden>
      <path
        d="M16 3c5 3 8 8 8 14l-4 4h-8l-4-4c0-6 3-11 8-14z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="bevel"
      />
      <circle cx="16" cy="13" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 25l-2 4 4-1.5M20 25l2 4-4-1.5M16 25v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

export function GlyphChart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={base(className)} aria-hidden>
      <path d="M4 4v24h24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      <path d="M9 22l5-7 4 4 6-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      <circle cx="9" cy="22" r="1.6" fill="currentColor" />
      <circle cx="14" cy="15" r="1.6" fill="currentColor" />
      <circle cx="18" cy="19" r="1.6" fill="currentColor" />
      <circle cx="24" cy="10" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function GlyphCart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={base(className)} aria-hidden>
      <path d="M4 6h4l3.4 14.5h13.2L28 10H9.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      <circle cx="13" cy="26" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="22" cy="26" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function GlyphSpark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={base(className)} aria-hidden>
      <path
        d="M16 3l2.6 8.4L27 14l-8.4 2.6L16 25l-2.6-8.4L5 14l8.4-2.6L16 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="bevel"
      />
      <path d="M25 23l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="bevel" />
    </svg>
  );
}

/* social marks */
export function MarkGitHub({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)} aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.72.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.9-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0022 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

export function MarkLinkedIn({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)} aria-hidden>
      <path d="M4.98 3.5a2.49 2.49 0 11-.02 4.98 2.49 2.49 0 01.02-4.98zM3 9.5h4V21H3V9.5zm6.5 0h3.83v1.57h.05c.53-1 1.84-2.07 3.79-2.07 4.05 0 4.8 2.67 4.8 6.14V21h-4v-5.13c0-1.22-.02-2.8-1.7-2.8-1.71 0-1.97 1.33-1.97 2.71V21h-3.8V9.5z" />
    </svg>
  );
}

export function MarkTelegram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)} aria-hidden>
      <path d="M21.9 4.1c.3-1-.7-1.8-1.7-1.4L2.9 9.5c-1.1.4-1 1.9.1 2.2l4.4 1.4 1.7 5.2c.3 1 1.6 1.2 2.2.4l2.3-2.8 4.4 3.2c.8.6 2 .2 2.2-.8l1.7-14.2zM9.4 12.9l8-5.9c.3-.2.6.2.4.4l-6.6 6.6-.3 2.9-1.5-4z" />
    </svg>
  );
}

export function MarkX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)} aria-hidden>
      <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L2 3h6.4l4.4 5.9L17.8 3zm-1.1 16.1h1.7L7.5 4.7H5.7l11 14.4z" />
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} aria-hidden>
      <rect x="8" y="8" width="12" height="12" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 4H4v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} aria-hidden>
      <path d="M4 12.5l5.5 5.5L20 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base(className)} aria-hidden>
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}
