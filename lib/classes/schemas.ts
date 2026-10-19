import * as v from "valibot";

export const CreateClassSchema = v.object({
	name: v.pipe(v.string("Enter a class name."), v.trim(), v.nonEmpty("Enter a class name.")),
	description: v.pipe(
		v.string("Enter a description."),
		v.trim(),
		v.nonEmpty("Enter a description."),
	),
});

export const JoinClassSchema = v.object({
	// Codes are generated as lowercase hex, so accept whatever case was typed
	code: v.pipe(
		v.string("Enter a join code."),
		v.trim(),
		v.toLowerCase(),
		v.nonEmpty("Enter a join code."),
	),
});
