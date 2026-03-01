import { createServerSupabaseClient } from '../../lib/supabase-server';
import { AnalyticsCards } from '@flippin/ui';

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient();
  const { data: stats } = await supabase.from('analytics_summary_view').select('*').single();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-emerald-300/80">Analytics</p>
        <h2 className="text-2xl font-semibold text-white">Performance overview</h2>
      </div>
      <AnalyticsCards stats={stats ?? {}} />
    </div>
  );
}
