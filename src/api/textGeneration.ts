export async function generateText(prompt: string): Promise<string> {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROK_API_KEY}`, // Fixed API key access
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "grok-2-1212",
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await response.json();
  
  // Log the entire response for debugging
  console.log("Full API Response:", data);
  
  return data.choices[0].message.content;
}