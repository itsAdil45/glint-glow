// Lucide (used everywhere else in this app) deliberately doesn't ship
// trademarked brand/platform logos — these are minimal, accurate
// currentColor SVG marks for the handful of platforms this site links to,
// so a "Facebook" link actually renders the Facebook glyph instead of a
// generic Lucide icon standing in for it.

interface IconProps {
  size?: number;
  className?: string;
}

export function FacebookIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.6 10.6 20.4 3h-1.6l-5.9 6.6L8.2 3H2.5l7.1 9.9L2.5 21h1.6l6.2-7 5 7h5.7l-7.4-10.4Zm-2.2 2.5-.7-1L4.9 4.2h2.5l4.6 6.4.7 1 6 8.4h-2.5l-4.9-6.9Z" />
    </svg>
  );
}

export function PinterestIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.31-.09-.79-.17-2.01.03-2.87.19-.79 1.22-5.05 1.22-5.05s-.31-.63-.31-1.55c0-1.46.84-2.54 1.9-2.54.9 0 1.33.67 1.33 1.48 0 .9-.57 2.25-.87 3.5-.25 1.05.52 1.9 1.55 1.9 1.86 0 3.29-1.96 3.29-4.79 0-2.5-1.8-4.26-4.37-4.26-2.98 0-4.72 2.23-4.72 4.53 0 .9.34 1.86.78 2.38.09.1.1.2.07.3-.08.32-.25 1.02-.29 1.16-.04.19-.15.23-.35.14-1.3-.6-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.86-6.28 3.6 0 6.4 2.57 6.4 6 0 3.58-2.26 6.46-5.39 6.46-1.05 0-2.04-.55-2.38-1.19l-.65 2.47c-.24.9-.87 2.03-1.3 2.72.98.3 2.02.46 3.1.46 5.52 0 10-4.48 10-10S17.52 2 12 2Z" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.29-.15-1.7-.84-1.97-.93-.26-.1-.46-.15-.65.14-.19.29-.75.93-.92 1.12-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.58-.9-2.16-.24-.57-.48-.49-.65-.5h-.56c-.19 0-.5.07-.77.36-.26.29-1 .98-1 2.4 0 1.41 1.03 2.77 1.17 2.97.15.19 2.03 3.1 4.92 4.35.69.3 1.22.48 1.64.61.69.22 1.31.19 1.81.11.55-.08 1.7-.7 1.94-1.36.24-.67.24-1.25.17-1.36-.07-.12-.26-.19-.55-.34Z" />
      <path d="M12.05 2C6.53 2 2.05 6.48 2.05 12c0 1.9.53 3.68 1.44 5.2L2 22l4.94-1.44A9.94 9.94 0 0 0 12.05 22c5.52 0 10-4.48 10-10S17.57 2 12.05 2Zm0 18.18c-1.7 0-3.28-.5-4.6-1.36l-.33-.2-3.06.9.91-2.98-.21-.34a8.14 8.14 0 0 1-1.26-4.38c0-4.51 3.67-8.18 8.19-8.18 4.51 0 8.18 3.67 8.18 8.18 0 4.52-3.67 8.36-8.18 8.36Z" />
    </svg>
  );
}
