export type CreatorStatus = "pending" | "approved" | "removed";

export interface Niche {
  id: string;
  name: string;
}

export interface Creator {
  id: string;
  name: string;
  instagram_handle: string;
  niche_id: string | null;
  bio: string | null;
  status: CreatorStatus;
  submitted_by: string;
  submitted_by_is_self: boolean;
  contact_email: string | null;
  claim_token: string;
  created_at: string;
  niches?: Niche | null;
}

export interface Support {
  id: string;
  creator_id: string;
  supporter_name: string;
  message: string;
  created_at: string;
}
