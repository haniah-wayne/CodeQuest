import { type ContentListUnion, GoogleGenAI, type Schema, ThinkingLevel } from "@google/genai";

let client: GoogleGenAI | undefined;

function getClient() {
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is not set");
	}

	client ??= new GoogleGenAI({ apiKey });

	return client;
}

export async function generateJson(options: {
	systemInstruction: string;
	schema: Schema;
	contents: ContentListUnion;
	thinkingLevel?: ThinkingLevel;
}): Promise<string> {
	const client = getClient();

	const { text, candidates } = await client.models.generateContent({
		model: "gemini-3.8-flash",
		contents: options.contents,
		config: {
			systemInstruction: options.systemInstruction,
			responseMimeType: "application/json",
			responseSchema: options.schema,
			...(options.thinkingLevel && {
				thinkingConfig: { thinkingLevel: options.thinkingLevel },
			}),
		},
	});

	if (!text) {
		throw new Error(
			`Gemini returned no text (finish reason: ${candidates?.[0]?.finishReason ?? "unknown"})`,
		);
	}

	return text;
}
