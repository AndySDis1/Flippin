'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { createBrowserSupabaseClient } from '../../lib/supabase-browser';
import { IntakeForm } from '@flippin/ui';
import { generateListing } from '../../lib/server-actions';

export default function IntakePage() {
  const supabase = createBrowserSupabaseClient();
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  const aiMutation = useMutation({
    mutationFn: generateListing,
    onSuccess: (data) => setDraft(data),
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    const path = `${crypto.randomUUID()}`;
    const { data: signed, error: signError } = await supabase.functions.invoke('create-signed-url', {
      body: { fileName: path, bucket: 'item-photos' },
    });
    if (signError || !signed?.signedUrl) throw signError ?? new Error('Failed to sign');
    await fetch(signed.signedUrl, { method: 'PUT', body: file, headers: signed.headers });
    setUploading(false);
    return signed.publicUrl;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white">New intake</h2>
        <p className="text-sm text-slate-300">Upload photos, describe the item, and let AI draft the listing.</p>
        <IntakeForm onUpload={handleUpload} onGenerate={(payload) => aiMutation.mutate(payload)} loading={aiMutation.isPending || uploading} />
      </div>
      <div className="card p-6 space-y-3">
        <h3 className="text-lg font-semibold text-white">AI draft preview</h3>
        <pre className="overflow-auto rounded bg-slate-950 p-3 text-xs text-emerald-100">
{JSON.stringify(draft ?? { status: 'Waiting for input...' }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
