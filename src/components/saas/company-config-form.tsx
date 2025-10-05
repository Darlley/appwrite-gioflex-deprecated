"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCompanyStore } from "@/stores/company-store";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Cursor, CursorFollow, CursorProvider } from "../animate-ui/cursor";

// Esquema geral do formulário
const formSchema = z.object({
  headerTitle: z.string().min(5, "Título obrigatório"),
  headerDescription: z.string().min(10, "Descrição obrigatória"),
  footerPhone: z.string().optional(),
  footerEmail: z.string().email().optional().or(z.literal("")),
  footerAddress: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CompanyConfigForm({ teamId, companyName }: { teamId: string, companyName: string }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [footerLinks, setFooterLinks] = useState<{ label: string; url: string }[]>([]);
  const { createCompanyCollection } = useCompanyStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headerTitle: "",
      headerDescription: "",
      footerPhone: "",
      footerEmail: "",
      footerAddress: "",
    },
  });

  const watchedValues = form.watch();

  async function onSubmit(values: FormData) {
    if (!teamId) {
      toast.error("ID do time não encontrado.");
      return;
    }

    try {
      setIsLoading(true);

      const facebook = footerLinks.find((link) => link.label.toLowerCase() === "facebook")?.url || "";
      const instagram = footerLinks.find((link) => link.label.toLowerCase() === "instagram")?.url || "";

      await createCompanyCollection({
        teamId,
        name: companyName,
        headerTitle: values.headerTitle,
        headerDescription: values.headerDescription,
        footerPhone: values.footerPhone || "",
        footerEmail: values.footerEmail || "",
        footerAddress: values.footerAddress || "",
        facebook,
        instagram,
      });

      toast.success("Landing page criada com sucesso!");
      form.reset();
      setFooterLinks([]);
      setCurrentStep(1);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function addFooterLink() {
    const label = prompt("Instagram ou Facebook?");
    const url = prompt("Digite a URL (deve conter instagram.com ou facebook.com):");

    if (
      label &&
      url &&
      ["instagram", "facebook"].includes(label.toLowerCase()) &&
      (url.includes("instagram.com") || url.includes("facebook.com"))
    ) {
      setFooterLinks([...footerLinks, { label, url }]);
    } else {
      toast.error("Somente links de Instagram ou Facebook são permitidos.");
    }
  }

  function removeFooterLink(index: number) {
    setFooterLinks(footerLinks.filter((_, i) => i !== index));
  }

  return (
    <div className="flex gap-4 text-lg">
      <div className="flex-1 max-w-2xl flex flex-col">
        <div className="mb-8 flex flex-col gap-2">
          <Progress value={(currentStep / 3) * 100} />
          <p className="text-gray-600 text-nowrap">
            {currentStep === 1 && "Configure o cabeçalho da landing page"}
            {currentStep === 2 && "Serviços padrão"}
            {currentStep === 3 && "Configure o rodapé"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow gap-6 flex flex-col">
            {/* Etapa 1 */}
            {currentStep === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="headerTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Protegendo o que importa!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headerDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Descrição da empresa..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Etapa 2 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Os serviços são pré-definidos por enquanto. Você poderá personalizar depois.
                </p>
                <ul className="list-disc list-inside text-sm space-y-2">
                  <li>Rondas noturnas</li>
                  <li>Monitoramento de imóveis</li>
                  <li>Atendimento emergencial</li>
                </ul>
              </div>
            )}

            {/* Etapa 3 */}
            {currentStep === 3 && (
              <>
                <FormField
                  control={form.control}
                  name="footerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="footerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contato@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="footerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Número, Bairro, Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Links (Facebook e Instagram)</FormLabel>
                  <div className="mt-2 space-y-2">
                    {footerLinks.map((link, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
                        <span className="font-medium">{link.label}</span>
                        <span className="text-sm truncate">{link.url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFooterLink(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addFooterLink} className="w-full">
                      <Plus size={16} className="mr-2" /> Adicionar Link
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Navegação */}
            <div className="flex justify-between mt-auto">
              <Button type="button" variant="outline" onClick={() => setCurrentStep((s) => Math.max(s - 1, 1))} disabled={currentStep === 1}>
                <ChevronLeft size={16} className="mr-2" />
                Anterior
              </Button>
              {currentStep < 3 ? (
                <Button type="button" onClick={() => setCurrentStep((s) => s + 1)}>
                  Próximo
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Criando...
                    </>
                  ) : (
                    "Finalizar"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>

      {/* Preview Mobile */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div className="w-80 h-[640px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
                  <h1 className="text-xl font-bold mb-2">
                    {watchedValues.headerTitle || "Título da Empresa"}
                  </h1>
                  <p className="text-sm opacity-90">
                    {watchedValues.headerDescription || "Descrição da empresa aparecerá aqui..."}
                  </p>
                </div>
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-3">Serviços</h2>
                  <ul className="text-sm text-gray-700 list-disc pl-5">
                    <li>Rondas noturnas</li>
                    <li>Monitoramento de imóveis</li>
                    <li>Atendimento emergencial</li>
                  </ul>
                </div>
                <div className="bg-gray-800 text-white p-6 text-center">
                  <h3 className="font-semibold mb-3">
                    {companyName || "Nome da Empresa"}
                  </h3>
                  {watchedValues.footerPhone && (
                    <p className="text-sm mb-1">📞 {watchedValues.footerPhone}</p>
                  )}
                  {watchedValues.footerEmail && (
                    <p className="text-sm mb-1">✉️ {watchedValues.footerEmail}</p>
                  )}
                  {watchedValues.footerAddress && (
                    <p className="text-sm mb-3">📍 {watchedValues.footerAddress}</p>
                  )}
                  {footerLinks.length > 0 && (
                    <div className="space-y-1">
                      {footerLinks.map((link, index) => (
                        <div key={index} className="text-xs text-blue-300">
                          {link.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <CursorProvider>
            <Cursor>
              <svg className="size-6 text-blue-500" viewBox="0 0 40 40">
                <path
                  fill="currentColor"
                  d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
                />
              </svg>
            </Cursor>
            <CursorFollow>
              <div className="bg-blue-500 text-white px-2 py-1 rounded-lg text-sm shadow-lg">
                Cliente
              </div>
            </CursorFollow>
          </CursorProvider>
          <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2">Preview</Badge>
        </div>
      </div>
    </div>
  );
}
