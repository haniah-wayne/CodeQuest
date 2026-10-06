"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type student = {
	student_id: string;
	student_name: string;
	total_score: number;
	rank: number;
};

type classLeaderboard = {
	classId: number;
	className: string;
	leaderboard: student[];
};

export default function LeaderboardPage() {
	const [globalLeaderboard, setGlobalLeaderboard] = useState<student[]>([]);
	const [classLeaderboards, setClassLeaderboards] = useState<classLeaderboard[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		async function loadLeaderboards() {
			try {
				setLoading(true);
				const supabase = createClient();
				//make sure a user is logged in
				const {
					data: { user },
					error: userError,
				} = await supabase.auth.getUser();
				if (userError) {
					throw userError;
				}
				if (!user) {
					throw new Error("Not logged in");
				}
				//get students enrolled classes
				const { data: enrollments, error: enrollmentError } = await supabase
					.from("Enrollment")
					.select(`
                ClassID,
                Classes:ClassID (
                    ClassID,
                    ClassName
                )
            `)
					.eq("StudentID", user.id);
				if (enrollmentError) {
					throw enrollmentError;
				}
				//global leaderboard, all organization done by supabase rpc function
				const { data: globalLeaderboard, error: globalError } =
					await supabase.rpc("get_global_leaderboard");
				if (globalError) {
					throw globalError;
				}
				setGlobalLeaderboard(globalLeaderboard ?? []);
				//class leaderboards, does one rpc call per a class
				const classBoards = await Promise.all(
					(enrollments ?? []).map(async (enrollment) => {
						const { data, error } = await supabase.rpc("get_class_leaderboard", {
							p_class_id: enrollment.ClassID,
						});
						if (error) {
							throw error;
						}
						return {
							classId: enrollment.ClassID,
							className: enrollment.Classes?.ClassName ?? "Unknown Class",
							leaderboard: data ?? [],
						};
					}),
				);
				setClassLeaderboards(classBoards);
				//generic error catch
			} catch (err) {
				console.error(err);
				setError(err instanceof Error ? err.message : "Something went wrong.");
			} finally {
				setLoading(false);
			}
		}
		loadLeaderboards();
	}, []);
	//catch for if the leaderboard is still loading
	if (loading) {
		return <p>Loading leaderboards...</p>;
	}
	//displays any errors that might have occured during loading
	if (error) {
		return <p className="text-red-500">{error}</p>;
	}
	// display the actual pages
	return (
		<>
			<h1>Leaderboards</h1>
			<h2>Global Leaderboard</h2>
			<ol>
				{globalLeaderboard.map((student, index) => (
					<li key={student.student_id}>
						{index + 1}. {student.student_name} - {student.total_score} points
					</li>
				))}
			</ol>
			<h2>Class Leaderboards</h2>
			{classLeaderboards.map((classBoard) => (
				<div key={classBoard.classId}>
					<h3>{classBoard.className}</h3>
					<ol>
						{classBoard.leaderboard.map((student, index) => (
							<li key={student.student_id}>
								{index + 1}. {student.student_name} - {student.total_score} points
							</li>
						))}
					</ol>
				</div>
			))}
		</>
	);
}
