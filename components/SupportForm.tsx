"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function SupportForm({ creatorId }: { creatorId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const { error } = await supabase.from("supports").insert({
      creator_id: creatorId,
      supporter_name: name.trim() || "Anonymous",
      message: message.trim(),
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setName("");
    setMessage("");
    setStatus("idle");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 8 }}>
      <div className="field">
        <label>Your name (optional)</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Message of encouragement</label>
        <textarea
          required
          rows={2}
          maxLength={280}
          placeholder="Loved your latest piece — keep going!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {status === "error" && (
        <div className="status-banner error">{errorMsg}</div>
      )}
      <button className="btn" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Posting…" : "Post cheer"}
      </button>
    </form>
  );
}
