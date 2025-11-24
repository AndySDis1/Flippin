import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { title, images } = await req.json();

    const prompt = `
Generate a listing for a reselling app.
Title: ${title}
Images count: ${images?.length || 0}
    `;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You create marketplace listings." },
          { role: "user", content: prompt },
        ],
      }),
    }).then((r) => r.json());

    return new Response(JSON.stringify(aiResp), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
