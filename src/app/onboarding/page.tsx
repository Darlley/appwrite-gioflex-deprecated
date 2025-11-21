"use client"

import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { USER_LABELS } from "@/lib/constants"
import { useAuthStore } from "@/stores"
import { useCompanyStore } from "@/stores/company-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building, Loader2 } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, "Nome da empresa é obrigatório"),
})

type FormData = z.infer<typeof formSchema>

export default function OnboardingPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const { fetchCompanies, companies, createCompanyTeam, validateCompany, createCompanyCollection } = useCompanyStore()
  const { user, custom, isAuthenticated, updateOnboarding, isLoading: isAuthLoading, updateTeam } = useAuthStore()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  useEffect(() => {
    // fetchCompanies()
    const checkOwnershipAndRedirect = async () => {
      if (isAuthenticated) {
        if (custom?.completeOnboarding) {
          const firstCompany = companies[0];
          if (firstCompany) {
            return router.push(`/${firstCompany.$id}/dashboard`);
          }
        }
        return
      } else { 
        return router.push(`/signin`);
      } 
      
    }
    checkOwnershipAndRedirect()
  }, [companies, custom, isAuthenticated, router, fetchCompanies])

  async function onSubmit(values: FormData) {
    if (!user) {
      router.push(`/signin`);
      return
    }

    setIsLoading(true)
    try {
      const { isValid, message } = await validateCompany(values.name)
      if (!isValid) {
        toast.error(message)
        return
      }

      const createdTeam = await createCompanyTeam(values.name)

      await createCompanyCollection({ name: values.name, userId: user.$id }, createdTeam?.$id)
      await updateOnboarding(true)
      await updateTeam(createdTeam?.$id)

      toast.success("Empresa criada com sucesso!")
      router.push(`/${createdTeam.$id}/dashboard`)

    } catch (error: any) {
      toast.error(error.message || "Erro ao criar empresa.")
      form.setError("name", {
        message: error.message || "Erro ao criar empresa.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // text 
  const LETTER_DELAY = 0.025;
  const BOX_FADE_DURATION = 0.125;

  const FADE_DELAY = 5;
  const MAIN_FADE_DURATION = 0.25;

  const SWAP_DELAY_IN_MS = 5500;
  const examples = [
    "Giroflex",
    "Darlley Monitoramento",
  ]
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setExampleIndex((pv) => (pv + 1) % examples.length);
    }, SWAP_DELAY_IN_MS);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <ProtectedRoute permissions={[USER_LABELS.SAAS_OWNER, USER_LABELS.SAAS_CLIENT]}>
      <div className="flex items-center justify-center h-dvh bg-neutral-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md px-8 py-10 text-neutral-800">
          {
            isAuthLoading ? (
              <div>
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : (

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-xl space-y-8">
                  <div>
                    <p className="mb-1.5 text-sm font-light uppercase">/ Onboarding</p>
                    <hr className="border-neutral-700" />
                    <h2 className="text-2xl font-bold my-4">Criar Nova Empresa</h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="text-xl leading-relaxed inline"
                          children={(
                            <p className="max-w-lg text-xl leading-relaxed inline">Escolha o nome da sua empresa</p>
                          )}
                        />
                        <FormControl>
                          <Input className="text-xl" placeholder="Digite aqui" {...field} disabled={custom?.completeOnboarding} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <p className="mb-2.5 text-sm font-light uppercase">
                      <span className="inline-block size-2 bg-neutral-950" />
                      <span className="ml-3">
                        Exemplos:{" "}
                        {examples[exampleIndex].split("").map((l, i) => (
                          <motion.span
                            initial={{
                              opacity: 1,
                            }}
                            animate={{
                              opacity: 0,
                            }}
                            transition={{
                              delay: FADE_DELAY,
                              duration: MAIN_FADE_DURATION,
                              ease: "easeInOut",
                            }}
                            key={`${exampleIndex}-${i}`}
                            className="relative"
                          >
                            <motion.span
                              initial={{
                                opacity: 0,
                              }}
                              animate={{
                                opacity: 1,
                              }}
                              transition={{
                                delay: i * LETTER_DELAY,
                                duration: 0,
                              }}
                            >
                              {l}
                            </motion.span>
                            <motion.span
                              initial={{
                                opacity: 0,
                              }}
                              animate={{
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                delay: i * LETTER_DELAY,
                                times: [0, 0.1, 1],
                                duration: BOX_FADE_DURATION,
                                ease: "easeInOut",
                              }}
                              className="absolute bottom-[3px] left-[1px] right-0 top-[3px] bg-neutral-950"
                            />
                          </motion.span>
                        ))}
                      </span>
                    </p>
                    <hr className="border-neutral-300" />
                  </div>

                  <Button type="submit" className="cursor-pointer w-full" size="lg" disabled={isLoading || custom?.completeOnboarding}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Building />
                        Criar Empresa
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )
          }
        </div>
      </div>
    </ProtectedRoute>
  )
}