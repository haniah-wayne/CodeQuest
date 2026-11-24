import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		tsconfigPaths: true,
		alias: {
			"server-only": "next/dist/compiled/server-only/empty.js",
		},
	},
	// TODO: set up projects
});
