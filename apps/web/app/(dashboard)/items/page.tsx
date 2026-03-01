import { createServerSupabaseClient } from '../../lib/supabase-server';
import { ItemGrid } from '@flippin/ui';

export default async function ItemsPage() {
  const supabase = createServerSupabaseClient();
  const { data: items, error } = await supabase.from('items_view').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error(error.message);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-300/80">Inventory</p>
          <h2 className="text-2xl font-semibold text-white">All items</h2>
        </div>
      </div>
      <ItemGrid items={items ?? []} />
    </div>
  );
}
