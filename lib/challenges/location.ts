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
