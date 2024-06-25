import * as React from "react";
import { useFetcher } from "@remix-run/react";
import type { action as getBurgerLoader } from "./get-burger";

export function meta() {
	return [
		{ title: "Carter's Burgers" },
		{
			name: "description",
			content: "Get a unique burger recipe.",
		},
	];
}

export default function Burgers() {
	const fetcher = useFetcher<typeof getBurgerLoader>();
	const html = React.useMemo(() => formatHtml(fetcher.data), [fetcher.data]);

	return (
		<div className="burgers">
			<h1>Carter's Burgers</h1>
			<fetcher.Form method="post" action="/get-burger" className="prompt-form">
				<label>
					<div>What kind of burger are you in the mood for?</div>
					<input
						type="text"
						name="burger"
						placeholder="Describe your burger..."
						autoComplete="off"
						required
					/>
				</label>
				<div>
					<button type="submit">Get it</button>
				</div>
			</fetcher.Form>
			{fetcher.state !== "idle" ? (
				<p>Loading...</p>
			) : fetcher.data ? (
				<div dangerouslySetInnerHTML={{ __html: html }} className="prose" />
			) : null}
		</div>
	);
}

function formatHtml(data: string | null | undefined) {
	if (!data) {
		return "";
	}

	return data
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean)
		.map((line) => {
			return `<p>${line}</p>`;
		})
		.join("\n");
}
