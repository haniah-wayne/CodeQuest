//11.19 - Haniah Ahmed - does the calculating for the challenge statistics
//every attempt counts toward attempts, but a student's score is their best one
//same as leaderboard

import type { Tables } from "@/supabase/database.types";

//picking only the columns the stats need
type SubmissionRow = Pick<Tables<"Submission">, "StudentID" | "Score" | "Status">;

//what the stats panel gets back
export interface SubmissionStats {
	studentsSubmitted: number;
	rosterSize: number;
	solvedCount: number;
	unsolvedCount: number;
	meanScore: number | null;
	medianScore: number | null;
	modeScore: number | null;
	highScore: number | null;
	lowScore: number | null;
	meanAttempts: number | null;
}

//the running tota for a single student
interface StudentSummary {
	attempts: number;
	best: number | null;
	solved: boolean;
}

//average of a list, dont divide bt 0
function mean(values: readonly number[]) {
	if (values.length === 0) return null;

	let total = 0; //runnign sum
	for (const value of values) total += value;

	return total / values.length;
}

//make sure th elist is sorted
function median(sorted: readonly number[]) {
	if (sorted.length === 0) return null;

	const mid = Math.floor(sorted.length / 2); //round down the middle index

	//if even take the avrg of the middle
	return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

//most common value, lower score preference
function mode(sorted: readonly number[]) {
	const counts = new Map<number, number>(); //median counting score
	let best: number | null = null;
	let bestCount = 0;

	for (const value of sorted) {
		const count = (counts.get(value) ?? 0) + 1;
		counts.set(value, count);

		//replace on bigger count
		if (count > bestCount) {
			best = value;
			bestCount = count;
		}
	}

	return best;
}

export function getSubmissionStats(
	submissions: readonly SubmissionRow[],
	rosterSize: number,
): SubmissionStats {
	//student id summary
	const byStudent = new Map<string, StudentSummary>();

	for (const { StudentID, Score, Status } of submissions) {
		const summary = byStudent.get(StudentID) ?? { attempts: 0, best: null, solved: false };

		summary.attempts += 1; //each row is an attempt

		//zero score doesnt count
		if (Score !== null) summary.best = Math.max(summary.best ?? Score, Score);

		if (Status === "correct") summary.solved = true;

		byStudent.set(StudentID, summary);
	}

	const bestScores: number[] = []; //best score per student
	const attemptCounts: number[] = []; //one attempt count per student
	let solvedCount = 0;

	for (const { best, attempts, solved } of byStudent.values()) {
		if (best !== null) bestScores.push(best); // no score left out
		attemptCounts.push(attempts);
		if (solved) solvedCount += 1;
	}

	//numeric sortrint
	bestScores.sort((a, b) => a - b);

	return {
		studentsSubmitted: byStudent.size,
		rosterSize,
		solvedCount,
		unsolvedCount: byStudent.size - solvedCount,
		meanScore: mean(bestScores),
		medianScore: median(bestScores),
		modeScore: mode(bestScores),
		highScore: bestScores.at(-1) ?? null,
		lowScore: bestScores[0] ?? null,
		meanAttempts: mean(attemptCounts),
	};
}
