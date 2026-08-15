import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

// Placeholder notifier: looks up the creator + claim link and logs it.
// Wire this up to Resend, Postmark, or Supabase's built-in email (via an
// Edge Function + a transactional provider) to actually send mail.
// Never send the claim link anywhere except the address the submitter
// entered for the creator — that address is the consent gate.
export async function POST(req: NextRequest) {
  const { creatorId } = await req.json();
  if (!creatorId) {
    return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: creator } = await supabase
    .from("creators")
    .select("name, contact_email, claim_token")
    .eq("id", creatorId)
    .single();

  if (!creator?.contact_email) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const claimUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/claim/${creator.claim_token}`;

  // TODO: replace with a real email send.
  console.log(
    `[notify] Would email ${creator.contact_email}: confirm your SpotlightIt listing at ${claimUrl}`
  );

  return NextResponse.json({ ok: true });
}
