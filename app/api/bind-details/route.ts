// app/api/bind-details/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side only
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, extra_info, set_step2, set_details_submitted } = body;

    if (!id) {
      return NextResponse.json({ error: "missing id" }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };

    if (extra_info !== undefined) updates.extra_info = extra_info;
    if (set_step2) updates.step = 2;
    if (set_details_submitted) updates.details_submitted = true;

    // Return the updated row so client can confirm
    const { data, error } = await supabase
      .from("account_binds")
      .update(updates)
      .eq("id", id)
      .select("id, status, step, details_submitted, extra_info")
      .single();

    if (error) {
      console.error("bind-details update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ updated: data });
  } catch (err: any) {
    console.error("bind-details server error:", err);
    return NextResponse.json({ error: err.message || "unknown" }, { status: 500 });
  }
}
