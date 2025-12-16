type Stats = {
  total_items?: number;
  listed_items?: number;
  sold_items?: number;
  gross_revenue?: number;
  total_cost?: number;
  net_profit?: number;
};

const cards: { key: keyof Stats; label: string; formatter?: (value: number) => string }[] = [
  { key: 'total_items', label: 'Total items' },
  { key: 'listed_items', label: 'Listed' },
  { key: 'sold_items', label: 'Sold' },
  { key: 'gross_revenue', label: 'Gross', formatter: (v) => `$${v.toFixed(2)}` },
  { key: 'total_cost', label: 'COGS', formatter: (v) => `$${v.toFixed(2)}` },
  { key: 'net_profit', label: 'Net Profit', formatter: (v) => `$${v.toFixed(2)}` },
];

export function AnalyticsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const raw = stats?.[card.key] ?? 0;
        const value = typeof raw === 'number' ? raw : Number(raw) || 0;
        return (
          <div key={card.key} className="card p-4">
            <p className="text-xs uppercase text-slate-400">{card.label}</p>
            <p className="text-3xl font-semibold text-white">{card.formatter ? card.formatter(value) : value}</p>
          </div>
        );
      })}
    </div>
  );
}
