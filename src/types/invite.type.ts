import type { Models } from "appwrite";
import { USER_LABELS } from "@/lib/constants";

export interface InviteCollectionType extends Models.Document {
  token: string;
  email: string;
  role: "company_owner" | "company_employee" | "company_client"
  invitedBy: string;
  invitedByName: string;
  used: boolean;
  usedAt: string | null;
  userId: string | null;
  createdAt: string;
  teamId: string;
};