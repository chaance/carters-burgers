import * as React from "react";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	json,
} from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { db } from "./lib/db.server";
import stylesheetUrl from "./app.css?url";

export function links() {
	return [
		{ rel: "stylesheet", href: stylesheetUrl },
		// load font file
		{
			rel: "preload",
			as: "font",
			type: "font/ttf",
			href: "/bobs.ttf",
		},
	];
}

export async function loader(args: LoaderFunctionArgs) {
	const collections = await db.listCollections();
	return json({ collections });
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

// Collections
// - ingredients

// 1536 dimensions
// dot product
