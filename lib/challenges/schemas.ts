import * as v from "valibot";

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
	solution: v.pipe(v.string("Enter the solution."), v.trim(), v.nonEmpty("Enter the solution.")),
	longitude: coordinate(180),
	latitude: coordinate(90),
});
