"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
//defines a student to be used in leaderboard
type student = {
	studentId: string;
	name: string;
	totalScore: number;
};
//define what each individual class leaderboard is
type classLeaderboard = {
	classID: string;
	className: string;
	leaderboard: student[];
};

export default function LeaderboardPage() {
	return (
		<div>
			<h1>Leaderboard</h1>
		</div>
	);
}
