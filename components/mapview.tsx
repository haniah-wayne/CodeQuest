"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_UNLOCK_RADIUS, type Position } from "@/lib/challenges/location";
import {
	createMap,
	addChallengeMarker,
	removeChallengeMarker,
	showChallengeLink,
	showChallengeRadius,
	showLockedChallenge,
	showStudentLocation,
	selectChallengeLocation,
} from "@/lib/mapbox";

export interface MapChallenge {
	id: number;
	title: string;
	longitude: number;
	latitude: number;
	radius: number;
	// Null while the challenge is still locked
	href: string | null;
}

interface MapViewProps {
	mode: "student" | "professor";
	className?: string;
	// Professor mode
	radius?: number;
	locationSelect?: (longitude: number, latitude: number) => void;
	// Student mode
	challenges?: MapChallenge[];
	positionChange?: (longitude: number, latitude: number) => void;
	locationError?: (error: GeolocationPositionError) => void;
}

export default function MapView({
	mode,
	className = "h-80 w-full",
	radius = DEFAULT_UNLOCK_RADIUS,
	locationSelect,
	challenges = [],
	positionChange,
	locationError,
}: MapViewProps) {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const locationSelectRef = useRef(locationSelect);
	const positionChangeRef = useRef(positionChange);
	const locationErrorRef = useRef(locationError);
	const challengesRef = useRef(challenges);

	// Set once the style loads, since sources and layers can't be added before
	const [map, setMap] = useState<mapboxgl.Map | null>(null);
	const [pin, setPin] = useState<Position | null>(null);

	// The server re-renders with a new array on every position update, so only
	// redraw markers when the challenges actually change or unlock
	const challengesKey = challenges
		.map((c) => `${c.id}:${c.longitude},${c.latitude}:${c.radius}:${c.title}:${c.href}`)
		.join("|");

	useEffect(() => {
		locationSelectRef.current = locationSelect;
		positionChangeRef.current = positionChange;
		locationErrorRef.current = locationError;
		challengesRef.current = challenges;
	}, [locationSelect, positionChange, locationError, challenges]);

	useEffect(() => {
		if (!mapContainerRef.current) return;

		const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

		if (!accessToken) {
			console.error("Mapbox access token is missing");
			return;
		}

		const map = createMap(mapContainerRef.current, accessToken);

		let removeClickListener: (() => void) | undefined;

		if (mode === "student") {
			const geolocate = showStudentLocation(map);
			let centered = false;

			geolocate.on("geolocate", (event) => {
				const { longitude, latitude } = event.coords;

				// Center on the student once, then let them pan freely
				if (!centered) {
					centered = true;
					map.easeTo({ center: [longitude, latitude] });
				}

				positionChangeRef.current?.(longitude, latitude);
			});

			geolocate.on("error", (error) => locationErrorRef.current?.(error));

			// Start tracking right away instead of waiting for the button
			map.on("load", () => geolocate.trigger());
		}

		if (mode === "professor") {
			removeClickListener = selectChallengeLocation(map, (longitude, latitude) => {
				setPin({ longitude, latitude });
				locationSelectRef.current?.(longitude, latitude);
			});
		}

		map.on("load", () => setMap(map));

		return () => {
			removeClickListener?.();
			map.remove();
			setMap(null);
		};
	}, [mode]);

	useEffect(() => {
		if (!map || mode !== "professor" || !pin) return;

		const marker = addChallengeMarker(map, pin.longitude, pin.latitude);

		showChallengeRadius(map, pin.longitude, pin.latitude, radius);

		return () => removeChallengeMarker(marker);
	}, [map, mode, pin, radius]);

	useEffect(() => {
		if (!map || mode !== "student") return;

		const markers = challengesRef.current.map((challenge) => {
			const marker = addChallengeMarker(map, challenge.longitude, challenge.latitude);

			if (challenge.href) {
				showChallengeLink(marker, challenge.title, challenge.href);
			} else {
				showLockedChallenge(marker, challenge.title, challenge.radius);
			}

			return marker;
		});

		return () => markers.forEach(removeChallengeMarker);
	}, [map, mode, challengesKey]);

	return <div ref={mapContainerRef} className={className} />;
}
