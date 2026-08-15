import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { token, action } = await req.json();

  if (!token || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Look the listing up by its claim token — this is the only credential
  // that authorizes a status change here. No token, no update.
  const { data: creator, error: findError } = await supabase
    .from("creators")
    .select("id, status")
    .eq("claim_token", token)
    .single();

  if (findError || !creator) {
    return NextResponse.json(
      { error: "Listing not found for this link." },
      { status: 404 }
    );
  }

  const newStatus = action === "approve" ? "approved" : "removed";

  const { error: updateError } = await supabase
    .from("creators")
    .update({
      status: newStatus,
      claimed_at: action === "approve" ? new Date().toISOString() : null,
    })
    .eq("id", creator.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
