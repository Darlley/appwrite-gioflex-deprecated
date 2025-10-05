import { Account, Client, Databases, ID, Query, Storage, Teams } from "node-appwrite";
import { APPWRITE_CONFIG } from "./constants";

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.SERVER.ENDPOINT)
  .setProject(APPWRITE_CONFIG.SERVER.PROJECT_ID)
  .setKey(APPWRITE_CONFIG.SERVER.API_KEY);

const account = new Account(client);
const databases = new Databases(client);
const teams = new Teams(client);
const storage = new Storage(client);

export { account, client, databases, ID, Query, teams, storage };

