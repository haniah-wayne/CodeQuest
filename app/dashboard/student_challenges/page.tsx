"use client";

import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import MapView from "@/components/map-view";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { calculateDistance } from "@/lib/mapbox";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type StudentClass = {
	ClassID: number;
	ClassName: string;
};

type Challenge = {
	ChallengeID: number;
	ClassID: number;
	Title: string;
	Description: string | null;
	Points: number;
	ChallengeType: string | null;
	Instructions: string | null;
	CreatedAt: string | null;
	status: "Locked" | "Available" | "Checked In" | "Completed";
	Latitude: number | null;
	Longitude: number | null;
	Radius: number | null;
};

export default function MyChallengesPage() {
	const [classes, setClasses] = useState<StudentClass[]>([]);
	const [challenges, setChallenges] = useState<Challenge[]>([]);
	const [selectedClass, setSelectedClass] = useState("all");
	const [loading, setLoading] = useState(true);
	const [checkingIn, setCheckingIn] = useState<number | null>(null);
	const [message, setMessage] = useState("");

	useEffect(() => {
		async function loadChallenges() {
			setLoading(true);
			setMessage("");

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) {
				setMessage("Please sign in first.");
				setLoading(false);
				return;
			}

			const { data: enrollments, error: enrollmentError } = await supabase
				.from("Enrollment")
				.select("ClassID")
				.eq("StudentID", user.id);

			if (enrollmentError) {
				setMessage(enrollmentError.message);
				setLoading(false);
				return;
			}

			const classIds = enrollments?.map((item) => item.ClassID) ?? [];

			if (classIds.length === 0) {
				setClasses([]);
				setChallenges([]);
				setLoading(false);
				return;
			}

			const [classesResult, challengesResult] = await Promise.all([
				supabase.from("Classes").select("ClassID, ClassName").in("ClassID", classIds),

				supabase
					.from("Challenges")
					.select(
						"ChallengeID, ClassID, Title, Description, Points, ChallengeType, Instructions, CreatedAt",
					)
					.in("ClassID", classIds),
			]);

			const firstError = classesResult.error || challengesResult.error;

			if (firstError) {
				setMessage(firstError.message);
				setLoading(false);
				return;
			}

			setClasses(classesResult.data ?? []);

			const challengeData = challengesResult.data ?? [];
			const ids = challengeData.map((c) => c.ChallengeID);

			if (ids.length === 0) {
				setChallenges([]);
				setLoading(false);
				return;
			}

			const [locationsResult, submissionsResult, checkInsResult] = await Promise.all([
				supabase
					.from("Locations")
					.select("LocationID, ChallengeID, Latitude, Longitude, Radius")
					.in("ChallengeID", ids),

				supabase
					.from("Submission")
					.select("ChallengeID, Score")
					.eq("StudentID", user.id)
					.in("ChallengeID", ids),

				supabase
					.from("CheckIns")
					.select("ChallengeID")
					.eq("StudentID", user.id)
					.eq("Successful", true)
					.in("ChallengeID", ids),
			]);

			const secondError =
				locationsResult.error || submissionsResult.error || checkInsResult.error;

			if (secondError) {
				setMessage(secondError.message);
				setLoading(false);
				return;
			}

			const locationData = locationsResult.data;
			const submissions = submissionsResult.data;
			const checkIns = checkInsResult.data;

			const combined: Challenge[] = challengeData.map((challenge) => {
				const submission = submissions?.find(
					(sub) => sub.ChallengeID === challenge.ChallengeID,
				);

				const location = locationData?.find(
					(loc) => loc.ChallengeID === challenge.ChallengeID,
				);

				const checkedIn = checkIns?.some(
					(item) => item.ChallengeID === challenge.ChallengeID,
				);

				let status: Challenge["status"] = "Locked";
				if (location) status = "Available";
				if (checkedIn) status = "Checked In";
				if (submission) status = "Completed";
				return {
					...challenge,
					Latitude: location?.Latitude ?? null,
					Longitude: location?.Longitude ?? null,
					Radius: location?.Radius ?? null,
					status,
				};
			});

			setChallenges(combined);
			setLoading(false);
		}

		loadChallenges();
	}, []);

	const filteredChallenges =
		selectedClass === "all"
			? challenges
			: challenges.filter((challenge) => challenge.ClassID === Number(selectedClass));

	async function saveCheckIn(
		challengeId: number,
		latitude: number,
		longitude: number,
		distance: number,
	) {
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			setMessage("Please sign in first.");
			return false;
		}

		const { error } = await supabase.from("CheckIns").insert({
			StudentID: user.id,
			ChallengeID: challengeId,
			Latitude: latitude,
			Longitude: longitude,
			Distance: distance,
			Successful: true,
			CheckedInAt: new Date().toISOString(),
		});

		if (error) {
			setMessage(error.message);
			return false;
		}

		setMessage("Check-in successful!");
		return true;
	}

	async function handleCheckIn(challenge: Challenge) {
		if (
			challenge.Latitude === null ||
			challenge.Longitude === null ||
			challenge.Radius === null
		) {
			setMessage("Challenge location is not available.");
			return;
		}

		if (!navigator.geolocation) {
			setMessage("Geolocation is not supported by your browser.");
			return;
		}

		setCheckingIn(challenge.ChallengeID);
		setMessage("");

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const distance = calculateDistance(
					position.coords.latitude,
					position.coords.longitude,
					challenge.Latitude!,
					challenge.Longitude!,
				);

				try {
					if (distance <= challenge.Radius!) {
						const success = await saveCheckIn(
							challenge.ChallengeID,
							position.coords.latitude,
							position.coords.longitude,
							distance,
						);

						if (success) {
							setChallenges((prev) =>
								prev.map((item) =>
									item.ChallengeID === challenge.ChallengeID
										? { ...item, status: "Checked In" }
										: item,
								),
							);
						}
					} else {
						setMessage("You are too far from the challenge location.");
					}
				} catch {
					setMessage("Unable to save check-in.");
				} finally {
					setCheckingIn(null);
				}
			},
			() => {
				setMessage("Unable to get your location.");
				setCheckingIn(null);
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
			},
		);
	}

	return (
		<div className="w-full space-y-6">
			<DashboardPageHeader
				title="My Challenges"
				description="Explore challenges and track your progress."
			/>
		</div>
	);
}
