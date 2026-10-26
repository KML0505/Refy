export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function callChat(system: string, messages: ChatMsg[]): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!apiKey || !model) throw new Error("AI_API_KEY and AI_MODEL must be set");

  // The API expects the conversation to start with a user message.
  const firstUser = messages.findIndex((m) => m.role === "user");
  const trimmed = firstUser === -1 ? [] : messages.slice(firstUser);
  if (trimmed.length === 0) throw new Error("No user message");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: trimmed.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
      }),
    }
  );

  const body = await res.text();
  if (!res.ok) throw new Error(`AI API ${res.status}: ${body.slice(0, 300)}`);
  const data = JSON.parse(body);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("AI returned no text");
  return text;
}