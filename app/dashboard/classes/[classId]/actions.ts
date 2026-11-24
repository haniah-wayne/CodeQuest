"use server";

import * as v from "valibot";
import { getSessionUser } from "@/lib/auth/session";
import type { Position } from "@/lib/challenges/location";
import { savePosition } from "@/lib/challenges/position";
import { PositionSchema } from "@/lib/challenges/schemas";

// Saving the cookie re-renders the class page, which unlocks challenges the
// student is now close to
export async function updatePosition(input: Position): Promise<void> {
	const user = await getSessionUser();

	if (user?.role !== "student") return;

	const parsed = v.safeParse(PositionSchema, input);

	if (!parsed.success) return;

	await savePosition(parsed.output);
}
