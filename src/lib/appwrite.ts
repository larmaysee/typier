import { Account, Client, Databases } from "appwrite";

const client = new Client();

// Check if environment variables are available
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (endpoint && projectId) {
  client
    .setEndpoint(endpoint)
    .setProject(projectId);
} else {
  console.warn('Appwrite environment variables not configured properly');
}

const account = new Account(client);
const databases = new Databases(client);

export { account, databases };
