import { APPWRITE_CONFIG } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';
import { Client, Teams } from 'node-appwrite';

interface AddToTeamRequest {
  teamId: string;
  userId: string;
  email: string;
  roles: string[] | string;
}

interface AppwriteError extends Error {
  code?: number;
  type?: string;
  response?: {
    message?: string;
    code?: number;
    type?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { teamId, userId, email, roles }: AddToTeamRequest = await req.json();

    console.log('API add-to-saas-team - Dados recebidos:', { teamId, userId, email, roles });

    // Validação dos parâmetros obrigatórios
    if (!teamId || !userId || !email || !roles) {
      return NextResponse.json({ 
        success: false, 
        error: 'Parâmetros obrigatórios faltando: teamId, userId, email, roles' 
      }, { status: 400 });
    }

    const client = new Client();
    client
      .setEndpoint(APPWRITE_CONFIG.SERVER.ENDPOINT)
      .setProject(APPWRITE_CONFIG.SERVER.PROJECT_ID)
      .setKey(APPWRITE_CONFIG.SERVER.API_KEY);

    const teams = new Teams(client);

    // Garantir que roles seja um array
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    
    console.log('API add-to-saas-team - Criando membership com:', { teamId, rolesArray, email, userId });

    // Verificar se o team existe antes de tentar criar o membership
    try {
      const team = await teams.get(teamId);
      console.log('API add-to-saas-team - Team encontrado:', team);
    } catch (teamError) {
      console.error('API add-to-saas-team - Team não encontrado:', teamError);
      const appwriteError = teamError as AppwriteError;
      return NextResponse.json({ 
        success: false, 
        error: `Team não encontrado: ${appwriteError.message || 'Erro desconhecido'}`,
        code: appwriteError.code || appwriteError.response?.code,
        type: appwriteError.type || appwriteError.response?.type,
        teamId: teamId
      }, { status: 404 });
    }

    const membership = await teams.createMembership(
      teamId,
      rolesArray,
      email,
      userId
    );

    console.log('API add-to-saas-team - Membership criado com sucesso:', membership);

    return NextResponse.json({ success: true, membership });
  } catch (error) {
    console.error('API add-to-saas-team - Erro:', error);
    
    const appwriteError = error as AppwriteError;
    
    // Retornar detalhes específicos do erro do Appwrite
    return NextResponse.json({ 
      success: false, 
      error: appwriteError.message || 'Erro interno do servidor',
      code: appwriteError.code || appwriteError.response?.code,
      type: appwriteError.type || appwriteError.response?.type 
    }, { status: appwriteError.code || appwriteError.response?.code || 500 });
  }
}