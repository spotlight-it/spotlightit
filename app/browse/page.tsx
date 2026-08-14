import { createClient as createServerReadClient } from "@supabase/supabase-js";
import Link from "next/link";
import type { Creator, Niche } from "@/lib/types";

// Public, read-only client (anon key, no cookies needed for this page)
function publicClient() {
  return createServerReadClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const revalidate = 0;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { niche?: string; q?: string };
}) {
  const supabase = publicClient();

  const { data: niches } = await supabase
    .from("niches")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("creators")
    .select("id, name, instagram_handle, bio, niche_id, niches(id, name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (searchParams.niche) {
    query = query.eq("niche_id", searchParams.niche);
  }
  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }

  const { data: creators } = await query;

  return (
    <div>
      <h1>Browse creators</h1>

      <form style={{ marginBottom: 16 }}>
        <input
          type="text"
          name="q"
          placeholder="Search by name…"
          defaultValue={searchParams.q}
        />
      </form>

      <div className="pill-row">
        <Link
          href="/browse"
          className={`pill ${!searchParams.niche ? "active" : ""}`}
        >
          All
        </Link>
        {(niches as Niche[] | null)?.map((n) => (
          <Link
            key={n.id}
            href={`/browse?niche=${n.id}`}
            className={`pill ${searchParams.niche === n.id ? "active" : ""}`}
          >
            {n.name}
          </Link>
        ))}
      </div>

      {creators && creators.length > 0 ? (
        <div className="creator-list">
          {(creators as unknown as Creator[]).map((c) => (
            <Link
              key={c.id}
              href={`/creator/${c.id}`}
              className="card creator-card"
            >
              <div>
                <div className="name">{c.name}</div>
                <div className="handle">@{c.instagram_handle}</div>
                {c.niches?.name && (
                  <div className="niche-tag">{c.niches.name}</div>
                )}
              </div>
              <span className="btn secondary" style={{ padding: "8px 14px" }}>
                View
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No creators here yet.</p>
          <Link href="/submit" className="btn">
            Be the first to submit one
          </Link>
        </div>
      )}
    </div>
  );
}
