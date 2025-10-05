import { InviteCollectionType } from "@/types/invite.type";
import { toast } from "sonner";

export async function copyInviteLink(invite: InviteCollectionType) {
  const link = `${window.location.origin}/${invite.teamId}/invite?token=${invite.token}`;
  try {
    await navigator.clipboard.writeText(link);
  } catch (err) {
    console.error("Erro ao copiar:", err);
  }
}