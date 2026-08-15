"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimActions({
  token,
  status,
}: {
  token: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function act(action: "approve" | "reject") {
    setLoading(action);
    setError("");
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action }),
    });
    setLoading(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  if (status === "removed") return null;

  return (
    <div>
      {error && <div className="status-banner error">{error}</div>}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        {status === "pending" && (
          <button
            className="btn"
            disabled={loading !== null}
            onClick={() => act("approve")}
          >
            {loading === "approve" ? "Confirming…" : "Yes, this is me — go live"}
          </button>
        )}
        <button
          className="btn danger"
          disabled={loading !== null}
          onClick={() => act("reject")}
        >
          {loading === "reject" ? "Removing…" : "Reject / remove"}
        </button>
      </div>
    </div>
  );
}
