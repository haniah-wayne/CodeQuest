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
	longitude: v.pipe(
		v.string("Pick a location on the map."),
		v.nonEmpty("Pick a location on the map."),
		v.transform(Number),
		v.number("Pick a location on the map."),
		v.minValue(-180, "Pick a location on the map."),
		v.maxValue(180, "Pick a location on the map."),
	),
	latitude: v.pipe(
		v.string("Pick a location on the map."),
		v.nonEmpty("Pick a location on the map."),
		v.transform(Number),
		v.number("Pick a location on the map."),
		v.minValue(-90, "Pick a location on the map."),
		v.maxValue(90, "Pick a location on the map."),
	),
});
