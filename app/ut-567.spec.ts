import { test, expect } from "@playwright/test";

// UT-5: Save New Class Button
test.describe("UT-5", () => {
	test.use({
		storageState: "playwright/.auth/professor.json",
	});

	test("Save New Class Button", async ({ page }) => {
		const className = `UT5-Java-${Date.now()}`;
		const description = "Java test class description";

		// Open the Professor Dashboard.
		await page.goto("http://localhost:3000/dashboard");

		// Open the Create Class dialog.
		await page
			.getByRole("button", {
				name: "Create a class",
				exact: true,
			})
			.first()
			.click();

		const dialog = page.getByRole("dialog", {
			name: "New class",
		});

		await expect(dialog).toBeVisible();

		// Enter the class name and description.
		await dialog
			.getByRole("textbox", {
				name: "Class name",
			})
			.fill(className);

		await dialog
			.getByRole("textbox", {
				name: "Description",
			})
			.fill(description);

		// Click the Create Class button.
		await dialog
			.getByRole("button", {
				name: "Create class",
				exact: true,
			})
			.click();

		//The dialog closes
		await expect(dialog).not.toBeVisible();

		//The new class name appears
		const classLink = page.getByRole("link", {
			name: className,
			exact: true,
		});

		await expect(classLink).toBeVisible();

		// Find the nearest container containing this class's
		// name, description, and Join Code label.
		const classCard = classLink.locator(
			'xpath=ancestor::*[.//*[normalize-space(.)="Join code"]' +
				' and .//*[normalize-space(.)="' +
				description +
				'"]][1]',
		);

		//The new Class Card appears
		await expect(classCard).toBeVisible();

		//The card displays the class name
		await expect(
			classCard.getByRole("link", {
				name: className,
				exact: true,
			}),
		).toBeVisible();

		// The card displays the description
		await expect(
			classCard.getByText(description, {
				exact: true,
			}),
		).toBeVisible();

		// The card displays a Join Code
		await expect(
			classCard.getByText("Join code", {
				exact: true,
			}),
		).toBeVisible();

		// Join Code
		const joinCode = classCard.getByText(/^[0-9a-f]{10}$/i);

		await expect(joinCode).toHaveCount(1);
		await expect(joinCode).toBeVisible();
	});
});

//UT-7: Map Marker Clickable
test.describe("UT-7", () => {
	test.use({
		storageState: "playwright/.auth/professor.json",
	});

	test("Map Marker Clickable", async ({ page }) => {
		await page.goto("http://localhost:3000/dashboard");

		await page
			.getByRole("link", {
				name: "Create a challenge",
			})
			.click();

		await page
			.getByRole("textbox", {
				name: "What should the challenge be",
			})
			.fill("for loop");

		await page
			.getByRole("button", {
				name: "Generate",
			})
			.click();

		const map = page.getByRole("region", { name: "Map" });

		// Verify the map appears.
		await expect(map).toBeVisible();

		// Click a location on the map.
		await map.click({
			position: {
				x: 291,
				y: 142,
			},
		});

		// Verify a Mapbox marker appears.
		const marker = map.locator(".mapboxgl-marker");

		await expect(marker).toHaveCount(1);
		await expect(marker).toBeVisible();
	});
});

// UT-6: Join Class Button

test.describe("UT-6", () => {
	test.use({
		storageState: "playwright/.auth/student.json",
	});

	test("Join Class", async ({ page }) => {
		await page.goto("http://localhost:3000/dashboard");

		const javaClass = page.getByRole("link", {
			name: "Java",
			exact: true,
		});

		// Verify the student has not joined Java.
		await expect(javaClass).toHaveCount(0);

		await page
			.getByRole("button", {
				name: "Join a class",
				exact: true,
			})
			.first()
			.click();

		await page
			.getByRole("textbox", {
				name: "Join code",
			})
			.fill("00b064a025");

		await page
			.getByRole("button", {
				name: "Join class",
			})
			.click();

		// Verify Java appears after joining
		await expect(javaClass).toBeVisible();
	});
});
