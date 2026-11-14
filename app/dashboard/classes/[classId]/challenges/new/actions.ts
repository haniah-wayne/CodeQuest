"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import {
	type GeneratedChallenge,
	GenerationError,
	generateChallenge as requestGeneratedChallenge,
} from "@/lib/ai/challenge";
import { getSessionUser } from "@/lib/auth/session";
import {
	CreateChallengeSchema,
	GenerateChallengeSchema,
	type TestCaseInput,
	TestCasesSchema,
} from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";
//new imports needed for functions

export interface GenerateChallengeState {
	error?: string;
	challenge?: GeneratedChallenge;
}

export interface ChallengeFormState {
	error?: string;
	fieldErrors?: Partial<
		Record<
			"title" | "description" | "points" | "longitude" | "latitude" | "radius" | "testCases", //adding testCases
			string
		>
	>;
	// Sent back on failure so the form doesn't clear what was typed
	values?: { title: string; description: string; points: string };
}

function readForm(formData: FormData) {
	const values = {
		title: formData.get("title")?.toString() ?? "",
		description: formData.get("description")?.toString() ?? "",
		points: formData.get("points")?.toString() ?? "",
	};

	const location = {
		longitude: formData.get("longitude")?.toString() ?? "",
		latitude: formData.get("latitude")?.toString() ?? "",
		radius: formData.get("radius")?.toString() ?? "",
		hidden: formData.has("hidden"),
	};

	return { values, parsed: v.safeParse(CreateChallengeSchema, { ...values, ...location }) };
}

//11.13 - Haniah Ahmed - changes to create challenge so that it includes test cases
export async function createChallenge(
	_prevState: ChallengeFormState,
	formData: FormData,
): Promise<ChallengeFormState> {
	const validated = validateChallenge(formData); //using validateChallenge instead
	const { values } = validated;

	const classId = Number(formData.get("classId"));

	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { values, error: "Only professors can create challenges." };
	}

	if (!Number.isSafeInteger(classId)) {
		return { values, error: "That class doesn't exist." };
	}

	//no challenge, validation failed, return field errors
	if (!validated.challenge) {
		return { values, fieldErrors: validated.fieldErrors };
	}

	const supabase = await createClient();

	// The class ID comes from the form, so confirm this professor owns it
	const { data: classInfo } = await supabase
		.from("Classes")
		.select("ProfessorID")
		.eq("ClassID", classId)
		.maybeSingle();

	if (classInfo?.ProfessorID !== user.id) {
		return { values, error: "You don't have permission to add challenges to this class." };
	}

	const { title, description, points, longitude, latitude, radius, hidden } = validated.challenge;

	const { data: challengeId, error } = await supabase.rpc("create_challenge", {
		class_id: classId,
		title,
		description,
		// Challenges are graded by their test cases, so there's no single output
		solution: "",
		points,
		long: longitude,
		lat: latitude,
		radius,
		hidden,
	});

	if (error || challengeId === null) {
		console.error(error);

		return { values, error: "Something went wrong saving that challenge." };
	}

	// challenge exists, save the test cases
	const { error: testCaseError } = await supabase
		.from("TestCase")
		.insert(toTestCaseRows(challengeId, validated.testCases));

	if (testCaseError) {
		console.error(testCaseError);

		return {
			values,
			error: "The challenge was saved, but its test cases weren't. Edit the challenge to add them again.",
		};
	}

	revalidatePath(`/dashboard/classes/${classId}`); //refresh class page data so new challenge shows up
	redirect(`/dashboard/classes/${classId}`); //send instructor back to class
}

export async function generateChallenge(input: {
	classId: number;
	request: string;
}): Promise<GenerateChallengeState> {
	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { error: "Only professors can generate challenges." };
	}

	const parsed = v.safeParse(GenerateChallengeSchema, input);

	if (!parsed.success) {
		return { error: parsed.issues[0].message };
	}

	const { classId, request } = parsed.output;

	const supabase = await createClient();

	const { data: classInfo } = await supabase
		.from("Classes")
		.select("ClassName, ProfessorID")
		.eq("ClassID", classId)
		.maybeSingle();

	if (classInfo?.ProfessorID !== user.id) {
		return { error: "You don't have permission to add challenges to this class." };
	}

	try {
		return {
			challenge: await requestGeneratedChallenge({ request, className: classInfo.ClassName }),
		};
	} catch (error) {
		console.error(error);

		return {
			error:
				error instanceof GenerationError
					? "The AI couldn't write a challenge with a working solution. Try rewording your request."
					: "The AI couldn't generate a challenge right now. Try again in a moment.",
		};
	}
}

export async function updateChallenge(
	_prevState: ChallengeFormState,
	formData: FormData,
): Promise<ChallengeFormState> {
	//const { values, parsed } = readForm(formData);
	//const classId = Number(formData.get("classId"));
	//const challengeId = Number(formData.get("challengeId"));

	//updating values
	const validated = validateChallenge(formData); //using validate challenge instead
	const { values } = validated;
	const classId = Number(formData.get("classId"));
	const challengeId = Number(formData.get("challengeId"));

	// The IDs come from the form, so confirm this professor owns the challenge
	if (!(await professorOwnsChallenge(classId, challengeId))) {
		return { values, error: "You don't have permission to edit this challenge." };
	}

	// nvalidation faileld , send errors back
	if (!validated.challenge) {
		return { values, fieldErrors: validated.fieldErrors };
	}

	const { title, description, points, longitude, latitude, radius, hidden } = validated.challenge;

	const supabase = await createClient();

	// There's no update_challenge RPC, so these are separate writes and a
	// failure partway through can leave the challenge half updated
	const [challengeResult, locationResult] = await Promise.all([
		supabase
			.from("Challenges")
			.update({ Title: title, Description: description, Points: points, Hidden: hidden })
			.eq("ChallengeID", challengeId)
			.select("ChallengeID"),
		supabase
			.from("Locations")
			.update({ Longitude: longitude, Latitude: latitude, Radius: radius })
			.eq("ChallengeID", challengeId)
			.select("ChallengeID"),
	]);

	// RLS skips rows it won't let us update instead of erroring, so check that
	// each write actually hit a row
	const failed = [challengeResult, locationResult].find(
		(result) => result.error || !result.data?.length,
	);

	if (failed) {
		console.error(failed.error ?? `Challenge ${challengeId} update matched no rows`);

		return { values, error: "Something went wrong saving your changes." };
	}

	// remove old test cases and insert the ne ones
	const { error: deleteError } = await supabase
		.from("TestCase")
		.delete()
		.eq("ChallengeID", challengeId);

	// skip the insert if the delete failed
	const { error: insertError } = deleteError
		? { error: deleteError }
		: await supabase.from("TestCase").insert(toTestCaseRows(challengeId, validated.testCases));

	if (insertError) {
		console.error(insertError);

		return { values, error: "Your changes were saved, but the test cases weren't." };
	}

	revalidatePath(`/dashboard/classes/${classId}`);
	revalidatePath(`/dashboard/classes/${classId}/challenges/${challengeId}`);
	redirect(`/dashboard/classes/${classId}`);
}

export async function deleteChallenge(
	_prevState: { error?: string },
	formData: FormData,
): Promise<{ error?: string }> {
	const classId = Number(formData.get("classId"));
	const challengeId = Number(formData.get("challengeId"));

	if (!(await professorOwnsChallenge(classId, challengeId))) {
		return { error: "You don't have permission to delete this challenge." };
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("Challenges")
		.delete()
		.eq("ChallengeID", challengeId)
		.select("ChallengeID");

	if (error || !data?.length) {
		console.error(error);

		return { error: "Something went wrong deleting that challenge." };
	}

	revalidatePath(`/dashboard/classes/${classId}`);

	return {};
}

// 10.30.Haniah added a function to check if the professor owns the challenge
async function professorOwnsChallenge(classId: number, challengeId: number) {
	const user = await getSessionUser();

	if (user?.role !== "professor") return false;
	if (!Number.isSafeInteger(classId) || !Number.isSafeInteger(challengeId)) return false;

	const supabase = await createClient();

	const { data: challenge, error } = await supabase
		.from("Challenges")
		.select("Classes(ProfessorID)")
		.eq("ChallengeID", challengeId)
		.eq("ClassID", classId)
		.maybeSingle();

	if (error) console.error(error);

	return challenge?.Classes.ProfessorID === user.id;
}

//11.12 - Haniah Ahmed - more test case related helper functions

//the form sends each test case as one JSON string in hidden input
function readTestCases(formData: FormData) {
	let raw: unknown = null; //stays null if it cant be read

	try {
		raw = JSON.parse(formData.get("testCases")?.toString() ?? "[]");
	} catch {
		//leaving the row as null, set above
	}
	return v.safeParse(TestCasesSchema, raw); //list of valid test cases checkign
}

//checks challenge field and test cases together
function validateChallenge(formData: FormData) {
	const { values, parsed } = readForm(formData);
	const testCases = readTestCases(formData);

	if (!parsed.success || !testCases.success) {
		return {
			values,
			fieldErrors: {
				...(parsed.success //normal field errors from challenge fields
					? {}
					: toFieldErrors(
							v.flatten<typeof CreateChallengeSchema>(parsed.issues).nested ?? {},
						)),
				...(testCases.success ? {} : { testCases: testCases.issues[0].message }), //error from test case list
			},
		};
	}

	return { values, challenge: parsed.output, testCases: testCases.output };
}

//turns test cases into rows for the database
function toTestCaseRows(challengeId: number, testCases: TestCaseInput[]) {
	return testCases.map((tc) => ({
		ChallengeID: challengeId,
		Input: tc.input,
		ExpectedOutput: tc.expectedOutput,
	}));
}
