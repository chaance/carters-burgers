import { DataAPIClient } from "@datastax/astra-db-ts";
import assert from "node:assert";

const ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN;
const ASTRA_DB_API_ENDPOINT = process.env.ASTRA_DB_API_ENDPOINT;
assert(ASTRA_DB_APPLICATION_TOKEN, "ASTRA_DB_APPLICATION_TOKEN is required");
assert(ASTRA_DB_API_ENDPOINT, "ASTRA_DB_API_ENDPOINT is required");

// Initialize the client
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT);

export { db, client };
export { CollectionAlreadyExistsError } from "@datastax/astra-db-ts";

export interface Ingredient {
	name: string;
	type: string;
}
