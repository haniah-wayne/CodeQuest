import { cookies } from "next/headers";
import * as v from "valibot";
import type { Position } from "./location";
import { PositionSchema } from "./schemas";

const POSITION_COOKIE = "cq-position";

// The map keeps this fresh while it's open, so an old position shouldn't keep
// challenges unlocked for long after the student walks away
const POSITION_MAX_AGE = 15 * 60;

// The browser reports this, so it's only as trustworthy as the student's device
export async function getSavedPosition(): Promise<Position | null> {
	const cookieStore = await cookies();
	const raw = cookieStore.get(POSITION_COOKIE)?.value;

	if (!raw) return null;

	try {
		const parsed = v.safeParse(PositionSchema, JSON.parse(raw));

		return parsed.success ? parsed.output : null;
	} catch {
		return null;
	}
}

// Only call from a Server Function, since setting a cookie re-renders the page
export async function savePosition(position: Position) {
	const cookieStore = await cookies();

	cookieStore.set(POSITION_COOKIE, JSON.stringify(position), {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: POSITION_MAX_AGE,
	});
}
