import { action } from "./_generated/server";
import { v } from "convex/values";

export interface RefinedNote {
  title: string;
  content: string;
}

export const refineNote = action({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<RefinedNote> => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }

    const TIMEOUT_MS = 45000; // 45 seconds

    const systemPrompt = `Role: Precise Markdown Formatter.
Task: Format raw text into a clean bulleted Markdown list (JSON format).

### MANDATORY RULES:
1. **No Paraphrasing**: KEEP the user's exact words, casing, and terminology. NEVER "improve" or change names.
2. **Absolute List Uniformity**: EVERY list item MUST start with exactly "- " followed by the text.
3. **Marker Removal**: DESTROY original markers. Remove numbers (1., 2.), remove checkboxes ([ ], [x]), and remove informal bullets (o, >). Replace them all with a single "- ".
4. **No Interactivity**: NEVER use checkboxes. Only standard bullets.
5. **Structure**: Each item on its own line. Use "### " for titles/headers if provided in the content.
6. **Output**: Return ONLY valid JSON: {"title": "...", "content": "..."}.

### EXAMPLE:
Input: {"title": "buy", "content": "1. apple\\n[x] banana\\no milk\\n> call dad"}
Output: {"title": "buy", "content": "- apple\\n- banana\\n- milk\\n- call dad"}`;

    const userPrompt = `USER_INPUT:
<title>${args.title}</title>
<content>${args.content}</content>

CLEAN AND FORMAT NOW:`;

    // Parse JSON response with error handling
    const parseSafeJSON = (raw: string): any => {
      try {
        const trimmed = raw.trim();
        // If AI wrapped in code blocks, extract content
        const jsonMatch = trimmed.match(/```json?\s*([\s\S]*?)\s*```/);
        const cleanJson = jsonMatch ? jsonMatch[1].trim() : trimmed;
        return JSON.parse(cleanJson);
      } catch (e) {
        throw new Error(
          `Failed to parse AI response as JSON: ${raw.substring(0, 100)}...`
        );
      }
    };

    const formatResult = (data: any): RefinedNote => {
      const ensureString = (val: any) => {
        if (Array.isArray(val)) return val.join("\n");
        return String(val || "");
      };
      return {
        title: ensureString(data.title),
        content: ensureString(data.content),
      };
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = (await response.json()) as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const refined = formatResult(parseSafeJSON(text));
          if (refined.title && refined.content) return refined;
        }
      }

      const errorBody = await response.text();
      throw new Error(
        `Gemini API returned status ${response.status}: ${errorBody}`
      );
    } catch (error) {
      throw new Error(`AI Refinement failed: ${error}`);
    }
  },
});
