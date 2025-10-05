"use client";

import { account, databases, ID, Query, storage } from "@/lib/appwrite";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState } from "nuqs";
import { APPWRITE_CONFIG } from "@/lib/constants";
import { useAuthStore } from "@/stores";
import { InviteCollectionType } from "@/types/invite.type";
import { ConfettiRef } from "@/components/animations/confetti";

// Componentes
import { TextShimmer } from "./TextShimmer";
import { ErrorToken } from "./ErrorToken";
import { ExistingUser } from "./ExistingUser";
import { StepOne, StepOneForm, stepOneSchema } from "./StepOne";
import { StepTwo, StepTwoForm, stepTwoSchema } from "./StepTwo";
import { StepThree, StepThreeForm, stepThreeSchema } from "./StepThree";
import { UserInterface } from "@/types/user.type";

type UserRegistrationForm = StepOneForm & StepTwoForm & { profileImageId?: string };

interface InviteOnboardingProps {
  teamId: string;
}

export function InviteOnboarding({ teamId }: InviteOnboardingProps) {
  const confettiRef = useRef<ConfettiRef>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { createMemberShip } = useAuthStore();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [inviteData, setInviteData] = useState<InviteCollectionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [step, setStep] = useQueryState("step");
  const [name, setName] = useQueryState("name");
  const [fullName, setFullName] = useQueryState("fullName");
  const [birthDate, setBirthDate] = useQueryState("birthDate");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>();
  const [createdUser, setCreatedUser] = useState<UserInterface | null>(null)

  // Form setup for step one
  const stepOneForm = useForm<StepOneForm>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      name: name ?? "",
      fullName: fullName ?? "",
      birthDate: birthDate ?? ""
    }
  });

  // Form setup for step two
  const stepTwoForm = useForm<StepTwoForm>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      email: inviteData?.email || "",
      mobilePhone: "+5567999999999",
      password: "",
      confirmPassword: ""
    }
  });

  // Form setup for step three
  const stepThreeForm = useForm<StepThreeForm>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {}
  });

  useEffect(() => {
    if (token) {
      validateInviteToken();
    } else {
      setError("Token de convite obrigatório");
      setValidatingToken(false);
    }
  }, [token]);

  async function validateInviteToken() {
    try {
      const response = await databases.listDocuments<InviteCollectionType>(
        APPWRITE_CONFIG.CLIENT.DATABASE_ID,
        APPWRITE_CONFIG.CLIENT.COLLECTIONS.INVITATIONS,
        [
          Query.equal("token", token!),
          Query.equal("used", false)
        ]
      );

      if (response.documents.length === 0) {
        setError("Token de convite inválido ou já utilizado");
        setValidatingToken(false);
        return;
      }

      const invite = response.documents[0];

      // Verificar se o convite não expirou (opcional - 7 dias)
      const inviteDate = new Date(invite.$createdAt);
      const now = new Date();
      const daysDiff = (now.getTime() - inviteDate.getTime()) / (1000 * 3600 * 24);

      if (daysDiff > 7) {
        setError("Token de convite expirado");
        setValidatingToken(false);
        return;
      }

      setInviteData(invite);
      setTokenValid(true);
      stepTwoForm.reset({
        email: invite?.email,
        mobilePhone: "+5567999999999",
        password: "",
        confirmPassword: ""
      });

    } catch (err) {
      console.error("Erro ao validar token de convite:", err);
      setError("Erro ao validar token de convite");
    } finally {
      setValidatingToken(false);
    }
  }

  const handleStepOne = async (data: StepOneForm) => {
    await Promise.all([
      setStep("1"),
      setName(data.name),
      setFullName(data.fullName),
      setBirthDate(new Date(data.birthDate).toISOString())
    ]);
    setCurrentStep(2);
  };

  const handleStepTwo = async (data: StepTwoForm) => {
    if (!name || !fullName || !birthDate) {
      setError("Dados da primeira etapa não encontrados");
      return;
    }

    const fullData: UserRegistrationForm = {
      name,
      fullName: fullName,
      birthDate: birthDate,
      ...data
    };

    await handleNewUserRegistration(fullData);
  };

  const handleStepThree = async (data: StepThreeForm) => {
    if (!data.profileImage || !data.cropData) {
      toast.error("Selecione uma imagem e ajuste o recorte");
      return;
    }

    setUploadingImage(true);
    try {
      const image = new Image();
      image.src = previewImage!;

      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Não foi possível criar o contexto do canvas");
      }

      canvas.width = data.cropData.width;
      canvas.height = data.cropData.height;

      ctx.drawImage(
        image,
        data.cropData.x,
        data.cropData.y,
        data.cropData.width,
        data.cropData.height,
        0,
        0,
        data.cropData.width,
        data.cropData.height
      );

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, "image/jpeg", 0.95);
      });

      const croppedFile = new File([blob], data.profileImage.name, {
        type: "image/jpeg",
      });

      const file = await storage.createFile(
        APPWRITE_CONFIG.CLIENT.BUCKET.GIROFLEX,
        ID.unique(),
        croppedFile
      );

      await databases.updateDocument(
        APPWRITE_CONFIG.CLIENT.DATABASE_ID,
        APPWRITE_CONFIG.CLIENT.COLLECTIONS.USERS,
        createdUser?.$id!,
        { profileImage: `https://nyc.cloud.appwrite.io/v1/storage/buckets/${APPWRITE_CONFIG.CLIENT.BUCKET.GIROFLEX}/files/${file?.$id}/view?project=${APPWRITE_CONFIG.CLIENT.PROJECT_ID}&mode=admin` }
      );

      toast.success("Imagem de perfil atualizada com sucesso!");
      router.push(`/${teamId}/dashboard`);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload da imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNewUserRegistration = async (data: UserRegistrationForm) => {
    if (!tokenValid || !inviteData) {
      setError("Token de convite inválido");
      return;
    }

    // Verificar se o email corresponde ao convite
    if (inviteData.email && inviteData.email !== data.email) {
      setError("Este convite é específico para outro email");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar conta no AppWrite
      const user = await account.create(ID.unique(), data.email, data.password, data.name);

      // Criar documento do usuário
      const collectionUser = await databases.createDocument<UserInterface>(
        APPWRITE_CONFIG.CLIENT.DATABASE_ID,
        APPWRITE_CONFIG.CLIENT.COLLECTIONS.USERS,
        user.$id,
        {
          name: data.name,
          fullName: data.fullName,
          birthDate: data.birthDate,
          email: data.email,
          mobilePhone: data.mobilePhone,
          invitedBy: inviteData.invitedBy,
          teamId: inviteData.teamId,
        }
      );

      if (collectionUser) {
        setCreatedUser(collectionUser)
      }

      await createMemberShip({
        teamId: inviteData?.teamId!,
        roles: inviteData?.role!,
        email: user?.email,
        userId: user?.$id,
      })

      // Marcar convite como usado
      await databases.updateDocument(
        APPWRITE_CONFIG.CLIENT.DATABASE_ID,
        APPWRITE_CONFIG.CLIENT.COLLECTIONS.INVITATIONS,
        inviteData.$id,
        {
          used: true,
          usedAt: new Date().toISOString(),
          userId: user.$id
        }
      );

      // Fazer login e ir para etapa de upload de foto
      await account.createEmailPasswordSession(data.email, data.password);
      toast.success("Conta criada com sucesso! Agora você pode adicionar uma foto de perfil.");
      setCurrentStep(3);

    } catch (err: any) {
      if (err.code === 409 || err.type === "user_already_exists") {
        setError("Este email já possui uma conta. Tente fazer login ou use outro email.");
      } else {
        setError(err.message || "Erro ao criar conta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExistingUserSetup = async () => {
    if (!tokenValid || !inviteData) {
      setError("Token de convite inválido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createMemberShip({
        teamId: inviteData?.teamId!,
        roles: inviteData?.role!,
        email: inviteData?.email!,
        userId: inviteData?.userId!,
      })

      // Marcar convite como usado
      await databases.updateDocument(
        APPWRITE_CONFIG.CLIENT.DATABASE_ID,
        APPWRITE_CONFIG.CLIENT.COLLECTIONS.INVITATIONS,
        inviteData.$id,
        {
          used: true,
          usedAt: new Date().toISOString()
        }
      );

      toast.success("Convite aceito com sucesso!");
      router.push(`/${teamId}/dashboard`);

    } catch (err: any) {
      setError(err.message || "Erro ao processar convite");
    } finally {
      setLoading(false);
    }
  };

  const mapRole = {
    "company_client": "cliente",
    "company_employee": "colaborador",
    "company_owner": "administrador"
  }

  // Loading state durante validação do token
  if (validatingToken) {
    return (
      <div className="flex h-dvh items-center justify-center bg-gray-100">
        <TextShimmer className="text-lg">
          Validando convite...
        </TextShimmer>
      </div>
    );
  }

  // Error state para token inválido
  if (!tokenValid) {
    return <ErrorToken error={error} teamId={teamId} />;
  }

  // Usuário existente - apenas confirmar
  if (inviteData?.userId) {
    return (
      <ExistingUser
        inviteData={inviteData}
        loading={loading}
        handleExistingUserSetup={handleExistingUserSetup}
        mapRole={mapRole}
      />
    );
  }

  // Novo usuário - formulário de registro em etapas
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 relative">

      {currentStep === 1 && (
        <StepOne
          form={stepOneForm}
          onSubmit={handleStepOne}
          error={error}
          setBirthDate={setBirthDate}
        />
      )}

      {currentStep === 2 && (
        <StepTwo
          form={stepTwoForm}
          onSubmit={handleStepTwo}
          onBack={() => setCurrentStep(1)}
          error={error}
          loading={loading}
          inviteData={inviteData}
        />
      )}

      {currentStep === 3 && (
        <StepThree
          form={stepThreeForm}
          onSubmit={handleStepThree}
          error={error}
          uploadingImage={uploadingImage}
          setPreviewImage={setPreviewImage}
          previewImage={previewImage}
          teamId={teamId}
        />
      )}
    </div>
  );
}