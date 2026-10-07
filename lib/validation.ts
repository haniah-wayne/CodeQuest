// Keeps the first message for each field from valibot's flattened issues
export function toFieldErrors<Field extends string>(
	nested: Partial<Record<string, [string, ...string[]]>>,
): Partial<Record<Field, string>> {
	return Object.fromEntries(
		Object.entries(nested).flatMap(([field, messages]) =>
			messages?.[0] ? [[field, messages[0]]] : [],
		),
	) as Partial<Record<Field, string>>;
}
