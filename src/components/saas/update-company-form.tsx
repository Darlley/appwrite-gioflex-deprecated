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
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Models } from "appwrite";

const formSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

interface UpdateCompanyFormProps {
  team: Models.Team<{}>;
}

export default function UpdateCompanyForm({ team }: UpdateCompanyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateCompany } = useCompanyStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team.name,
    },
  });

  useEffect(() => {
    form.reset({ name: team.name });
  }, [team, form]);

  async function onSubmit(values: FormData) {
    try {
      setIsLoading(true);
      await updateCompany(team.$id, values.name);
      toast.success("Empresa renomeada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao renomear empresa.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading || team?.name === form.watch('name')}>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Renomear
        </Button>
      </form>
    </Form>
  );
}