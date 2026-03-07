export interface RefinedNote {
  title: string;
  content: string;
}

export async function refineNote(title: string, content: string): Promise<RefinedNote> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:1b';
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = `You are a professional note refiner. Take raw notes and format into beautiful Markdown.
- TITLE: Concise and descriptive.
- CONTENT: Use Markdown structure (headings, bullet points, bold text). 
- LISTS: If input has items or points, PRESERVE the list structure.
- TASKS: If input has markers like "[]" or "[x]", convert them to standard Markdown Task Lists: "- [ ]" or "- [x]".
- NO TALK: Return ONLY valid JSON. No conversational filler.`;

  const userPrompt = `INPUT:
Title: ${title}
Content: ${content}

OUTPUT FORMAT:
{"title": "string", "content": "string"}`;

  // Helper to ensure we have a clean string for both title and content
  const formatResult = (data: any): RefinedNote => {
    const ensureString = (val: any) => {
      if (Array.isArray(val)) return val.join('\n');
      return String(val || '');
    };
    return {
      title: ensureString(data.title),
      content: ensureString(data.content)
    };
  };

  // 1. Try Ollama first (Local)
  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        format: 'json',
      }),
    });

    if (response.ok) {
      const data = await response.json() as any;
      const refined = formatResult(JSON.parse(data.message.content));
      if (refined.title && refined.content) return refined;
    }
  } catch (error) {
    console.warn('Ollama refiner failed, trying fallback...', error);
  }

  // 2. Try Gemini fallback if API key is provided
  if (geminiApiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const refined = formatResult(JSON.parse(text));
          if (refined.title && refined.content) return refined;
        }
      }
    } catch (error) {
      console.error('Gemini refiner fallback failed:', error);
    }
  }

  throw new Error('AI Refinement failed (Ollama and Gemini both unavailable or returned invalid data)');
}
