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
		const longitude = event.lngLat.lng;
		const latitude = event.lngLat.lat;

		console.log(longitude, latitude);

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
		trackUserLocation: true,
		showUserLocation: true,
		followUserLocation: false,
	});

	map.addControl(geolocate);

	return geolocate;
}

export function calculateDistance(
	studentLongitude: number,
	studentLatitude: number,
	challengeLongitude: number,
	challengeLatitude: number,
) {
	const studentLocation = new mapboxgl.LngLat(studentLongitude, studentLatitude);

	const challengeLocation = new mapboxgl.LngLat(challengeLongitude, challengeLatitude);

	return studentLocation.distanceTo(challengeLocation);
}

export function isWithinRadius(distance: number, radius: number) {
	return distance <= radius;
}

export function showChallengePopup(marker: mapboxgl.Marker, title: string, description: string) {
	const popup = new mapboxgl.Popup({ offset: 25 }).setText(`${title}: ${description}`);

	marker.setPopup(popup);

	return popup;
}
