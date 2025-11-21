"use client";

import { InviteFormModal } from "@/components/invite-form-modal";
import PageContainer from "@/components/page-container";
import ProtectedRoute from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { databases, Query, teams } from "@/lib/appwrite";
import { useAuthStore } from "@/stores";
import { useCompanyStore } from "@/stores/company-store";
import { InviteCollectionType } from "@/types/invite.type";
import { Models } from "appwrite";

import { Copy, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const INVITES_COLLECTION_ID = process.env.NEXT_PUBLIC_INVITES_COLLECTION_ID!;

export default function Invites() {
  const params = useParams();
  const teamId = params.id as string;

  const { user, isLoading, custom } = useAuthStore();
  const { getCompanyById } = useCompanyStore();
  const [invites, setInvites] = useState<InviteCollectionType[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const loadInvites = useCallback(async () => {
    if (!user) return;

    setLoadingInvites(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        INVITES_COLLECTION_ID,
        [
          Query.equal("invitedBy", user.$id),
          Query.equal("teamId", teamId),
          Query.orderDesc("createdAt")
        ]
      );
      setInvites(response.documents as InviteCollectionType[]);
    } catch (err) {
      console.error("Erro ao carregar convites:", err);
    } finally {
      setLoadingInvites(false);
    }
  }, [user, teamId]);

  useEffect(() => {
    if (user) {
      loadInvites();
    }
  }, [user, loadInvites]);

  async function revokeInvite(inviteId: string) {
    try {
      await databases.deleteDocument(DATABASE_ID, INVITES_COLLECTION_ID, inviteId);
      loadInvites();
    } catch (err) {
      console.error("Erro ao revogar convite:", err);
    }
  }

  async function copyInviteLink(invite: InviteCollectionType) {
    const link = `${window.location.origin}/${invite.teamId}/invite?token=${invite.token}`;
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copiado!");
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getBadgeVariant(type: string) {
    switch (type) {
      case 'admin': return 'destructive';
      case 'colaborador': return 'default';
      case 'cliente': return 'secondary';
      default: return 'outline';
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute roles={['admin']}>
      <PageContainer title="Criar convite" className="p-4">
        {/* Invites Table Card */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Convites Enviados</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os convites enviados para novos usuários
            </p>
          </div>

          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Convite
          </Button>
        </div>

        <InviteFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          user={user!}
          onInviteCreated={loadInvites}
          teamId={teamId}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInvites ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                      Carregando convites...
                    </div>
                  </TableCell>
                </TableRow>
              ) : invites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <span>Nenhum convite enviado ainda.</span>
                    <br />
                    <span className="text-sm">Clique em <strong>Novo Convite</strong> para começar.</span>
                  </TableCell>
                </TableRow>
              ) : (
                invites.map((invite) => (
                  <TableRow key={invite.$id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(invite.role)}>
                        {invite.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={invite.used ? "default" : "secondary"}>
                        {invite.used ? "✅ Usado" : "⏳ Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(invite.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!invite.used && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInviteLink(invite)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeInvite(invite.$id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
