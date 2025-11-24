import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { user_id, name } = await req.json();
    if (!user_id || !name) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const res = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/shops`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          owner_id: user_id,
          name: name,
        }),
      }
    );

    const data = await res.json();

    return new Response(JSON.stringify({ success: true, shop: data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
