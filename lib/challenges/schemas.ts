import * as v from "valibot";
import { LANGUAGE_IDS } from "./languages";

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
		v.check((s) => s.trim() !== "", "Enter the expected output."),
	),
	longitude: coordinate(180),
	latitude: coordinate(90),
    hidden: v.boolean(),     //10.29.Haniah -> additonal schema field to show if the challenge is hidden or not
});

// Keeps junk off the code runner
const MAX_CODE_LENGTH = 64 * 1024;

const CodeSchema = v.pipe(
	v.string(),
	v.check((code) => code.trim() !== "", "Write some code first."),
	v.maxLength(MAX_CODE_LENGTH, "That's too much code to run."),
);

export const RunCodeSchema = v.object({
	language: v.picklist(LANGUAGE_IDS, "Pick a language."),
	code: CodeSchema,
});

export const SubmitSolutionSchema = v.object({
	challengeId: v.pipe(v.number(), v.safeInteger()),
	language: v.picklist(LANGUAGE_IDS, "Pick a language."),
	code: CodeSchema,
});
