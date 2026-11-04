"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";
//this component will be used and called for all ai stuff in the project
import React, { useState } from "react";
//initialized the API using key from .env
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
if (!apiKey) {
	throw new Error("API key is not defined");
}
const genAI = new GoogleGenerativeAI(apiKey);
export default function AI_Chat() {
	//setup usestates
	const [prompt, setPrompt] = useState("");
	const [response, setResponse] = useState("");
	const [loading, setLoading] = useState(false);
	//function that sends the prompt to gemini and then processes result
	const sendPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
		setLoading(true); //sets the loading state to true while waiting for response
		try {
			//attempts to send prompt and handle response. Actual functionality of the component.
			e.preventDefault(); //prevents defaulting
			if (!prompt.trim()) return; //prevents sending empty prompts
			const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" }); //loads the model we want. can be changed if need be,
			const result = await model.generateContent(prompt); //gets the result from the prompt
			const text = result.response.text(); //extracts the response from the prompt result
			setResponse(text); //sets the response state with the extracted text
		} catch (er) {
			console.error(er); //logs the error to the console
			setResponse("An error occurred while attempting to process your prompt."); //inform user that prompt failed
		} finally {
			setLoading(false); //sets the loading state to false regardless, that way user sees prompt or sees error.
		}
	};
	//this part actually displays the component.
	return (
		<div>
			<h2>Prompt Area</h2>
			<form onSubmit={sendPrompt}>
				<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
				<button type="submit" disabled={loading}>
					{loading ? "Loading..." : "Submit"}
				</button>
			</form>
			<h2>Response Area</h2>
			<p>{response}</p>
		</div>
	);
}
