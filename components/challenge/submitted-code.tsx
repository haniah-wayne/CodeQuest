"use client";

import { CodeEditor } from "@/components/challenge/code-editor";
import type { SubmissionRow } from "@/components/challenge/submission-list";
import { isLanguageId } from "@/lib/challenges/languages";

export function SubmittedCode({ submission }: { submission: SubmissionRow }) {
	const { code, language } = submission;

	if (!code) {
		return <p className="px-3 py-4 text-body-sm text-muted-foreground">No code was saved.</p>;
	}

	return (
		<div className="overflow-hidden rounded-(--panel-inner-radius) bg-card smooth-shadow-ring-sm">
			{isLanguageId(language) ? (
				<CodeEditor language={language} value={code} onChange={() => {}} readOnly />
			) : (
				<pre className="m-0 overflow-x-auto p-4 font-mono text-sm leading-6 whitespace-pre">
					{code}
				</pre>
			)}
		</div>
	);
}
