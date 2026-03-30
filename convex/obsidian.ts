import { action } from './_generated/server';
import { v } from 'convex/values';

export const sendToObsidian = action({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
    type: v.string(),
  },
  handler: async (_ctx, args) => {
    // @ts-ignore
    const apiKey = process.env.OBSIDIAN_BRAIN_API_KEY;
    if (!apiKey) throw new Error('OBSIDIAN_BRAIN_API_KEY not configured');

    const TYPE_MAP: Record<string, 'ideia' | 'tarefa' | 'estudo'> = {
      idea: 'ideia',
      task: 'tarefa',
      note: 'estudo',
      bug: 'estudo',
      research: 'estudo',
    };

    const text = [args.title, args.content].filter(Boolean).join('\n\n');

    const payload = { text, type: TYPE_MAP[args.type] };
    console.log('📤 Sending to Obsidian:', payload);

    const res = await fetch('https://obsidian-brain-api.vercel.app/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text, type: TYPE_MAP[args.type] }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('❌ Obsidian API error:', err);
      throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
    }

    const result = await res.json();
    console.log('✅ Obsidian response:', result);
    return result as Promise<{ success: boolean; title: string; filePath: string }>;
  },
});
