import * as v from "valibot";

export const CreateClassSchema = v.object({
	name: v.pipe(v.string("Enter a class name."), v.trim(), v.nonEmpty("Enter a class name.")),
	description: v.pipe(
		v.string("Enter a description."),
		v.trim(),
		v.nonEmpty("Enter a description."),
	),
});
