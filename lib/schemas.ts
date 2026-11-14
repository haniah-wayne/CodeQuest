import * as v from "valibot";
import { LANGUAGE_IDS } from "./challenges/languages";
import { UNLOCK_RADII } from "./challenges/location";

export const MIN_POINTS = 1;
export const MAX_POINTS = 100;
export const DEFAULT_POINTS = 10;

// Prevent empty strings or strings like "0x10" from becoming coordinates
const DECIMAL = /^-?\d+(\.\d+)?(e[-+]?\d+)?$/i;

function coordinate(limit: number) {
	const message = "Pick a location on the map.";

	return v.pipe(
		v.string(message),
		v.trim(),
		v.regex(DECIMAL, message),
		v.transform(Number),
		v.minValue(-limit, message),
		v.maxValue(limit, message),
	);
}

export const CreateChallengeSchema = v.object({
	title: v.pipe(
		v.string("Enter a challenge name."),
		v.trim(),
		v.nonEmpty("Enter a challenge name."),
	),
	description: v.pipe(
		v.string("Enter a description."),
		v.trim(),
		v.nonEmpty("Enter a description."),
	),
	solution: v.pipe(
		v.string("Enter the expected output."),
		//v.check((s) => s.trim() !== "", "Enter the expected output."),   remove for test cases to be implicityl possible
	),
	points: v.pipe(
		v.string("Enter a point value."),
		v.trim(),
		v.regex(/^\d+$/, "Points must be a whole number."),
		v.transform(Number),
		v.minValue(MIN_POINTS, `Points must be at least ${MIN_POINTS}.`),
		v.maxValue(MAX_POINTS, `Points can't be more than ${MAX_POINTS}.`),
	),
	longitude: coordinate(180),
	latitude: coordinate(90),
	radius: v.pipe(
		v.string("Pick an unlock radius."),
		v.transform(Number),
		v.picklist(UNLOCK_RADII, "Pick an unlock radius."),
	),
	hidden: v.boolean(),
});

// Positions reported by the browser are already numbers
export const PositionSchema = v.object({
	longitude: v.pipe(v.number(), v.finite(), v.minValue(-180), v.maxValue(180)),
	latitude: v.pipe(v.number(), v.finite(), v.minValue(-90), v.maxValue(90)),
});

// Keeps junk off the code runner
const MAX_CODE_LENGTH = 64 * 1024;

//test cases - lowered it to 10
export const MAX_TEST_CASES = 10;

//moved the test cases to the bottom

const CodeSchema = v.pipe(
	v.string(),
	v.check((code) => code.trim() !== "", "Write some code first."),
	v.maxLength(MAX_CODE_LENGTH, "That's too much code to run."),
);

/*
export const RunCodeSchema = v.object({
	language: v.picklist(LANGUAGE_IDS, "Pick a language."),
	code: CodeSchema,
	//needs to run with input as well
});
*/

//11.12 - Haniah Ahmed - added the new code schema that allows for actual input
export const RunCodeSchema = v.object({
	language: v.picklist(LANGUAGE_IDS, "Pick a language."),
	code: CodeSchema,
	//the actula optional input to run test input
	stdin: v.optional(
		v.pipe(v.string(), v.maxLength(MAX_CODE_LENGTH, "Make sure its within the limit")),
	),
});

export const SubmitSolutionSchema = v.object({
	challengeId: v.pipe(v.number(), v.safeInteger()),
	language: v.picklist(LANGUAGE_IDS, "Pick a language."),
	code: CodeSchema,
	position: PositionSchema,
});

export const GradeSubmissionSchema = v.object({
	submissionId: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
});

export const MAX_GENERATION_REQUEST_LENGTH = 2000;

export const GenerateChallengeSchema = v.object({
	classId: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
	request: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty("Describe the challenge you want."),
		v.maxLength(
			MAX_GENERATION_REQUEST_LENGTH,
			`Keep the description under ${MAX_GENERATION_REQUEST_LENGTH} characters.`,
		),
	),
});

//11.12  - Haniah Ahmed - finished the test case schema and altered the max length to 10
//test cases: what the sorm sends when suggests to generate with ai
const TestCaseSchema = v.object({
	input: v.pipe(v.string(), v.maxLength(MAX_CODE_LENGTH, "")), //checking to  see if input is too long
	expectedOutput: v.pipe(
		v.string(), //making sure its a string
		v.maxLength(MAX_CODE_LENGTH, "The expected output is too long."), //check to see if its too long
		v.check((s) => s.trim() !== "", "The expected output can't be empty."), //check to see if its empty
	),

	hidden: v.boolean(),
});

export const TestCasesSchema = v.pipe(
	v.array(TestCaseSchema, "the test couldnt be read, refresh and try again"),
	v.maxLength(MAX_TEST_CASES, `You can add up to ${MAX_TEST_CASES} test cases.`),
);

export type TestCaseInput = v.InferOutput<typeof TestCaseSchema>; //telling it to use the type of the schema for the test cases, infer the type

export const GeneratedTestCasesSchema = v.object({
	classId: v.pipe(v.number(), v.safeInteger()),
	description: v.pipe(v.string(), v.trim(), v.nonEmpty("write the problem, cannot be empty")),
	sampleSolution: CodeSchema,
	language: v.picklist(LANGUAGE_IDS, "Pick the sample solution's language"),
});
