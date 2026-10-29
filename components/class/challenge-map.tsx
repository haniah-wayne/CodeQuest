"use client";

import {
	Loading03Icon,
	LocationOffline01Icon,
	MapsLocation01Icon,
	Navigation03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useRef, useState, useTransition } from "react";
import { updatePosition } from "@/app/dashboard/classes/[classId]/actions";
import { ClassSection } from "@/components/class/class-section";
import type { MapChallenge } from "@/components/mapview";
import { distanceInMeters, type Position } from "@/lib/challenges/location";

const MapView = dynamic(() => import("@/components/mapview"), {
	ssr: false,
	loading: () => <div className="size-full animate-pulse bg-muted" />,
});

// Watching location fires constantly, so only tell the server when the student
// has actually moved, or now and then to keep the saved position fresh
const RESEND_DISTANCE = 10;
const RESEND_INTERVAL = 60 * 1000;

type Status = "locating" | "tracking" | "denied" | "unavailable";

const STATUS = {
	locating: { icon: Loading03Icon, text: "Finding you…" },
	tracking: { icon: Navigation03Icon, text: "Tracking your location" },
	denied: { icon: LocationOffline01Icon, text: "Location is off" },
	unavailable: { icon: LocationOffline01Icon, text: "Can't find your location" },
} satisfies Record<Status, { icon: IconSvgElement; text: string }>;

export function ChallengeMap({ challenges }: { challenges: MapChallenge[] }) {
	const [status, setStatus] = useState<Status>("locating");
	const [, startTransition] = useTransition();
	const lastSent = useRef<{ position: Position; at: number } | null>(null);

	function handlePosition(longitude: number, latitude: number) {
		setStatus("tracking");

		const position = { longitude, latitude };
		const last = lastSent.current;

		if (
			last &&
			Date.now() - last.at < RESEND_INTERVAL &&
			distanceInMeters(last.position, position) < RESEND_DISTANCE
		) {
			return;
		}

		lastSent.current = { position, at: Date.now() };

		startTransition(async () => {
			try {
				await updatePosition(position);
			} catch (error) {
				console.error(error);
			}
		});
	}

	function handleLocationError(error: GeolocationPositionError) {
		setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
	}

	const { icon, text } = STATUS[status];

	return (
		<ClassSection
			id="map"
			title="Map"
			icon={MapsLocation01Icon}
			action={
				<span
					aria-live="polite"
					className="flex items-center gap-1.5 text-caption text-muted-foreground"
				>
					<HugeiconsIcon
						icon={icon}
						className={
							status === "locating"
								? "size-3.5 animate-spin"
								: status === "tracking"
									? "size-3.5 text-wsu-green"
									: "size-3.5 text-destructive"
						}
					/>
					{text}
				</span>
			}
		>
			<div className="relative h-80 overflow-hidden rounded-2xl sm:h-96">
				<MapView
					mode="student"
					className="size-full"
					challenges={challenges}
					positionChange={handlePosition}
					locationError={handleLocationError}
				/>
			</div>

			{status === "denied" && (
				<p className="px-3 pt-3 pb-1 text-body-sm text-muted-foreground">
					Allow location access in your browser to find challenges near you.
				</p>
			)}
		</ClassSection>
	);
}
