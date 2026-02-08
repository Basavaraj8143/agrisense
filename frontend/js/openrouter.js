// openrouter.js

export async function getOpenRouterResponse(message, history) {
  // Use the backend proxy instead of direct API call
  const API_URL = (window.CONFIG?.API_BASE_URL || 'http://127.0.0.1:5000') + '/api/chat';

  const payload = {
    model: "meta-llama/llama-3-8b-instruct:free", // Updated to a more stable free model
    messages: [
      { role: "system", content: "You are AgriBot, an agriculture expert assistant. Keep answers concise and helpful for farmers." },

      ...history.map(h => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.parts?.[0]?.text || ""
      })),

      { role: "user", content: message }
    ]
  };

  try {
    console.log("Sending request to Backend Proxy...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return `Error: ${response.status} - Please check backend connection.`;
    }

    const data = await response.json();

    if (data.error) {
      return `Error: ${data.error}`;
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error("Unexpected response format:", data);
      return "Received an unexpected response format from the AI service.";
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.error("Connection Error:", err);
    return `Error: ${err.message}. Please check if the backend server is running.`;
  }
}
