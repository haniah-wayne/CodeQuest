import * as v from "valibot";

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
});
