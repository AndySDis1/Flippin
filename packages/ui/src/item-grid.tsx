import Image from 'next/image';
import { clsx } from 'clsx';

export type Item = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  price?: number | null;
  cost?: number | null;
  primary_photo_url?: string | null;
};

export function ItemGrid({ items }: { items: Item[] }) {
  if (!items.length) {
    return <div className="card p-6 text-slate-300">No items yet. Intake something new!</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="card overflow-hidden">
          {item.primary_photo_url ? (
            <div className="relative h-48 w-full">
              <Image src={item.primary_photo_url} alt={item.title} fill className="object-cover" />
            </div>
          ) : null}
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between text-xs uppercase text-slate-400">
              <span>{item.status ?? 'Draft'}</span>
              {item.price ? <span className="text-emerald-300">${item.price.toFixed(2)}</span> : null}
            </div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-slate-300 line-clamp-2">{item.description}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {item.cost ? (
                <span className="rounded-full bg-slate-800 px-2 py-1">COGS ${item.cost.toFixed(2)}</span>
              ) : null}
              {item.price && item.cost ? (
                <span
                  className={clsx(
                    'rounded-full px-2 py-1',
                    item.price - item.cost > 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-100',
                  )}
                >
                  Margin ${(item.price - item.cost).toFixed(2)}
                </span>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
