// Local roasts to guarantee instant response if Google servers return 503 high-demand
const fallbackRoasts = [
  "- $O(N^2)$ detected. Your CPU fans just started preparing for takeoff.\n- Brute-forcing like it's 1995. Even Bubble Sort feels insulted.\n- Did you write this in a rush, or does runtime complexity not apply in your universe?",
  "- Nested loops for equality checks? A hash map died for your sins today.\n- Your variable names look like a cat walked across the keyboard.\n- Memory: clean. Execution time: until the heat death of the universe.",
  "- This code is a textbook example of solving a problem by throwing raw cycles at it.\n- If this passes code review, report the reviewer to HR.\n- Complexity: Yes."
];

async function callGemini(codeSnippet, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a cynical, brilliant, hyper-critical terminal daemon who hates sloppy code. 
Roast the user's code snippet. 
- Criticize their time/space complexity, variable naming, brute force loops, or bad practices.
- Keep it concise: 3 to 4 punchy bullet points.
- Brutal, humorous, yet technically accurate.
- Output ONLY plain text suitable for a retro terminal. Do not use Markdown asterisks (**) or code fences. Use simple dashes (-) for lists.

Target Code to Roast:
${codeSnippet}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || response.statusText);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

export async function fetchRoast(codeSnippet) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_actual_key_here") {
    throw new Error("API Key missing! Add VITE_GEMINI_API_KEY to your .env file.");
  }

  // Attempt 1: Call Google's active model
  try {
    const result = await callGemini(codeSnippet, apiKey);
    if (result) return result;
  } catch (err) {
    // If it's a transient high-demand issue, retry once after a 1.5s pause
    if (err.message.includes("high demand") || err.message.includes("503")) {
      await new Promise(res => setTimeout(res, 1500));
      try {
        const retryResult = await callGemini(codeSnippet, apiKey);
        if (retryResult) return retryResult;
      } catch (retryErr) {
        // Fall back gracefully to local witty daemon output instead of crashing
        const randomPick = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
        return `[OFFLINE HEURISTIC DAEMON - API AT CAPACITY]:\n${randomPick}`;
      }
    }
    
    // For any other network or API fail, return fallback verdict
    const randomPick = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
    return `[OFFLINE HEURISTIC DAEMON - API ERROR]:\n${randomPick}`;
  }
}