// Preset unlock radii in meters. Location can drift 10-30 m near buildings and
// more indoors, so nothing tighter than 25 m
export const UNLOCK_RADII = [25, 50, 100] as const;

export type UnlockRadius = (typeof UNLOCK_RADII)[number];

export const DEFAULT_UNLOCK_RADIUS: UnlockRadius = 50;

export const UNLOCK_RADIUS_LABELS: Record<UnlockRadius, string> = {
	25: "Outdoor spot",
	50: "One building",
	100: "Nearby",
};

export interface Position {
	longitude: number;
	latitude: number;
}

interface ChallengeLocation {
	Longitude: number;
	Latitude: number;
	Radius: number;
}

const EARTH_RADIUS = 6_371_008.8;

function toRadians(degrees: number) {
	return (degrees * Math.PI) / 180;
}

// Haversine distance in meters, reusable across both client and server
export function distanceInMeters(a: Position, b: Position) {
	const dLat = toRadians(b.latitude - a.latitude);
	const dLng = toRadians(b.longitude - a.longitude);

	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLng / 2) ** 2;

	return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(h)));
}

// No locations stays locked, since RLS hiding the rows looks the same as a
// challenge that has none
export function isWithinUnlockRadius(locations: ChallengeLocation[], position: Position | null) {
	if (!position) return false;

	return locations.some(
		(l) =>
			distanceInMeters(position, { longitude: l.Longitude, latitude: l.Latitude }) <=
			l.Radius,
	);
}
