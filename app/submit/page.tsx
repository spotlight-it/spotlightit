"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Niche } from "@/lib/types";

export default function SubmitPage() {
  const supabase = createClient();
  const [niches, setNiches] = useState<Niche[]>([]);
  const [isSelf, setIsSelf] = useState(true);
  const [form, setForm] = useState({
    name: "",
    instagram_handle: "",
    niche_id: "",
    bio: "",
    submitted_by: "",
    contact_email: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [claimLink, setClaimLink] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase
      .from("niches")
      .select("id, name")
      .order("name")
      .then(({ data }) => setNiches(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const handle = form.instagram_handle.replace(/^@/, "").trim();

    const { data, error } = await supabase
      .from("creators")
      .insert({
        name: form.name.trim(),
        instagram_handle: handle,
        niche_id: form.niche_id || null,
        bio: form.bio.trim(),
        submitted_by: form.submitted_by.trim(),
        submitted_by_is_self: isSelf,
        contact_email: form.contact_email.trim() || null,
        status: "pending",
      })
      .select("id, claim_token")
      .single();

    if (error || !data) {
      setStatus("error");
      setErrorMsg(error?.message ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("done");
    setClaimLink(`${window.location.origin}/claim/${data.claim_token}`);

    // If a contact email was provided, trigger the notification route.
    // (Wiring an email provider is left to you — see README for options.)
    if (form.contact_email.trim()) {
      fetch("/api/claim/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: data.id }),
      }).catch(() => {});
    }
  }

  if (status === "done") {
    return (
      <div>
        <div className="status-banner success">
          Submitted! This listing is <strong>pending</strong> and won't be
          public until the creator confirms it.
        </div>
        {isSelf ? (
          <div className="card">
            <p>
              Since this is your own profile, confirm it now so it can go
              live:
            </p>
            <a href={claimLink!} className="btn">
              Confirm my listing
            </a>
          </div>
        ) : (
          <div className="card">
            <p>Share this private link with them so they can confirm it:</p>
            <p
              style={{
                wordBreak: "break-all",
                fontSize: 13,
                background: "#f4f2f8",
                padding: 10,
                borderRadius: 8,
              }}
            >
              {claimLink}
            </p>
            <p className="helper-text" style={{ marginTop: 12 }}>
              Nothing is public until they click that link and approve it
              themselves.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>Submit a creator</h1>
      <p className="helper-text" style={{ marginBottom: 20 }}>
        Submitting for a friend? Great — but nothing goes live until they
        confirm it themselves.
      </p>

      <div className="pill-row" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`pill ${isSelf ? "active" : ""}`}
          onClick={() => setIsSelf(true)}
        >
          This is me
        </button>
        <button
          type="button"
          className={`pill ${!isSelf ? "active" : ""}`}
          onClick={() => setIsSelf(false)}
        >
          A friend
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Creator's name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="field">
          <label>Instagram handle</label>
          <input
            required
            placeholder="@handle"
            value={form.instagram_handle}
            onChange={(e) =>
              setForm({ ...form, instagram_handle: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Niche</label>
          <select
            required
            value={form.niche_id}
            onChange={(e) => setForm({ ...form, niche_id: e.target.value })}
          >
            <option value="">Select a niche</option>
            {niches.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Short bio</label>
          <textarea
            required
            rows={3}
            maxLength={280}
            placeholder="A sentence or two about their work"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <div className="field">
          <label>{isSelf ? "Your name" : "Your name (submitter)"}</label>
          <input
            required
            value={form.submitted_by}
            onChange={(e) =>
              setForm({ ...form, submitted_by: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>
            {isSelf ? "Your email" : "Creator's email"} (optional — helps them
            get the confirm link faster)
          </label>
          <input
            type="email"
            value={form.contact_email}
            onChange={(e) =>
              setForm({ ...form, contact_email: e.target.value })
            }
          />
        </div>

        {status === "error" && (
          <div className="status-banner error">{errorMsg}</div>
        )}

        <button className="btn" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting…" : "Submit"}
        </button>
      </form>
    </div>
  );
            }
            
