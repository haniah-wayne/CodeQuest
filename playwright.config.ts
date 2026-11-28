//11.25 - Haniah Ahmed - setting up the playwright sonfiguration
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	workers: 1,
	use: {
		baseURL: "http://localhost:3000",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3000",
		reuseExistingServer: true,
		timeout: 120_000,
	},
});
