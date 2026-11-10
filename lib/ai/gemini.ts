import { type GenerationConfig, GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | undefined;

export function getGeminiModel(options: {
	systemInstruction: string;
	generationConfig?: GenerationConfig;
}) {
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is not set");
	}

	client ??= new GoogleGenerativeAI(apiKey);

	return client.getGenerativeModel({
		model: "gemini-3.8-flash",
		...options,
	});
}
