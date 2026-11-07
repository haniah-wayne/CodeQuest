"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { getSessionUser } from "@/lib/auth/session";
import { CreateChallengeSchema } from "@/lib/challenges/schemas";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";

//ai imports
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LanguageId } from "@/lib/challenges/languages";
import { execute } from "@/lib/piston";

export interface CreateChallengeState {
	error?: string;
	fieldErrors?: Partial<
		Record<
			"title" | "description" | "solution" | "points" | "longitude" | "latitude" | "radius",
			string
		>
	>;
	// Sent back on failure so the form doesn't clear what was typed
	values?: { title: string; description: string; solution: string; points: string };
}

export async function createChallenge(
	_prevState: CreateChallengeState,
	formData: FormData,
): Promise<CreateChallengeState> {
	const values = {
		title: formData.get("title")?.toString() ?? "",
		description: formData.get("description")?.toString() ?? "",
		solution: formData.get("solution")?.toString() ?? "",
		points: formData.get("points")?.toString() ?? "",
	};

	const location = {
		longitude: formData.get("longitude")?.toString() ?? "",
		latitude: formData.get("latitude")?.toString() ?? "",
		radius: formData.get("radius")?.toString() ?? "",
		hidden: formData.has("hidden"),
	};

	const classId = Number(formData.get("classId"));

	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { values, error: "Only professors can create challenges." };
	}

	if (!Number.isSafeInteger(classId)) {
		return { values, error: "That class doesn't exist." };
	}

	const parsed = v.safeParse(CreateChallengeSchema, { ...values, ...location });

	if (!parsed.success) {
		return {
			values,
			fieldErrors: toFieldErrors(
				v.flatten<typeof CreateChallengeSchema>(parsed.issues).nested ?? {},
			),
		};
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

	const { title, description, solution, points, longitude, latitude, radius, hidden } =
		parsed.output;

	const { error } = await supabase.rpc("create_challenge", {
		class_id: classId,
		title,
		description,
		solution,
		points,
		long: longitude,
		lat: latitude,
		radius,
		hidden,
	});

	if (error) {
		console.error(error);

		return { values, error: "Something went wrong saving that challenge." };
	}

	revalidatePath(`/dashboard/classes/${classId}`);
	redirect(`/dashboard/classes/${classId}`);
}

//moving on to the ai component
//function to generate test cases

//interface to deal with the diff returns
interface GenerateTestCasesResult {
	testCases: { input: string; expectedOutput: string }[];
	error?: string;
}

export async function generateTestCases(
	problem_description: string,
	reference: string,
	language: LanguageId,
): Promise<GenerateTestCasesResult> {
	try {
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

		const model = genAI.getGenerativeModel({
			model: "gemini-3.8-flash",
			// Ask for JSON instead of regular chat messages, so code can read the reply
			generationConfig: { responseMimeType: "application/json" },
		});

		//sedigin the specific message
		const test_case_prompt = `Write 5 test inputs for this beginner programming problem.
		Reply with a JSON array of strings. Each string is the exact text given to the program on standard input.
		Include normal cases and a couple of edge cases. Only write inputs, not outputs.

		Problem:
		${problem_description}

		Sample solution (${language}):
		${reference}`;

		//take the reply
		const reply = await model.generateContent(test_case_prompt);
		const inputs: string[] = JSON.parse(reply.response.text());

		const testCases: GenerateTestCasesResult["testCases"] = [];

		//same piston runner that the 
		for (const input of inputs) {
			// Same Piston runner students use, the 3rd argument is input
			const run = await execute(language, reference, input);
			if (run.problem) continue; // skip inputs that crash the sample solution
			testCases.push({ input, expectedOutput: run.stdout });
		}

		//send test cases to be displayed 
		return { testCases };
	} catch (error) {
		console.error(error);
		return { testCases: [], error: "Couldn't generate test cases. Try again." };
	}
}

