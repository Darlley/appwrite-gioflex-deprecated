import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BirthdayCalendar from "@/components/birthday-calendar";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Confetti, ConfettiRef } from "@/components/animations/confetti";
import { useRef } from "react";

// Validation schema
export const stepOneSchema = z.object({
  name: z.string().min(2, "Nome de exibição deve ter pelo menos 2 caracteres"),
  fullName: z.string().min(2, "Nome completo deve ter pelo menos 2 caracteres"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória")
});

export type StepOneForm = z.infer<typeof stepOneSchema>;

interface StepOneProps {
  form: UseFormReturn<StepOneForm>;
  onSubmit: (data: StepOneForm) => Promise<void>;
  error: string | null;
  setBirthDate: (date: string) => void;
}

export function StepOne({ form, onSubmit, error, setBirthDate }: StepOneProps) {
  const confettiRef = useRef<ConfettiRef>(null);

  return (
    <>
      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-0 size-full"
        onMouseEnter={() => {
          confettiRef.current?.fire({});
        }}
        onPointerOut={() => {
          confettiRef.current?.fire({});
        }}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="z-4">
        <Card className="w-full min-w-md py-8">
          <CardHeader>
            <CardTitle className="text-center">Criar sua conta</CardTitle>
            <CardDescription className="text-center">
              <div className="my-2 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700">
                  Convite válido para acessar a plataforma 🎉
                </p>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Como você quer ser chamado?</Label>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nome de exibição"
                    {...field}
                  />
                )}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Qual seu nome completo?</Label>
              <Controller
                name="fullName"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nome completo"
                    {...field}
                  />
                )}
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Qual sua data de nascimento?</Label>
              <Controller
                name="birthDate"
                control={form.control}
                render={({ field: { value, onChange } }) => (
                  <BirthdayCalendar
                    selectedDate={value}
                    onDateSelect={(date) => {
                      onChange(date);
                      setBirthDate(date);
                    }}
                  />
                )}
              />
              <span className="text-sm text-gray-800">Para que comemoremos juntos 🥳</span>
              {form.formState.errors.birthDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.birthDate.message}
                </p>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Próximo
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}