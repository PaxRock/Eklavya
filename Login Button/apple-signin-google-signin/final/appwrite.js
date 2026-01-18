import { Client, Account } from "appwrite";

const { VITE_PROJECT_ID, VITE_ENDPOINT } = import.meta.env;

if (!VITE_PROJECT_ID || !VITE_ENDPOINT) {
    throw new Error('VITE_PROJECT_ID and VITE_ENDPOINT must be defined in .env');
}

const client = new Client()
    .setEndpoint(VITE_ENDPOINT)
    .setProject(VITE_PROJECT_ID);

const account = new Account(client);

export { account };
