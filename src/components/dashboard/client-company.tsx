"use client"

import Link from "next/link"
import { Button } from "../ui/button"
import { MapPinned } from "lucide-react"

function ClientCompanyDashboard({ teamId }: { teamId: string }) {

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Meu Painel de Segurança
          </h2>
          <p className="text-gray-500 text-sm">
            Controle e gerencie seus endereços, pagamentos e os serviços que oferecemos
          </p>
        </div>
      </div>

      <div>teamId {teamId}</div>
    </>
  )
}

export default ClientCompanyDashboard