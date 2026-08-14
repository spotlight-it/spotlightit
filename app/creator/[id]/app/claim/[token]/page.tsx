import { createServiceClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ClaimActions from "@/components/ClaimActions";

export const revalidate = 0;

export default async function ClaimPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createServiceClient();

  const { data: creator } = await supabase
    .from("creators")
    .select(
      "id, name, instagram_handle, bio, status, submitted_by, submitted_by_is_self, niches(name)"
    )
    .eq("claim_token", params.token)
    .single();

  if (!creator) notFound();

  return (
    <div>
      <h1>Confirm this listing</h1>

      {creator.status === "approved" && (
        <div className="status-banner success">
          This listing is already live. You can still edit or remove it
          below.
        </div>
      )}
      {creator.status === "removed" && (
        <div className="status-banner pending">
          This listing was removed and is not public.
        </div>
      )}
      {creator.status === "pending" && (
        <div className="status-banner pending">
          {creator.submitted_by_is_self
            ? "You submitted this yourself — confirm it to make it public."
            : `${creator.submitted_by} submitted this listing about you. It will not go public unless you confirm it.`}
        </div>
      )}

      <div className="card">
        <div className="niche-tag">{creator.niches?.name}</div>
        <h2 style={{ margin: "8px 0 4px" }}>{creator.name}</h2>
        <p style={{ color: "#6b6478", marginBottom: 4 }}>
          @{creator.instagram_handle}
        </p>
        <p>{creator.bio}</p>
      </div>

      <p className="helper-text" style={{ marginTop: 16 }}>
        Not you, or something looks wrong? Use "Reject / remove" below — the
        listing will be taken down and won't reappear.
      </p>

      <ClaimActions token={params.token} status={creator.status} />
    </div>
  );
}
