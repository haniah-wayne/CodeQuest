import { createClient } from "@/lib/supabase/server";

export async function getData(submissionId: number) {
	const supabase = await createClient();

	const { data: submission, error: submissionError } = await supabase
		.from("Submission")
		.select("Code,ChallengeID")
		.eq("SubmissionID", submissionId)
		.single();

	if (submissionError || !submission) {
		console.error("Failed to fetch submission:", submissionError);
		throw new Error("Failed to fetch submission");
	}
	const challengeId = submission.ChallengeID;

	const { data: solution, error: solutionError } = await supabase
		.from("Solutions")
		.select("Solution")
		.eq("ChallengeID", challengeId)
		.single();

	if (solutionError || !solution) {
		console.error("Failed to fetch solution:", solutionError);
		throw new Error("Failed to fetch solution");
	}

	const { data: testCase, error: testCaseError } = await supabase
		.from("TestCase")
		.select("ExpectedOutput")
		.eq("ChallengeID", challengeId);

	if (testCaseError || !testCase || testCase.length === 0) {
		console.error("Failed to fetch TestCase:", testCaseError);
		throw new Error("Failed to fetch TestCase");
	}

	const pulledData = {
		studentCode: submission.Code,
		expectedSolution: solution.Solution,
		testCases: testCase,
	};
	const jsonString = JSON.stringify(pulledData);

	return jsonString;
}
