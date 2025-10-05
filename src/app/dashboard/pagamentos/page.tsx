"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, AlertCircle, Plus, Check, Copy, Search, Filter, RefreshCw } from "lucide-react"
import PageContainer from "@/components/page-container"
import { toast } from "sonner"

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  servico: string
  valor: number
  diaVencimento: number
  chavePix?: string
  status: "ativo" | "inativo"
}

interface Cobranca {
  id: string
  clienteId: string
  mes: string
  ano: number
  valor: number
  status: "pendente" | "pago" | "vencido"
  dataVencimento: string
  dataPagamento?: string
  linkPagamento?: string
}

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export default function CobrancaApp() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([])
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({})
  const [dialogAberto, setDialogAberto] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [busca, setBusca] = useState("")
  const [mesAtual] = useState(new Date().getMonth())
  const [anoAtual] = useState(new Date().getFullYear())
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)

  // Dados iniciais de exemplo
  useEffect(() => {
    const clientesIniciais: Cliente[] = [
      {
        id: "1",
        nome: "João Silva",
        email: "joao@email.com",
        telefone: "(11) 99999-9999",
        servico: "Consultoria Digital",
        valor: 500.00,
        diaVencimento: 5,
        chavePix: "joao@email.com",
        status: "ativo"
      }
    ]
    setClientes(clientesIniciais)
  }, [])

  const adicionarCliente = () => {
    if (!novoCliente.nome || !novoCliente.email || !novoCliente.valor) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    const cliente: Cliente = {
      id: Date.now().toString(),
      nome: novoCliente.nome!,
      email: novoCliente.email!,
      telefone: novoCliente.telefone || "",
      servico: novoCliente.servico || "",
      valor: novoCliente.valor!,
      diaVencimento: novoCliente.diaVencimento || 10,
      chavePix: novoCliente.chavePix || "",
      status: "ativo",
    }

    setClientes(prev => [...prev, cliente])
    setNovoCliente({})
    setDialogAberto(false)

    toast.success(`${cliente.nome} foi adicionado com sucesso.`)
  }

  const gerarCobrancasDoMes = () => {
    const novasCobrancas: Cobranca[] = []

    clientes
      .filter((c) => c.status === "ativo")
      .forEach((cliente) => {
        const jaExiste = cobrancas.find(
          (c) => c.clienteId === cliente.id && c.mes === meses[mesAtual] && c.ano === anoAtual,
        )

        if (!jaExiste) {
          const dataVencimento = new Date(anoAtual, mesAtual, cliente.diaVencimento)
          const hoje = new Date()

          novasCobrancas.push({
            id: Date.now().toString() + cliente.id,
            clienteId: cliente.id,
            mes: meses[mesAtual],
            ano: anoAtual,
            valor: cliente.valor,
            status: dataVencimento < hoje ? "vencido" : "pendente",
            dataVencimento: dataVencimento.toISOString().split("T")[0],
            linkPagamento: gerarLinkPagamento(cliente),
          })
        }
      })

    if (novasCobrancas.length > 0) {
      setCobrancas(prev => [...prev, ...novasCobrancas])
      toast.success(`${novasCobrancas.length} cobranças foram criadas para ${meses[mesAtual]}.`)
    } else {
      toast.info("Nenhuma cobrança nova", {
        description: "Todas as cobranças do mês já foram geradas."
      })
    }
  }

  const gerarLinkPagamento = (cliente: Cliente) => {
    if (cliente.chavePix) {
      return `https://nubank.com.br/pagar/${cliente.chavePix}/${cliente.valor}`
    }
    return `mailto:${cliente.email}?subject=Cobrança ${meses[mesAtual]}&body=Olá ${cliente.nome}, sua cobrança de R$ ${cliente.valor.toFixed(2)} está disponível.`
  }

  const marcarComoPago = (cobrancaId: string) => {
    setCobrancas(prev =>
      prev.map((c) =>
        c.id === cobrancaId ? { ...c, status: "pago" as const, dataPagamento: new Date().toISOString().split("T")[0] } : c,
      ),
    )
    toast.success("Cobrança marcada como paga.")
  }

  const copiarLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Link de pagamento copiado para a área de transferência.")
    } catch (err) {
      console.error(err)
      toast.error("Não foi possível copiar o link.")
    }
  }

  const handleCreateGoogleCalendarEvents = async () => {
    const eventos = clientes
      .filter((c) => c.status === "ativo")
      .map((cliente) => {
        const dataVencimento = new Date(anoAtual, mesAtual, cliente.diaVencimento);
        const startDateTime = new Date(dataVencimento);
        startDateTime.setHours(9, 0, 0, 0);
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1);

        return {
          summary: `Cobrança - ${cliente.nome}`,
          description: `Cobrança mensal de R$ ${cliente.valor.toFixed(2)} - ${cliente.servico}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          recurrence: [
            'RRULE:FREQ=MONTHLY'
          ],
          attendees: [{ email: cliente.email }],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', 'minutes': 24 * 60 },
              { method: 'popup', 'minutes': 10 },
            ],
          },
        };
      });

    try {
      for (const event of eventos) {
        await fetch('/api/google/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      }
      toast.success(`${eventos.length} eventos foram criados no Google Calendar.`);
    } catch (error) {
      toast.error("Erro ao criar eventos no Google Calendar.");
      console.error(error);
    }
  };

  const cobrancasDoMes = cobrancas.filter((c) => c.mes === meses[mesAtual] && c.ano === anoAtual)

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    const cobrancaCliente = cobrancasDoMes.find((c) => c.clienteId === cliente.id)
    const statusCobranca = cobrancaCliente?.status || "sem-cobranca"

    const matchBusca =
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase())

    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "pago" && statusCobranca === "pago") ||
      (filtroStatus === "pendente" && statusCobranca === "pendente") ||
      (filtroStatus === "vencido" && statusCobranca === "vencido")

    return matchBusca && matchStatus
  })

  const getStatusCobranca = (clienteId: string) => {
    const cobranca = cobrancasDoMes.find((c) => c.clienteId === clienteId)
    return cobranca?.status || "sem-cobranca"
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pago":
        return "Pago"
      case "pendente":
        return "Pendente"
      case "vencido":
        return "Em Atraso"
      default:
        return "Sem Cobrança"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-100 text-green-800"
      case "pendente":
        return "bg-yellow-100 text-yellow-800"
      case "vencido":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <PageContainer title="Cobranças e Pagamentos" className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sistema de Cobrança</h2>
            <p className="text-gray-500 text-sm">Controle suas cobranças de forma simples e eficiente</p>
            </div>
            <div className="flex gap-2">
            <Button variant="outline" onClick={gerarCobrancasDoMes}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Cobranças
            </Button>
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                    <DialogDescription>
                    Preencha os dados do cliente para começar a gerar cobranças.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                        id="nome"
                        value={novoCliente.nome || ""}
                        onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={novoCliente.email || ""}
                        onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                        id="telefone"
                        value={novoCliente.telefone || ""}
                        onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="servico">Serviço</Label>
                    <Input
                        id="servico"
                        value={novoCliente.servico || ""}
                        onChange={(e) => setNovoCliente({ ...novoCliente, servico: e.target.value })}
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="valor">Valor Mensal *</Label>
                    <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={novoCliente.valor || ""}
                        onChange={(e) => setNovoCliente({ ...novoCliente, valor: Number.parseFloat(e.target.value) })}
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="vencimento">Dia do Vencimento</Label>
                    <Select
                        value={novoCliente.diaVencimento?.toString() || "10"}
                        onValueChange={(value) =>
                        setNovoCliente({ ...novoCliente, diaVencimento: Number.parseInt(value) })
                        }
                    >
                        <SelectTrigger>
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((dia) => (
                            <SelectItem key={dia} value={dia.toString()}>
                            {dia}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="pix">Chave PIX (opcional)</Label>
                    <Input
                        id="pix"
                        value={novoCliente.chavePix || ""}
                        onChange={(e) => setNovoCliente({ ...novoCliente, chavePix: e.target.value })}
                    />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={adicionarCliente}>Adicionar Cliente</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tabela" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tabela">Tabela</TabsTrigger>
            <TabsTrigger value="calendar">Google Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="tabela" className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Buscar clientes..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="vencido">Em Atraso</SelectItem>
                </SelectContent>
                </Select>
            </div>

            {/* Status da aplicação */}
            <div className="flex gap-4 text-sm text-gray-600 bg-white p-4 rounded-lg border">
                <span>📊 Total de Clientes: <strong>{clientes.length}</strong></span>
                <span>🔄 Cobranças do Mês: <strong>{cobrancasDoMes.length}</strong></span>
                <span>📅 Mês Atual: <strong>{meses[mesAtual]} {anoAtual}</strong></span>
            </div>

            {/* Tabela */}
            <Card>
                <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Serviço
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vencimento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                        </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {clientesFiltrados.map((cliente) => {
                        const statusCobranca = getStatusCobranca(cliente.id)
                        const cobrancaAtual = cobrancasDoMes.find((c) => c.clienteId === cliente.id)

                        return (
                            <tr key={cliente.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                <Avatar className="w-10 h-10 bg-blue-100">
                                    <AvatarFallback className="text-blue-600 font-semibold">
                                    {cliente.nome.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                                </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{cliente.email}</div>
                                <div className="text-sm text-gray-500">{cliente.telefone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{cliente.servico}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">R$ {cliente.valor.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">Dia {cliente.diaVencimento}</div>
                                {cobrancaAtual && (
                                <div className="text-xs text-gray-500">
                                    {new Date(cobrancaAtual.dataVencimento).toLocaleDateString("pt-BR")}
                                </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={`${getStatusColor(statusCobranca)} border-0`}>
                                {statusCobranca === "vencido" && <AlertCircle className="w-3 h-3 mr-1" />}
                                {statusCobranca === "pago" && <Check className="w-3 h-3 mr-1" />}
                                {getStatusLabel(statusCobranca)}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                {cobrancaAtual && cobrancaAtual.status !== "pago" && (
                                    <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copiarLink(cobrancaAtual.linkPagamento || "")}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => marcarComoPago(cobrancaAtual.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    </>
                                )}
                                </div>
                            </td>
                            </tr>
                        )
                        })}
                    </tbody>
                    </table>
                </div>
                
                {clientesFiltrados.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                    <p>Nenhum cliente encontrado</p>
                    <p className="text-sm">Adicione novos clientes ou ajuste os filtros</p>
                    </div>
                )}
                </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                <h2 className="text-2xl font-bold">Integração Google Calendar</h2>
                <p className="text-gray-600">Crie eventos mensais no Google Calendar para suas cobranças</p>
                </div>
                {isGoogleConnected ? (
                  <Badge variant="default">Conectado ao Google</Badge>
                ) : (
                  <Button asChild>
                    <a href="/api/google/auth">Conectar ao Google</a>
                  </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Configurações */}
                <Card>
                <CardHeader>
                    <CardTitle>Configurar Eventos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label>Título do Evento</Label>
                    <Input placeholder="Cobrança - [Nome do Cliente]" value="Cobrança - [Nome do Cliente]" readOnly />
                    </div>

                    <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                        placeholder="Cobrança mensal de R$ [Valor]"
                        value="Cobrança mensal de R$ [Valor] - [Serviço]"
                        readOnly
                    />
                    </div>

                    <div className="space-y-2">
                    <Label>Horário do Lembrete</Label>
                    <Select defaultValue="09:00">
                        <SelectTrigger>
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="08:00">08:00</SelectItem>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="16:00">16:00</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleCreateGoogleCalendarEvents}
                    disabled={!isGoogleConnected}
                    >
                    <Calendar className="w-4 h-4 mr-2" />
                    Criar Eventos no Google Calendar
                    </Button>
                </CardContent>
                </Card>

                {/* Preview dos Eventos */}
                <Card>
                <CardHeader>
                    <CardTitle>Preview dos Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                    {clientes
                        .filter((c) => c.status === "ativo")
                        .map((cliente) => {
                        const dataVencimento = new Date(anoAtual, mesAtual, cliente.diaVencimento)

                        return (
                            <div key={cliente.id} className="border rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                <h4 className="font-medium">Cobrança - {cliente.nome}</h4>
                                <p className="text-sm text-gray-600">
                                    R$ {cliente.valor.toFixed(2)} - {cliente.servico}
                                </p>
                                <p className="text-xs text-gray-500">
                                    📅 {dataVencimento.toLocaleDateString("pt-BR")} às 09:00
                                </p>
                                <p className="text-xs text-gray-500">📧 {cliente.email}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                {dataVencimento.toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                })}
                                </Badge>
                            </div>
                            </div>
                        )
                        })}
                    </div>

                    {clientes.filter((c) => c.status === "ativo").length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum cliente ativo encontrado</p>
                        <p className="text-sm">Adicione clientes para criar eventos</p>
                    </div>
                    )}
                </CardContent>
                </Card>
            </div>
            </TabsContent>
        </Tabs>
    </PageContainer>
  )
}