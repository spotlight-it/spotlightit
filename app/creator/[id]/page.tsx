import { createClient as createServerReadClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Creator, Support } from "@/lib/types";
import SupportForm from "@/components/SupportForm";

function publicClient() {
  return createServerReadClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const revalidate = 0;

export default async function CreatorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = publicClient();

  const { data: creator } = await supabase
    .from("creators")
    .select("id, name, instagram_handle, bio, status, niches(id, name)")
    .eq("id", params.id)
    .eq("status", "approved")
    .single();

  if (!creator) notFound();

  const { data: supports } = await supabase
    .from("supports")
    .select("id, supporter_name, message, created_at")
    .eq("creator_id", params.id)
    .order("created_at", { ascending: false });

  const c = creator as unknown as Creator;
  const igUrl = `https://instagram.com/${c.instagram_handle}`;

  return (
    <div>
      <div className="profile-header">
        {c.niches?.name && <div className="niche-tag">{c.niches.name}</div>}
        <h1>{c.name}</h1>
        <p style={{ color: "#6b6478" }}>{c.bio}</p>
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
        >
          Visit @{c.instagram_handle} on Instagram
        </a>
      </div>

      <h2 className="section-title">Leave a cheer</h2>
      <SupportForm creatorId={c.id} />

      <h2 className="section-title">
        Support wall {supports && supports.length > 0 && `(${supports.length})`}
      </h2>
      {supports && supports.length > 0 ? (
        <div className="support-wall">
          {(supports as Support[]).map((s) => (
            <div key={s.id} className="support-item">
              <div className="msg">{s.message}</div>
              <div className="who">— {s.supporter_name}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="helper-text">
          No cheers yet — be the first to leave one.
        </p>
      )}
    </div>
  );
}
