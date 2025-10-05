import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { databases, ID, Query } from "@/lib/appwrite";
import { APPWRITE_CONFIG, USER_LABELS } from "@/lib/constants";
import { copyInviteLink } from "@/lib/copy-invite-link";
import { inviteFormSchema, type InviteFormData } from "@/lib/schemas/invite.schemas";
import { v4 as uuidv4 } from 'uuid';
import { InviteCollectionType } from "@/types/invite.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DATABASE_ID = APPWRITE_CONFIG.CLIENT.DATABASE_ID!;
const INVITES_COLLECTION_ID = APPWRITE_CONFIG.CLIENT.COLLECTIONS.INVITATIONS;

interface InviteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { $id: string; name?: string; email: string };
  onInviteCreated: () => void;
  teamId: string;
}

export function InviteFormModal({ open, onOpenChange, user, onInviteCreated, teamId }: InviteFormModalProps) {
  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: USER_LABELS.COMPANY_CLIENT,
      message: "",
    },
  });

  const resetForm = () => {
    form.reset({
      email: "",
      role: USER_LABELS.COMPANY_CLIENT,
      message: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  async function handleCreateInvite(data: InviteFormData) {

    try {
      const existingInvites = await databases.listDocuments<InviteCollectionType>(
        DATABASE_ID,
        INVITES_COLLECTION_ID,
        [
          Query.equal("email", data.email),
          Query.equal("used", false),
          Query.equal("teamId", teamId)
        ]
      );

      if (existingInvites.documents.length > 0) {
        toast.error("Já existe um convite pendente para este email nesta empresa.", {
          action: {
            label: 'Copiar link',
            onClick: () => copyInviteLink(existingInvites.documents[0])
          },
        })
        return;
      }

      const token = uuidv4();

      const users = await databases.listDocuments(
        DATABASE_ID,
        APPWRITE_CONFIG.CLIENT.COLLECTIONS.USERS,
        [
          Query.equal("email", data.email),
        ]
      );

      const existingUser = users.documents[0]
      let dataObject: {
        token: string;
        email: string;
        role: string;
        invitedBy: string;
        invitedByName: string;
        used: boolean;
        createdAt: string;
        teamId: string;
        userId?: string;
      } = {
        token,
        email: data.email,
        role: data.role,
        invitedBy: user.$id,
        invitedByName: user.name || user.email,
        used: false,
        createdAt: new Date().toISOString(),
        teamId: teamId
      }

      if (existingUser) {
        dataObject = {
          ...dataObject,
          userId: existingUser.$id,
        }
      }

      await databases.createDocument(
        DATABASE_ID,
        INVITES_COLLECTION_ID,
        ID.unique(),
        dataObject
      );

      resetForm();
      onOpenChange(false);
      onInviteCreated();
      toast.success("Convite criado com sucesso!");

    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Erro ao gerar convite.");
      console.error("Erro ao criar convite:", err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(handleCreateInvite)}>
          <DialogHeader>
            <DialogTitle>Criar Novo Convite</DialogTitle>
            <DialogDescription>
              Envie um convite para um novo usuário se juntar à empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail do convidado</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Tipo de usuário</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) => form.setValue("role", value as "company_employee" | "company_client" | "company_owner")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_employee">Colaborador</SelectItem>
                  <SelectItem value="company_client">Cliente</SelectItem>
                  <SelectItem value="company_owner">Administrador</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Mensagem (opcional)</Label>
              <Input
                id="message"
                placeholder="Mensagem personalizada para o convite"
                {...form.register("message")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Criando..." : "Criar Convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
