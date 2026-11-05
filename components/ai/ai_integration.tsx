"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";
//this component will be used and called for all ai stuff in the project
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/server";
//initialized the API using key from .env
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
if (!apiKey) {
	throw new Error("API key is not defined");
}
const genAI = new GoogleGenerativeAI(apiKey);
const supabase = await createClient();
export function AI_Problem_Creator() {
	//this function injects "create me a problem" into the prompt and sends it to gemini for processing
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
			setPrompt((prev) => "Create me a coding problem with these features: " + prev); //injects "create me a problem" into the prompt
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
			<h2>AI Problem Creator</h2>
			<p>Ask generative AI to create a problem for you!</p>
			<form onSubmit={sendPrompt}>
				<textarea
					value={prompt}
					placeholder="Describe your coding problem here..."
					onChange={(e) => setPrompt(e.target.value)}
				/>
				<button type="submit" disabled={loading}>
					{loading ? "Loading..." : "Submit"}
				</button>
			</form>
			<h2>Response Area</h2>
			<p>{response}</p>
		</div>
	);
}
export function AI_Grader() {
	//this component will pull student submitted code, compare it to expected solution/test cases, and then recommend a grade.
	//put the function that will pull database information here, and store it in json format.
	// Make sure to include the expected solution and test cases in the json format, and uncomment the below lines
	// const jsonString = JSON.stringify(pulledData)
	const jsonString = ""; //remove this line, it's placeholder.
	const prompt =
		"Recommend a grade for the following student code based on the expected solution and test cases. The data will be provided in JSON format, but please respond in plain english. \n " +
		jsonString;
	const [response, setResponse] = useState("");
	const [loading, setLoading] = useState(false);
	//function that sends the prompt to gemini and then processes result
	const sendPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
		setLoading(true); //sets the loading state to true while waiting for response
		try {
			//attempts to send prompt and handle response. Actual functionality of the component.
			e.preventDefault(); //prevents defaulting
			const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" }); //loads the model we want. can be changed if need be,
			const result = await model.generateContent(prompt); //gets the result from the prompt
			const text = result.response.text(); //extracts the response from the prompt result
			setResponse(text); //sets the response state with the extracted text
		} catch (er) {
			console.error(er); //logs the error to the console
			setResponse("An error occurred while attempting to process your prompt."); //inform user that prompt failed
		} finally {
			setLoading(false); //sets the loading state to false regardless,
		}
	};
	//actually displays the component.
	return (
		<div>
			<h2>AI Grader</h2>
			<p>Press the button to let AI recommend a grade for the student code.</p>
			<form onSubmit={sendPrompt}>
				<button type="submit" disabled={loading}>
					{loading ? "Loading..." : "Submit"}
				</button>
			</form>
			<h2>Recommended Grade:</h2>
			<p>{response}</p>
		</div>
	);
}
