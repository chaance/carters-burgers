import * as React from "react";
import { Form, json, useActionData, useNavigation } from "@remix-run/react";
import { type ActionFunctionArgs } from "@remix-run/node";
import type { Ingredient } from "../lib/db.server";
import { db, CollectionAlreadyExistsError } from "../lib/db.server";
import assert from "node:assert";

export async function action(args: ActionFunctionArgs) {
	const formData = await args.request.formData();
	const name = formData.get("name");
	assert(name, "Name is required");
	assert(typeof name === "string", "Name must be a string");

	try {
		const collection = await db.createCollection<Ingredient>(name, {
			checkExists: true,
			vector: {
				dimension: 1536,
				metric: "dot_product",
			},
		});
		return json({ collection, error: null });
	} catch (error) {
		if (error instanceof CollectionAlreadyExistsError) {
			return json(
				{ collection: null, error: "Collection already exists" },
				400
			);
		}
		throw error;
	}
}

export default function CreateCollection() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const error = actionData?.error ?? null;
	const collection = actionData?.collection ?? null;
	return (
		<div>
			<Form method="post">
				<label>
					Collection Name
					<input type="text" name="name" required />
				</label>
				<div>
					<button>Create Collection</button>
					<button type="reset">Reset</button>
				</div>
				{navigation.state !== "idle" ? <p>Creating collection...</p> : null}
				{collection ? (
					<p>Collection {collection.collectionName} created!</p>
				) : null}
				{error ? <p style={{ color: "crimson" }}>{error}</p> : null}
			</Form>
		</div>
	);
}
