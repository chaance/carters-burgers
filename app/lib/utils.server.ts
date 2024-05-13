export async function generateBurgerEmbedding(input: string) {
	const response = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		cache: "no-store",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			input,
			model: "text-embedding-ada-002",
		}),
	});

	if (response.status != 200) {
		throw `Failed to generate embedding: ${response.statusText}`;
	}

	if (!response.body) {
		throw "Response body is empty";
	}

	const result = await response.json();
	return result as OpenAiEmbeddingResponse;
}

export async function generateIngredientEmbedding({
	type,
	name,
	appearance,
	flavorProfile,
	otherQualities,
}: {
	type: string;
	name: string;
	appearance: string;
	flavorProfile: string;
	otherQualities?: string[];
}) {
	const input = [
		`${name} is a type of ${type}, tastes like ${flavorProfile}, looks like ${appearance}.`,
		otherQualities &&
			otherQualities.length > 0 &&
			`Also ${otherQualities.join(", ")}.`,
	]
		.filter(Boolean)
		.join(" ");

	const response = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		cache: "only-if-cached",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			input,
			model: "text-embedding-ada-002",
		}),
	});

	if (response.status != 200) {
		throw `Failed to generate embedding: ${response.statusText}`;
	}

	if (!response.body) {
		throw "Response body is empty";
	}

	const result = await response.json();
	return result as OpenAiEmbeddingResponse;
}

export async function generateBurger(prompt: string) {
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			model: "gpt-3.5-turbo",
			messages: [{ role: "system", content: prompt }],
		}),
	});

	if (response.status != 200) {
		throw `Failed to generate embedding: ${response.statusText}`;
	}

	if (!response.body) {
		throw "Response body is empty";
	}

	const result = await response.json();
	return result as any;
}

export function burgerToString(movie: Burger) {
	const similarity = movie.get("$similarity");
	if (similarity) {
		return `${similarity}: ${movie.name} ${`(${movie.style})`}
    ${movie.description}`;
	}
	return `${movie.name} ${`(${movie.style})`}
    ${movie.description}`;
}

export function burgersToString(movies: Burger[]) {
	return movies.map((movie) => burgerToString(movie)).join("\n  --\n");
}

interface Burger {
	name: string;
	style: string;
	description: string;
	get: (id: string) => string;
}

interface OpenAiEmbeddingResponse {
	object: "list";
	data: OpenAiEmbedding[];
	model: string;
}

interface OpenAiEmbedding {
	object: "embedding";
	embedding: number[];
	index: number;
}
