"use client";

import { closeBrackets, closeBracketsKeymap, insertBracket } from "@codemirror/autocomplete";
import {
	defaultKeymap,
	history,
	historyKeymap,
	indentLess,
	indentMore,
} from "@codemirror/commands";
import { bracketMatching, indentOnInput, indentUnit } from "@codemirror/language";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
	EditorView,
	drawSelection,
	highlightActiveLine,
	highlightActiveLineGutter,
	keymap,
	lineNumbers,
} from "@codemirror/view";
import { githubLight } from "@fsegurai/codemirror-theme-github-light";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { LanguageId } from "@/lib/challenges/languages";

const INDENT = "    ";

// Lazy load the languages
const LANGUAGE_SUPPORT = {
	python: () => import("@codemirror/lang-python").then((m) => m.python()),
	java: () => import("@codemirror/lang-java").then((m) => m.java()),
	cpp: () => import("@codemirror/lang-cpp").then((m) => m.cpp()),
	javascript: () => import("@codemirror/lang-javascript").then((m) => m.javascript()),
} satisfies Record<LanguageId, () => Promise<Extension>>;

const SYMBOL_KEYS = ["(", ")", "{", "}", "[", "]", "<", ">", ";", ":", "=", '"', "'", "_"];

const layout = EditorView.theme({
	"&": { fontSize: "inherit" },
	"&.cm-focused": { outline: "none" },
	".cm-scroller": { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" },
	".cm-content": { minHeight: "18rem", padding: "1rem 0" },
	".cm-line": { padding: "0 1rem 0 0.5rem" },
	".cm-gutter": { minHeight: "18rem" },
});

// Keeps the text selectable
function readOnlyExtension(readOnly: boolean) {
	return [EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)];
}

function insertIndent(view: EditorView) {
	if (view.state.selection.ranges.some((r) => !r.empty)) return indentMore(view);

	view.dispatch({
		...view.state.replaceSelection(view.state.facet(indentUnit)),
		scrollIntoView: true,
		userEvent: "input",
	});

	return true;
}

export function CodeEditor({
	language,
	value,
	onChange,
	readOnly = false,
}: {
	language: LanguageId;
	value: string;
	onChange: (value: string) => void;
	readOnly?: boolean;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const languageSlot = useRef(new Compartment());
	const readOnlySlot = useRef(new Compartment());

	const statesRef = useRef(new Map<LanguageId, EditorState>());
	const [placeholder] = useState(value);

	const emitChange = useEffectEvent((doc: string) => onChange(doc));

	const createState = useEffectEvent(() =>
		EditorState.create({
			doc: value,
			extensions: [
				lineNumbers(),
				highlightActiveLineGutter(),
				highlightActiveLine(),
				history(),
				drawSelection(),
				indentOnInput(),
				bracketMatching(),
				closeBrackets(),
				indentUnit.of(INDENT),
				EditorState.tabSize.of(INDENT.length),
				EditorView.lineWrapping,
				layout,
				githubLight,
				languageSlot.current.of([]),
				readOnlySlot.current.of(readOnlyExtension(readOnly)),
				keymap.of([
					...closeBracketsKeymap,
					{ key: "Tab", run: insertIndent, shift: indentLess },
					...defaultKeymap,
					...historyKeymap,
				]),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						emitChange(update.state.doc.toString());
					}
				}),
			],
		}),
	);

	function insertSymbol(key: string) {
		const view = viewRef.current;

		if (!view) return;

		if (key === "Tab") {
			insertIndent(view);
		} else {
			// Goes through closeBrackets so tapping ( adds the ) as well
			view.dispatch(
				insertBracket(view.state, key) ?? {
					...view.state.replaceSelection(key),
					scrollIntoView: true,
					userEvent: "input.type",
				},
			);
		}

		view.focus();
	}

	useEffect(() => {
		if (!containerRef.current) return;

		const view = new EditorView({ parent: containerRef.current });

		viewRef.current = view;

		return () => {
			viewRef.current = null;
			view.destroy();
		};
	}, []);

	useEffect(() => {
		const view = viewRef.current;

		if (!view) return;

		const states = statesRef.current;

		view.setState(states.get(language) ?? createState());

		let cancelled = false;

		LANGUAGE_SUPPORT[language]()
			.then((support) => {
				if (!cancelled) {
					view.dispatch({ effects: languageSlot.current.reconfigure(support) });
				}
			})
			.catch(console.error);

		return () => {
			cancelled = true;
			states.set(language, view.state);
		};
	}, [language]);

	// Reconfigure in place so locking keeps the doc and undo history
	useEffect(() => {
		viewRef.current?.dispatch({
			effects: readOnlySlot.current.reconfigure(readOnlyExtension(readOnly)),
		});
	}, [readOnly]);

	return (
		<div className="flex flex-col">
			{!readOnly && (
				<div
					className="sticky top-20 z-10 hidden gap-1 overflow-x-auto border-b border-border/60 bg-white/90 px-3 py-2 backdrop-blur-sm sm:top-24 pointer-coarse:flex"
					role="toolbar"
					aria-label="Insert symbol"
				>
					{["Tab", ...SYMBOL_KEYS].map((key) => (
						<button
							key={key}
							type="button"
							tabIndex={-1}
							className="h-9 min-w-9 shrink-0 rounded-lg border border-border bg-muted/50 px-2 font-mono text-sm active:bg-muted"
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => insertSymbol(key)}
						>
							{key === "Tab" ? "⇥" : key}
							{key === "Tab" && <span className="sr-only">Tab</span>}
						</button>
					))}
				</div>
			)}

			<div
				ref={containerRef}
				className="min-h-72 min-w-0 bg-background text-base sm:text-sm [&:has(.cm-editor)>pre]:hidden"
			>
				<pre className="m-0 py-4 pr-4 pl-12 font-mono leading-6 wrap-break-word whitespace-pre-wrap text-foreground">
					{placeholder}
				</pre>
			</div>
		</div>
	);
}
