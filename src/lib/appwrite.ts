import { Account, Client, Databases, ID, Query, Storage, Teams } from "appwrite";
import { APPWRITE_CONFIG } from "./constants";

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.CLIENT.ENDPOINT)
  .setProject(APPWRITE_CONFIG.CLIENT.PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const teams = new Teams(client);
const storage = new Storage(client);

export { account, client, databases, ID, Query, teams, storage };

