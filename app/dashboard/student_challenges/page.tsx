"use client";

import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
	const R = 6371000;

	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) ** 2;

	return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

			const { data: classData, error: classError } = await supabase
				.from("Classes")
				.select("ClassID, ClassName")
				.in("ClassID", classIds);

			if (classError) {
				setMessage(classError.message);
				setLoading(false);
				return;
			}

			setClasses(classData ?? []);

			const { data: challengeData, error: challengeError } = await supabase
				.from("Challenges")
				.select(
					"ChallengeID, ClassID, Title, Description, Points, ChallengeType, Instructions, CreatedAt",
				)
				.in("ClassID", classIds);

			if (challengeError) {
				setMessage(challengeError.message);
				setLoading(false);
				return;
			}

			const ids = challengeData?.map((c) => c.ChallengeID) ?? [];

			if (ids.length === 0) {
				setChallenges([]);
				setLoading(false);
				return;
			}

			const { data: locationData, error: locationError } = await supabase
				.from("Locations")
				.select("LocationID, ChallengeID, Latitude, Longitude, Radius")
				.in("ChallengeID", ids);

			if (locationError) {
				setMessage(locationError.message);
				setLoading(false);
				return;
			}

			const { data: submissions, error: submissionError } = await supabase
				.from("Submission")
				.select("ChallengeID, Score")
				.eq("StudentID", user.id)
				.in("ChallengeID", ids);

			if (submissionError) {
				setMessage(submissionError.message);
				setLoading(false);
				return;
			}

			const { data: checkIns, error: checkInError } = await supabase
				.from("CheckIns")
				.select("ChallengeID")
				.eq("StudentID", user.id)
				.eq("Successful", true)
				.in("ChallengeID", ids);

			if (checkInError) {
				setMessage(checkInError.message);
				setLoading(false);
				return;
			}

			const combined: Challenge[] = (challengeData ?? []).map((challenge) => {
				const submission = submissions?.find(
					(sub) => sub.ChallengeID === challenge.ChallengeID,
				);

				const location = locationData?.find(
					(loc) => loc.ChallengeID === challenge.ChallengeID,
				);

				const checkedIn = checkIns?.some(
					(item) => item.ChallengeID === challenge.ChallengeID,
				);

				return {
					...challenge,
					Latitude: location?.Latitude ?? null,
					Longitude: location?.Longitude ?? null,
					Radius: location?.Radius ?? null,
					status: submission
						? "Completed"
						: checkedIn
							? "Checked In"
							: location
								? "Available"
								: "Locked",
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
