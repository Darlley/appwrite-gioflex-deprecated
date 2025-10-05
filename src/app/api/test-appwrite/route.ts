import { APPWRITE_CONFIG } from '@/lib/constants';
import { NextResponse } from 'next/server';
import { Client, Teams } from 'node-appwrite';

export async function GET() {
  try {
    console.log('Testando configuração do Appwrite...');
    
    // Verificar se as variáveis de ambiente estão definidas
    const config = {
      endpoint: APPWRITE_CONFIG.SERVER.ENDPOINT,
      projectId: APPWRITE_CONFIG.SERVER.PROJECT_ID,
      apiKey: APPWRITE_CONFIG.SERVER.API_KEY,
      saasTeamId: APPWRITE_CONFIG.SERVER.TEAMS.SAAS_TEAM_ID
    };
    
    console.log('Configuração:', config);

    const client = new Client();
    client
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);

    const teams = new Teams(client);

    // Tentar listar todos os teams
    console.log('Listando teams...');
    const teamsList = await teams.list();
    console.log('Teams encontrados:', teamsList);

    // Tentar buscar o team específico
    console.log('Buscando team específico:', config.saasTeamId);
    try {
      const specificTeam = await teams.get(config.saasTeamId);
      console.log('Team específico encontrado:', specificTeam);
      
      return NextResponse.json({ 
        success: true, 
        config,
        teamsList,
        specificTeam,
        message: 'Configuração do Appwrite OK e team encontrado!'
      });
    } catch (teamError) {
      console.error('Erro ao buscar team específico:', teamError);
      
      return NextResponse.json({ 
        success: false, 
        config,
        teamsList,
        teamError: {
          message: teamError.message,
          code: teamError.code,
          type: teamError.type
        },
        message: 'Team específico não encontrado!'
      });
    }

  } catch (error) {
    console.error('Erro na configuração do Appwrite:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: {
        message: error.message,
        code: error.code,
        type: error.type
      },
      message: 'Erro na configuração do Appwrite'
    }, { status: 500 });
  }
}