import type { CSSProperties } from "react";

// Icons ported verbatim from the original bundle. Like the originals, they only take
// `className`; any other prop the call site passes is intentionally ignored so the
// rendered size matches the source (e.g. the hero CTA icons size from their container).

type IconProps = { className?: string; style?: CSSProperties };

export function ArrowRightIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrainIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M15.8 6C10.2 2.7 5.3 6.5 6.6 11.1 2.7 13.2 4.3 19.1 8.8 19.7c-.3 4.4 4.4 6.2 7 3.2M16.2 6c5.6-3.3 10.5.5 9.2 5.1 3.9 2.1 2.3 8-2.2 8.6.3 4.4-4.4 6.2-7 3.2M16 6v18M10 11c1.7 0 3 1.5 3 3.3M22 11c-1.7 0-3 1.5-3 3.3M9 19c2.2-.2 3.7 1.3 3.8 3M23 19c-2.2-.2-3.7 1.3-3.8 3" />
    </svg>
  );
}

export function SoundIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10v4h4l5 4V6l-5 4H4Zm12 .2a4 4 0 0 1 0 3.6M18.5 7.5a8 8 0 0 1 0 9" strokeLinecap="round" />
    </svg>
  );
}

export function CupIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 5h14v8c0 6-3 9-7 9s-7-3-7-9V5Zm4 8h.1M17 13h.1M11 17c1.5 1 4.5 1 6 0" strokeLinecap="round" />
    </svg>
  );
}

export function FlameIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M15 3c1 5-4 6-4 10 0 2 1.2 3.6 3 4.3-1.2-2.4.3-4.4 2-6 2.7 2.3 4 5 4 7.7A6 6 0 1 1 8 19c0-4 3-6.5 7-16Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrendIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 15 6-6 4 4 4-5M14 8h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
