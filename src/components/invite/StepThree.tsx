import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cropper, CropperCropArea, CropperDescription, CropperImage } from "@/components/ui/cropper";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

// Validation schema
export const stepThreeSchema = z.object({
  profileImage: z.instanceof(File).optional(),
  cropData: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }).optional()
});

export type StepThreeForm = z.infer<typeof stepThreeSchema>;

interface StepThreeProps {
  form: UseFormReturn<StepThreeForm>;
  onSubmit: (data: StepThreeForm) => Promise<void>;
  error: string | null;
  uploadingImage: boolean;
  setPreviewImage: (image: string) => void;
  previewImage?: string;
  teamId: string;
}

export function StepThree({
  form,
  onSubmit,
  error,
  uploadingImage,
  setPreviewImage,
  previewImage,
  teamId
}: StepThreeProps) {
  const router = useRouter();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="w-full min-w-md py-8">
        <CardHeader>
          <CardTitle className="text-center">Foto de perfil</CardTitle>
          <CardDescription className="text-center">
            Usaremos sua foto para marcações de seus endereços para facilitar a identificação pelos nosso guardas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileImage">Selecione uma imagem</Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      if (e.target?.result) {
                        setPreviewImage(e.target.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                    form.setValue("profileImage", file);
                  }
                }}
              />
            </div>

            {previewImage && (
              <div className="space-y-2">
                <Label>Ajuste sua foto</Label>
                <Cropper
                  className="h-80 w-full rounded-lg border"
                  image={previewImage}
                  aspectRatio={1}
                  minZoom={1}
                  maxZoom={3}
                  onCropChange={(data: any) => {
                    if (data) {
                      form.setValue("cropData", data);
                    }
                  }}
                >
                  <CropperDescription />
                  <CropperImage />
                  <CropperCropArea />
                </Cropper>
                <p className="text-sm text-muted-foreground">Arraste para ajustar e use o scroll do mouse para zoom</p>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${teamId}/signin`)}
          >
            Pular
          </Button>
          <Button
            type="submit"
            disabled={uploadingImage}
          >
            {uploadingImage ? "Enviando..." : "Enviar foto"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}