import { ID, teams, Query, account, databases } from '@/lib/appwrite';
import { APPWRITE_CONFIG, USER_LABELS } from '@/lib/constants';
import { CompanyCollection } from '@/types/company.type';
import { Models } from 'appwrite';

export const CompanyService = {
  async validate(name: string): Promise<{ message: string, isValid: boolean }> {
    // Cria um novo team (empresa)
    const userCompanies: Models.Team<{}>[] = await this.listUserCompanies();

    const company = userCompanies.find(team => team.name.toUpperCase() === name.toUpperCase());
    if (company) {
      return {
        message: "Este nome ja foi cadastrado.",
        isValid: false
      }
    }

    return {
      message: "Este nome é valido.",
      isValid: true
    }
  },

  async createCompanyTeam(name: string): Promise<Models.Team<{}>> {
    // Cria um novo team (empresa)
    const userCompanies: Models.Team<{}>[] = await this.listUserCompanies();

    const company = userCompanies.find(team => team.name.toUpperCase() === name.toUpperCase());
    if (company) {
      throw new Error('Empresa já existe');
    }

    const team = await teams.create(ID.unique(), name, [USER_LABELS.COMPANY_OWNER]);

    return team;
  },

  async createCompanyCollection(data: Pick<CompanyCollection, "name" | "userId">, teamId: string) {
    const company = await databases.createDocument(
      APPWRITE_CONFIG.CLIENT.DATABASE_ID,
      APPWRITE_CONFIG.CLIENT.COLLECTIONS.COMPANIES,
      teamId,
      data
    )
    return company;
  },

  async getById(id: string): Promise<Models.Team<{}> | null> {
    // Busca um team pelo id
    return await teams.get(id);
  },

  async update(teamId: string, name: string): Promise<Models.Team<{}>> {
    // Atualiza o nome do team
    return await teams.updateName(teamId, name);
  },

  async listByUser() {
    // Lista teams do usuário autenticado
    return await teams.list();
  },

  async listUserCompanies() {
    const currentUser = await account.get();
    const teamsResponse = await teams.list(); // lista todos os teams do usuário autenticado
    const userCompanies: Models.Team<{}>[] = [];

    for (const team of teamsResponse.teams) {
      try {
        const membershipsResponse = await teams.listMemberships(
          team.$id,
          [Query.equal('userId', currentUser.$id)]
        );

        const userMembership = membershipsResponse.memberships[0];

        // Se for o time SAAS, só incluir se o usuário for SAAS_OWNER
        if (team.$id === APPWRITE_CONFIG.CLIENT.TEAMS.SAAS_TEAM_ID) {
          if (userMembership && userMembership.roles.includes(USER_LABELS.SAAS_OWNER)) {
            userCompanies.push(team);
          }
          continue;
        }

        // Para outros times, incluir se o usuário tiver membership e não for apenas SAAS_CLIENT
        if (userMembership &&
          (userMembership.roles.length > 1 || !userMembership.roles.includes(USER_LABELS.SAAS_CLIENT))) {
          userCompanies.push(team);
        }
      } catch (error) {
        console.warn(`Não foi possível acessar team ${team.$id}:`, error);
      }
    }

    return userCompanies;
  },

  async listMembers(teamId: string) {
    const response = await teams.listMemberships(teamId);
    return response.memberships;
  },

  async invite(teamId: string, email: string, roles: string[]) {
    // Convida usuário para o team
    return await teams.createMembership(teamId, roles, email, window.location.origin + '/invite-callback');
  },
  async addMember(teamId: string, userId: string, roles: string[]) {
    // Adiciona um membro a um time
    return await teams.createMembership(teamId, roles, userId, window.location.origin + '/');
  }
};