'use client';

import { useState } from 'react';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  cost: z.number().min(0).optional(),
  shopId: z.string().uuid(),
});

type FormState = z.infer<typeof schema>;

type Props = {
  onUpload: (file: File) => Promise<string>;
  onGenerate: (payload: { title: string; description?: string; images: string[]; shopId: string }) => void;
  loading?: boolean;
};

export function IntakeForm({ onUpload, onGenerate, loading }: Props) {
  const [form, setForm] = useState<FormState>({ title: '', description: '', cost: undefined, shopId: '' } as any);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      setError('Please complete title and shop ID.');
      return;
    }
    setError(null);
    onGenerate({ title: form.title, description: form.description, images, shopId: form.shopId });
  };

  const handleFileChange = async (file?: File | null) => {
    if (!file) return;
    const url = await onUpload(file);
    setImages((prev) => [...prev, url]);
  };

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <label className="text-sm text-slate-200">Title</label>
        <input
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-slate-200">Description</label>
        <textarea
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm text-slate-200">Shop ID</label>
          <input
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={form.shopId}
            onChange={(e) => setForm((f) => ({ ...f, shopId: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-200">Cost (optional)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
            value={form.cost ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, cost: parseFloat(e.target.value) }))}
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm text-slate-200">Photos (up to 10)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
        />
        <p className="text-xs text-slate-400">Uploaded: {images.length}</p>
      </div>
      {error ? <p className="text-sm text-amber-300">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Generating...' : 'Generate listing'}
      </button>
    </form>
  );
}
