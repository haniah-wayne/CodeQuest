export const LANGUAGES = {
	python: {
		label: "Python",
		piston: { language: "python", version: "3.12.0" },
		starter: "# Write your solution here\n",
	},
	java: {
		label: "Java",
		piston: { language: "java", version: "15.0.2" },
		starter: `public class Main {
    public static void main(String[] args) {
        // Write your solution here
    }
}
`,
	},
	cpp: {
		label: "C++",
		piston: { language: "c++", version: "10.2.0" },
		starter: `#include <iostream>

int main() {
    // Write your solution here
    return 0;
}
`,
	},
	javascript: {
		label: "JavaScript",
		piston: { language: "javascript", version: "20.11.1" },
		starter: "// Write your solution here\n",
	},
} as const;

export type LanguageId = keyof typeof LANGUAGES;

export const LANGUAGE_IDS = Object.keys(LANGUAGES) as LanguageId[];

export const DEFAULT_LANGUAGE: LanguageId = "python";

export function isLanguageId(value: unknown): value is LanguageId {
	return typeof value === "string" && Object.hasOwn(LANGUAGES, value);
}
