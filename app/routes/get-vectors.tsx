import { json } from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { INGREDIENTS } from "../lib/ingredients";
import { generateIngredientEmbedding } from "../lib/utils.server";

export async function loader(args: LoaderFunctionArgs) {
	const embeddings = await Promise.all(
		INGREDIENTS.map(
			async ({ appearance, flavorProfile, name, type }) =>
				await generateIngredientEmbedding({
					appearance,
					flavorProfile,
					name,
					type,
				}).then((data) => ({ name, ...data }))
		)
	);
	return json(embeddings, {
		headers: {
			// cache for 1 day
			"Cache-Control": "public, max-age=86400",
		},
	});
}
