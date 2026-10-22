"use client";

import type mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import {
	createMap,
	addChallengeMarker,
	removeChallengeMarker,
	showChallengePopup,
	showStudentLocation,
	calculateDistance,
	isWithinRadius,
	selectChallengeLocation,
} from "@/lib/mapbox";

type MapViewProps = {
	mode: "student" | "professor";
	challengeLongitude?: number;
	challengeLatitude?: number;
	challengeTitle?: string;
	challengeDescription?: string;
	radius?: number;
	locationSelect?: (longitude: number, latitude: number) => void;
	availableChange?: (available: boolean) => void;
};

export default function MapView({
	mode,
	challengeLongitude,
	challengeLatitude,
	challengeTitle = "Challenge",
	challengeDescription = "",
	radius = 100,
	locationSelect,
	availableChange,
}: MapViewProps) {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const markerRef = useRef<mapboxgl.Marker | null>(null);
	const locationSelectRef = useRef(locationSelect);
	const availableChangeRef = useRef(availableChange);
	const challengeRef = useRef({
		longitude: challengeLongitude,
		latitude: challengeLatitude,
		radius,
	});

	useEffect(() => {
		locationSelectRef.current = locationSelect;
		availableChangeRef.current = availableChange;
	}, [locationSelect, availableChange]);

	useEffect(() => {
		challengeRef.current = {
			longitude: challengeLongitude,
			latitude: challengeLatitude,
			radius,
		};
	}, [challengeLongitude, challengeLatitude, radius]);

	useEffect(() => {
		if (!mapContainerRef.current) return;
		const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
		if (!accessToken) {
			console.error("Mapbox access token is missing");
			return;
		}
		const map = createMap(mapContainerRef.current, accessToken);
		mapRef.current = map;
		let geolocate: ReturnType<typeof showStudentLocation> | undefined;
		let removeClickListener: (() => void) | undefined;

		if (mode === "student") {
			const geolocate = showStudentLocation(map);

			geolocate.on("geolocate", (event) => {
				const studentLongitude = event.coords.longitude;
				const studentLatitude = event.coords.latitude;

				const { longitude, latitude, radius } = challengeRef.current;

				if (longitude === undefined || latitude === undefined) {
					availableChangeRef.current?.(false);
					return;
				}

				const distance = calculateDistance(
					studentLongitude,
					studentLatitude,
					longitude,
					latitude,
				);

				const available = isWithinRadius(distance, radius);
				availableChangeRef.current?.(available);
			});
		}

		if (mode === "professor") {
			removeClickListener = selectChallengeLocation(map, (longitude, latitude) => {
				if (markerRef.current) {
					removeChallengeMarker(markerRef.current);
				}

				markerRef.current = addChallengeMarker(map, longitude, latitude);

				locationSelectRef.current?.(longitude, latitude);
			});
		}

		return () => {
			removeClickListener?.();

			if (markerRef.current) {
				removeChallengeMarker(markerRef.current);
				markerRef.current = null;
			}

			map.remove();
			mapRef.current = null;
		};
	}, [mode]);

	useEffect(() => {
		const map = mapRef.current;

		if (!map || mode !== "student") return;

		if (markerRef.current) {
			removeChallengeMarker(markerRef.current);
		}

		if (challengeLongitude === undefined || challengeLatitude === undefined) {
			return;
		}

		const marker = addChallengeMarker(map, challengeLongitude, challengeLatitude);

		showChallengePopup(marker, challengeTitle, challengeDescription);

		markerRef.current = marker;
	}, [mode, challengeLongitude, challengeLatitude, challengeTitle, challengeDescription]);

	return <div ref={mapContainerRef} className="h-[800px] w-full" />;
}
