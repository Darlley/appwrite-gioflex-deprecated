import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ErrorTokenProps {
  error: string | null;
  teamId: string;
}

export function ErrorToken({ error, teamId }: ErrorTokenProps) {
  return (
    <div className="flex h-dvh items-center justify-center bg-gray-100">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-red-600">
            Acesso Negado
          </CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Para criar uma conta, você precisa de um convite válido. Tente fazer login ou converse com o administrador ou responsável da empresa.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          <Button asChild className="group">
            <Link href={`/${teamId}`}><ArrowLeft className="group-hover:scale-95 group-hover:translate-x-1 transition-transform" /> Ir para o site</Link>
          </Button>
          <Button variant="outline" asChild className="group">
            <Link href={`/${teamId}/signin`}>Fazer Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}