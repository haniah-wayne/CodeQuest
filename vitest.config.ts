import path from "node:path";
//11.24 - Haniah Ahmed - making the setup file to config vitest
//imports: to catch typos and build filepaths
import { defineConfig } from "vitest/config";

//default settings to resolvr formatting and other variables
export default defineConfig({
	resolve: {
		alias: { "@": path.resolve(__dirname, ".") },
	},
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
		setupFiles: ["./tests/setup.ts"],
		fileParallelism: false,
		sequence: { concurrent: false },
		testTimeout: 10_000, //giving 10 seconds for test timeout
	},
});
