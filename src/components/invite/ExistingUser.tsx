import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteCollectionType } from "@/types/invite.type";
import { useState, useRef } from "react";
import { Confetti, ConfettiRef } from "@/components/animations/confetti";

interface ExistingUserProps {
  inviteData: InviteCollectionType | null;
  loading: boolean;
  handleExistingUserSetup: () => Promise<void>;
  mapRole: Record<string, string>;
}

export function ExistingUser({ inviteData, loading, handleExistingUserSetup, mapRole }: ExistingUserProps) {
  const confettiRef = useRef<ConfettiRef>(null);

  return (
    <div className="flex h-dvh items-center justify-center bg-gray-100 relative">
      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-0 size-full"
        onMouseEnter={() => {
          confettiRef.current?.fire({});
        }}
      />
      <Card className="w-full max-w-md p-6 z-4">
        <CardHeader>
          <CardTitle className="text-center">Bem-vindo!</CardTitle>
          <CardDescription className="text-center">
            <div className="my-2 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">
                Convite válido para acessar a plataforma 🎉
              </p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <p className="text-gray-600 mb-2">
              Olá{inviteData?.email && (
                <strong>, {inviteData?.email}</strong>
              )}
            </p>
            <p className="text-sm text-gray-500">
              Você foi convidado para acessar a plataforma como <strong>{inviteData?.role && mapRole[inviteData.role]}</strong>.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleExistingUserSetup}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Processando..." : "Aceitar convite"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}