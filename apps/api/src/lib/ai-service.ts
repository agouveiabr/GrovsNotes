export interface RefinedNote {
  title: string;
  content: string;
}

export async function refineNote(title: string, content: string): Promise<RefinedNote> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b';
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const TIMEOUT_MS = 45000; // 45 seconds

  const systemPrompt = `Role: Precise Markdown Formatter.
Task: Convert raw text to Markdown structure using JSON.

### MANDATORY RULES:
1. **Strict Content Preservation**: NEVER paraphrase or "improve" the user's text. DO NOT change words (e.g., "talvez adicionar" must STAY "talvez adicionar"). Keep the user's exact vocabulary, terminology, and casing.
2. **Structural Mapping**: Only add Markdown syntax (### Headers, - Bullet points).
3. **No Interactivity**: Never use "- [ ]" or "- [x]". Use standard "- " bullets for every list item, even tasks.
4. **List Detection**: Convert line markers like "1. ", "o ", "> ", "[] ", or sequential items into standard "- " bullets.
5. **Language**: strictly stay in the original language (Portuguese/English).
6. **Output**: Return ONLY a JSON object with "title" and "content".

### EXAMPLE:
Input: {"title": "ideias app", "content": "pegar texto\n[] mandar pra ia\ntalvez adicionar: exportar md"}
Output: {"title": "ideias app", "content": "- pegar texto\\n- mandar pra ia\\n- talvez adicionar: exportar md"}`;

  const userPrompt = `USER_INPUT:
<title>${title}</title>
<content>${content}</content>

FORMAT DATA NOW:`;

  // Robustly extract and parse JSON from string
  const parseSafeJSON = (raw: string): any => {
    try {
      const trimmed = raw.trim();
      // If AI wrapped in code blocks, extract content
      const jsonMatch = trimmed.match(/```json?\s*([\s\S]*?)\s*```/);
      const cleanJson = jsonMatch ? jsonMatch[1].trim() : trimmed;
      return JSON.parse(cleanJson);
    } catch (e) {
      throw new Error(`Failed to parse AI response as JSON: ${raw.substring(0, 100)}...`);
    }
  };

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
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
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json() as any;
      const refined = formatResult(parseSafeJSON(data.message.content));
      if (refined.title && refined.content) return refined;
    }
  } catch (error) {
    console.warn('Ollama refiner failed or timed out, trying fallback...', error);
  }

  // 2. Try Gemini fallback if API key is provided
  if (geminiApiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        }),
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const refined = formatResult(parseSafeJSON(text));
          if (refined.title && refined.content) return refined;
        }
      }
    } catch (error) {
      console.error('Gemini refiner fallback failed or timed out:', error);
    }
  }

  throw new Error('AI Refinement failed (All providers unavailable or returned invalid data)');
}
