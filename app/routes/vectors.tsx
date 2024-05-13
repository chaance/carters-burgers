import {
	Form,
	json,
	useActionData,
	useFetcher,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
import * as React from "react";
import type { loader as getVectorsLoader } from "./get-vectors";
import { INGREDIENTS } from "../lib/ingredients";
import type { Ingredient } from "../lib/db.server";
import { generateIngredientEmbedding } from "../lib/utils.server";
import { db, CollectionAlreadyExistsError } from "../lib/db.server";
import type { ActionFunctionArgs } from "@remix-run/node";
import { UUID, ObjectId } from "@datastax/astra-db-ts";

export async function action(args: ActionFunctionArgs) {
	const collection = db.collection<Ingredient>("ingredients");
	const responses = await Promise.all(
		INGREDIENTS.map(
			async ({ appearance, flavorProfile, name, type }) =>
				await generateIngredientEmbedding({
					appearance,
					flavorProfile,
					name,
					type,
				}).then((data) => ({ name, type, ...data }))
		)
	);

	const ingredients: (Ingredient & { _id: UUID })[] = [];
	const vectors: number[][] = [];
	for (const response of responses) {
		ingredients.push({
			name: response.name,
			type: "ingredient",
			_id: UUID.v4(),
		});
		vectors.push(response.data[0]!.embedding);
	}

	const inserted = await collection.insertMany(ingredients, {
		ordered: false,
		vectors,
	});

	return json(inserted);
}

export default function Vectors() {
	const fetcher = useFetcher<typeof getVectorsLoader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const [copied, setCopied] = React.useState(false);
	const formattedData = React.useMemo(() => {
		if (fetcher.data) {
			return JSON.stringify(fetcher.data, null, 2);
		}
		return null;
	}, [fetcher.data]);

	React.useEffect(() => {
		if (copied) {
			const timeout = setTimeout(() => {
				setCopied(false);
			}, 4000);
			return () => clearTimeout(timeout);
		}
	}, [copied]);

	return (
		<div>
			<h1>Ingredient Vectors</h1>
			<fetcher.Form method="get" action="/get-vectors">
				<button>Load vectors</button>
			</fetcher.Form>
			<Form method="post">
				<button>Insert vectors</button>
			</Form>

			{fetcher.state === "loading" ? <p>Loading...</p> : null}

			{navigation.state === "submitting" ? (
				<p>Submitting...</p>
			) : navigation.state === "loading" ? (
				<p>Loading...</p>
			) : navigation.state === "idle" && actionData ? (
				<p>Inserted!</p>
			) : null}

			{formattedData ? (
				<div
					style={{
						position: "relative",
						border: "1px solid #ccc",
						borderRadius: 4,
						opacity: fetcher.state !== "idle" ? 0.5 : 1,
						pointerEvents: fetcher.state !== "idle" ? "none" : undefined,
					}}
				>
					<button
						type="button"
						aria-label="Copy to clipboard"
						title="Copy to clipboard"
						onClick={() => {
							if (formattedData) {
								navigator.clipboard.writeText(formattedData);
								setCopied(true);
							}
						}}
						style={{
							position: "absolute",
							top: 8,
							right: 8,
							cursor: "pointer",
						}}
					>
						<ClipboardIcon checked={copied} />
					</button>
					<pre
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(fetcher.data, null, 2),
						}}
					/>
				</div>
			) : null}
		</div>
	);
}

function ClipboardIcon({ checked }: { checked: boolean }) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M11.35 3.836C11.285 4.046 11.25 4.269 11.25 4.5C11.25 4.914 11.586 5.25 12 5.25H16.5C16.6989 5.25 16.8897 5.17098 17.0303 5.03033C17.171 4.88968 17.25 4.69891 17.25 4.5C17.2501 4.27491 17.2164 4.05109 17.15 3.836M11.35 3.836C11.492 3.3767 11.7774 2.97493 12.1643 2.68954C12.5511 2.40414 13.0192 2.25011 13.5 2.25H15C16.012 2.25 16.867 2.918 17.15 3.836M11.35 3.836C10.974 3.859 10.6 3.886 10.226 3.916C9.095 4.01 8.25 4.973 8.25 6.108V8.25M17.15 3.836C17.526 3.859 17.9 3.886 18.274 3.916C19.405 4.01 20.25 4.973 20.25 6.108V16.5C20.25 17.0967 20.0129 17.669 19.591 18.091C19.169 18.5129 18.5967 18.75 18 18.75H15.75M8.25 8.25H4.875C4.254 8.25 3.75 8.754 3.75 9.375V20.625C3.75 21.246 4.254 21.75 4.875 21.75H14.625C15.246 21.75 15.75 21.246 15.75 20.625V18.75M8.25 8.25H14.625C15.246 8.25 15.75 8.754 15.75 9.375V18.75"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M7.5 15.75L9 17.25L12 13.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity={checked ? 1 : 0}
			/>
		</svg>
	);
}
