import { json, type LoaderFunctionArgs } from "@remix-run/node";
import assert from "node:assert";
import { db } from "~/lib/db.server";
import { generateBurger, generateBurgerEmbedding } from "~/lib/utils.server";

export async function action(args: LoaderFunctionArgs) {
	const formData = await args.request.formData();
	const burgerDescription = formData.get("burger");
	assert(burgerDescription, "Burger is required");
	assert(typeof burgerDescription === "string", "Burger is invalid");

	const response = await generateBurgerEmbedding(burgerDescription);
	const collection = db.collection("ingredients");
	const ingredients = await collection
		.find({}, { vector: response.data[0]!.embedding, limit: 20 })
		.toArray();

	const randomIngedient =
		ingredients[Math.floor(Math.random() * ingredients.length)];

	const burger = await generateBurger(
		`Give me a unique burger recipe made with ${randomIngedient.name}. Give it a punny name, like something you'd see as the burger-of-the-day on Bob's Burgers.`
	);

	return json(burger.choices[0].message.content as string);
}
