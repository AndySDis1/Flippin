import Link from 'next/link';
import { Logo } from '@flippin/ui';

const links = [
  { href: '/items', label: 'Items' },
  { href: '/intake', label: 'Intake' },
  { href: '/analytics', label: 'Analytics' },
];

export function TopNav() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-semibold text-white">Flippin'</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-slate-200">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-md border border-emerald-400/50 px-3 py-1.5 text-emerald-100 hover:bg-emerald-500/10"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
