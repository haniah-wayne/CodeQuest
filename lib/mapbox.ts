import mapboxgl from "mapbox-gl";

export function createMap(container: HTMLElement, accessToken: string) {
	const map = new mapboxgl.Map({
		container,
		accessToken,
		style: "mapbox://styles/mapbox/streets-v12",
		center: [-83.0717, 42.3594],
		zoom: 15,
	});

	return map;
}

export function addChallengeMarker(map: mapboxgl.Map, longitude: number, latitude: number) {
	const marker = new mapboxgl.Marker();

	marker.setLngLat([longitude, latitude]);
	marker.addTo(map);

	return marker;
}

export function selectChallengeLocation(
	map: mapboxgl.Map,
	selectLocation: (longitude: number, latitude: number) => void,
) {
	const handleClick = (event: mapboxgl.MapMouseEvent) => {
		const { lng: longitude, lat: latitude } = event.lngLat.wrap();

		selectLocation(longitude, latitude);
	};

	map.on("click", handleClick);

	return () => map.off("click", handleClick);
}

export function removeChallengeMarker(marker: mapboxgl.Marker) {
	marker.remove();
}

export function showStudentLocation(map: mapboxgl.Map) {
	const geolocate = new mapboxgl.GeolocateControl({
		positionOptions: { enableHighAccuracy: true, timeout: 10_000 },
		trackUserLocation: true,
		showUserLocation: true,
		followUserLocation: false,
	});

	map.addControl(geolocate);

	return geolocate;
}

export function showChallengeLink(marker: mapboxgl.Marker, title: string, href: string) {
	const link = document.createElement("a");

	link.href = href;
	link.textContent = title;
	link.className = "text-label text-wsu-green underline-offset-4 hover:underline";

	const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(link);

	marker.setPopup(popup);

	return popup;
}

const RADIUS_SOURCE = "challenge-radius";
const RADIUS_STEPS = 64;
const METERS_PER_DEGREE = 111_320;

// Approximates the unlock area as a polygon, which is accurate enough at
// campus scale
function radiusPolygon(longitude: number, latitude: number, radius: number) {
	const lngScale = METERS_PER_DEGREE * Math.cos((latitude * Math.PI) / 180);

	const ring = Array.from({ length: RADIUS_STEPS + 1 }, (_, i) => {
		const angle = (i / RADIUS_STEPS) * 2 * Math.PI;

		return [
			longitude + (radius * Math.cos(angle)) / lngScale,
			latitude + (radius * Math.sin(angle)) / METERS_PER_DEGREE,
		];
	});

	return {
		type: "Feature" as const,
		properties: {},
		geometry: { type: "Polygon" as const, coordinates: [ring] },
	};
}

// The map's style must be loaded before calling this
export function showChallengeRadius(
	map: mapboxgl.Map,
	longitude: number,
	latitude: number,
	radius: number,
) {
	const data = radiusPolygon(longitude, latitude, radius);
	const source = map.getSource<mapboxgl.GeoJSONSource>(RADIUS_SOURCE);

	if (source) {
		source.setData(data);
		return;
	}

	map.addSource(RADIUS_SOURCE, { type: "geojson", data });

	map.addLayer({
		id: `${RADIUS_SOURCE}-fill`,
		type: "fill",
		source: RADIUS_SOURCE,
		paint: { "fill-color": "#0c5449", "fill-opacity": 0.12 },
	});

	map.addLayer({
		id: `${RADIUS_SOURCE}-outline`,
		type: "line",
		source: RADIUS_SOURCE,
		paint: { "line-color": "#0c5449", "line-width": 2 },
	});
}
