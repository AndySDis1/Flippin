import { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <rect x="4" y="4" width="56" height="56" rx="16" className="fill-emerald-500/10" />
      <path
        d="M18 40c6 6 22 6 28-10"
        stroke="#22c55e"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M22 24 32 34l10-16" stroke="#bef264" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
