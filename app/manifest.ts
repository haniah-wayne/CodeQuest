import type { MetadataRoute } from "next";

const THEME_COLOR = "#0c5449";

export default function manifest(): MetadataRoute.Manifest {
	return {
		id: "/",
		name: "CodeQuest",
		short_name: "CodeQuest",
		description: "Your next problem set is somewhere on campus.",
		// The proxy sends signed-in users on to their dashboard
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: THEME_COLOR,
		categories: ["education"],
		icons: [
			{
				src: "/icons/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icons/icon-maskable-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
