// openrouter.js

export async function getOpenRouterResponse(message, history) {
  const apiKey = "..";  // <-- Replace AFTER you regenerate it

  const payload = {
    model: "meta-llama/llama-4-maverick:free",
    messages: [
      { role: "system", content: "You are AgriBot, an agriculture expert assistant." },

      ...history.map(h => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.parts?.[0]?.text || ""
      })),

      { role: "user", content: message }
    ]
  };

  try {
    console.log("Sending request to OpenRouter...");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.href || "http://localhost",
        "X-Title": "AgriBot Free Assistant"
      },
      body: JSON.stringify(payload)
    });

    console.log("Response status:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return `Error: ${response.status} - ${response.statusText}. Please check the console for details.`;
    }

    const data = await response.json();
    console.log("OpenRouter response:", data);

    if (!data.choices?.[0]?.message?.content) {
      console.error("Unexpected response format:", data);
      return "Received an unexpected response format from the AI service.";
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.error("OpenRouter Error:", err);
    return `Error: ${err.message}. Please check your connection and try again.`;
  }
}

