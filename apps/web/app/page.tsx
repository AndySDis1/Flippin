import Link from 'next/link';
import { CTAButton } from '@flippin/ui';

export default function LandingPage() {
  return (
    <div className="grid gap-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 text-slate-100 shadow-xl">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">Flippin'</p>
        <h1 className="text-4xl font-semibold sm:text-5xl">AI-powered reselling and inventory command center</h1>
        <p className="text-lg text-slate-300">
          Intake products in seconds, generate listings with AI, cross-post to marketplaces, and track profit in one place.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <CTAButton href="/intake">Start intake</CTAButton>
        <Link className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-emerald-400/60" href="/items">
          View inventory
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Intake in under 30s',
            body: 'Snap photos, auto-tag, and draft listings with GPT-4o. Signed URLs keep uploads safe.',
          },
          {
            title: 'Cross-list effortlessly',
            body: 'Normalized metadata per marketplace; background workers sync status and pricing.',
          },
          {
            title: 'Profit clarity',
            body: 'Transactions, COGS, and fees roll into realtime dashboards powered by Postgres views.',
          },
        ].map((card) => (
          <div key={card.title} className="card p-4">
            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
            <p className="text-sm text-slate-300">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
