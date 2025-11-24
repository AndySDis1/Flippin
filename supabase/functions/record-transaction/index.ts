import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { item_id, marketplace, sale_price, fees, shipping_cost } = await req.json();

    const body = {
      item_id,
      marketplace,
      sale_price,
      fees,
      shipping_cost,
      net_profit: sale_price - fees - shipping_cost,
    };

    const { data, error } = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify(body),
      }
    ).then((res) => res.json());

    if (error) return new Response(JSON.stringify(error), { status: 400 });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
