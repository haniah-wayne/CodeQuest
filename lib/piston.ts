import { LANGUAGES, type LanguageId } from "@/lib/challenges/languages";

interface PistonStage {
	stdout: string;
	stderr: string;
	output: string;
	code: number | null;
	signal: string | null;
	status: string | null;
}

interface PistonResponse {
	run: PistonStage;
	compile?: PistonStage;
}

export interface ExecutionResult {
	output: string;
	stdout: string;
	failed: boolean;
	problem: string | null;
}

export async function execute(
	language: LanguageId,
	code: string,
	stdin = "",
): Promise<ExecutionResult> {
	const { piston } = LANGUAGES[language];

	const response = await fetch("https://piston.olivermrose.com/api/v2/execute", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			language: piston.language,
			version: piston.version,
			files: [
				{
					name: language === "java" ? "Main" : "main",
					content: code,
				},
			],
			stdin,
		}),
		cache: "no-store",
		signal: AbortSignal.timeout(30_000),
	});

	if (!response.ok) {
		throw new Error(`Piston responded with ${response.status}: ${await response.text()}`);
	}

	const data: PistonResponse = await response.json();

	const failedCompile = data.compile && data.compile.code !== 0 ? data.compile : null;

	if (failedCompile) {
		return {
			// gcc tries to chmod the binary even when compiling fails which
			// adds confusion
			output: failedCompile.output.replace(/^chmod: cannot access 'a\.out'.*\n?/m, ""),
			stdout: "",
			failed: true,
			problem: describeProblem(failedCompile, true),
		};
	}

	return {
		output: data.run.output,
		stdout: data.run.stdout,
		failed: false,
		problem: describeProblem(data.run, false),
	};
}

function describeProblem(stage: PistonStage, compiling: boolean): string | null {
	// TO = timeout
	if (stage.status === "TO") {
		return compiling ? "Compilation timed out" : "Time limit exceeded";
	}

	// OL = stdout limit exceeded, EL = stderr limit exceeded
	if (stage.status === "OL" || stage.status === "EL") {
		return "Output limit exceeded";
	}

	if (stage.signal) {
		return `Stopped by ${stage.signal}`;
	}

	if (stage.code !== 0) {
		return compiling ? "Compilation failed" : `Exited with code ${stage.code}`;
	}

	return null;
}
