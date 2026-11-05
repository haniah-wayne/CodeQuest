"use client";

import {
	ArrowLeft01Icon,
	Cursor01Icon,
	Edit02Icon,
	Location01Icon,
	ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
//adding the necessary imports for the test cases, additional
import { Add01Icon, Delete02Icon, TestTube01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useActionState, useState, useRef } from "react";
import type * as React from "react";
import { AuthFormError } from "@/components/auth-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
	DEFAULT_UNLOCK_RADIUS,
	UNLOCK_RADII,
	UNLOCK_RADIUS_LABELS,
	type UnlockRadius,
} from "@/lib/challenges/location";
import { DEFAULT_POINTS, MAX_POINTS, MIN_POINTS } from "@/lib/challenges/schemas";
import { type CreateChallengeState, createChallenge } from "./actions";

const MapView = dynamic(() => import("@/components/mapview"), {
	ssr: false,
	loading: () => <div className="size-full animate-pulse bg-muted" />,
});

// caps how long a submission can take
const MAX_TEST_CASES = 20;

// test case sample setup
interface TestCaseDraft {
	id: number;
	input: string; // input for student code
	expectedOutput: string; // expected output
	hidden: boolean; // test case hidden from students
}

export default function CreateChallengePage() {
	const { classId } = useParams<{ classId: string }>();

	const [state, action, pending] = useActionState<CreateChallengeState, FormData>(
		createChallenge,
		{},
	);

	const [location, setLocation] = useState<{
		longitude: number;
		latitude: number;
	} | null>(null);

	const [radius, setRadius] = useState<UnlockRadius>(DEFAULT_UNLOCK_RADIUS);

	// Controlled so React's form reset after a failed submit doesn't uncheck it
	const [hidden, setHidden] = useState(false);

	const locationError = state.fieldErrors?.longitude ?? state.fieldErrors?.latitude;
	const classHref = `/dashboard/classes/${classId}`;
	const nextTestId = useRef(2);

	function newTestCase(hidden: boolean): TestCaseDraft {
		return { id: nextTestId.current++, input: "", expectedOutput: "", hidden };
	}

	// one visible test case
	const [testCases, setTestCases] = useState<TestCaseDraft[]>([
		{ id: 1, input: "", expectedOutput: "", hidden: false },
	]);

	function updateTestCase(id: number, changes: Partial<Omit<TestCaseDraft, "id">>) {
		setTestCases((current) => current.map((tc) => (tc.id === id ? { ...tc, ...changes } : tc)));
	}

	function removeTestCase(id: number) {
		setTestCases((current) => current.filter((tc) => tc.id !== id));
	}

	function addTestCase() {
		const testCase = newTestCase(true);
		setTestCases((current) => [...current, testCase]);
	}

	// exported as a json
	const serializedTestCases = JSON.stringify(testCases.map(({ id: _id, ...tc }) => tc));

	return (
		<>
			<div className="flex flex-col gap-6">
				<Link
					className="flex w-fit items-center gap-1.5 rounded-sm text-caption text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
					href={classHref}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
					Back to class
				</Link>

				<DashboardPageHeader
					title="New challenge"
					description="Write a problem, then pin it somewhere on campus. Students have to be within the radius to unlock and solve it."
				/>
			</div>

			<form action={action} className="flex flex-col gap-6">
				<input type="hidden" name="classId" value={classId} />
				<input type="hidden" name="longitude" value={location?.longitude ?? ""} />
				<input type="hidden" name="latitude" value={location?.latitude ?? ""} />
				<input type="hidden" name="radius" value={radius} />

				{/* Sends every test case with the form. The server doesn't read
				    it yet; that's the next step */}
				<input type="hidden" name="testCases" value={serializedTestCases} />

				{state.error && <AuthFormError>{state.error}</AuthFormError>}

				<div className="grid items-stretch gap-6 lg:grid-cols-2">
					<FormSection id="challenge-details" title="Details" icon={Edit02Icon}>
						<FieldGroup className="p-5 sm:p-6">
							<Field data-invalid={Boolean(state.fieldErrors?.title) || undefined}>
								<FieldLabel className="text-label" htmlFor="title">
									Name
								</FieldLabel>

								<Input
									className="h-11"
									id="title"
									name="title"
									type="text"
									placeholder="Loops & Arrays"
									defaultValue={state.values?.title}
									required
									aria-invalid={Boolean(state.fieldErrors?.title) || undefined}
								/>

								<FieldError>{state.fieldErrors?.title}</FieldError>
							</Field>

							<Field data-invalid={Boolean(state.fieldErrors?.points) || undefined}>
								<FieldLabel className="text-label" htmlFor="points">
									Points
								</FieldLabel>

								<Input
									className="h-11 w-32 tabular-nums"
									id="points"
									name="points"
									type="number"
									inputMode="numeric"
									min={MIN_POINTS}
									max={MAX_POINTS}
									step={1}
									defaultValue={state.values?.points ?? DEFAULT_POINTS}
									required
									aria-invalid={Boolean(state.fieldErrors?.points) || undefined}
									aria-describedby="points-hint"
								/>

								<FieldDescription id="points-hint">
									Awarded once to each student who solves it.
								</FieldDescription>

								<FieldError>{state.fieldErrors?.points}</FieldError>
							</Field>

							<Field
								data-invalid={Boolean(state.fieldErrors?.description) || undefined}
							>
								<FieldLabel className="text-label" htmlFor="description">
									Problem
								</FieldLabel>

								<Textarea
									className="min-h-36"
									id="description"
									name="description"
									placeholder="What does this print? for (let i = 0; i < 3; i++) console.log(i * 2)"
									defaultValue={state.values?.description}
									required
									aria-invalid={
										Boolean(state.fieldErrors?.description) || undefined
									}
									aria-describedby="description-hint"
								/>

								<FieldDescription id="description-hint">
									Students see this once they reach the location.
								</FieldDescription>

								<FieldError>{state.fieldErrors?.description}</FieldError>
							</Field>

							<Field data-invalid={Boolean(state.fieldErrors?.solution) || undefined}>
								<FieldLabel className="text-label" htmlFor="solution">
									Expected output
								</FieldLabel>

								<Textarea
									className="min-h-24 font-mono"
									id="solution"
									name="solution"
									placeholder={"0\n2\n4"}
									defaultValue={state.values?.solution}
									required
									autoComplete="off"
									spellCheck={false}
									aria-invalid={Boolean(state.fieldErrors?.solution) || undefined}
									aria-describedby="solution-hint"
								/>

								<FieldDescription
									id="solution-hint"
									className="flex items-center gap-1.5"
								>
									<HugeiconsIcon icon={ViewOffSlashIcon} className="size-3.5" />
									Hidden from students. Their code&apos;s output is checked
									against this.
								</FieldDescription>

								<FieldError>{state.fieldErrors?.solution}</FieldError>
							</Field>
						</FieldGroup>
					</FormSection>

					<FormSection
						id="challenge-location"
						title="Location"
						icon={Location01Icon}
						invalid={Boolean(locationError)}
					>
						<div className="relative min-h-80 flex-1 overflow-hidden lg:min-h-0">
							<div className="absolute inset-0">
								<MapView
									mode="professor"
									className="size-full"
									radius={radius}
									locationSelect={(longitude, latitude) =>
										setLocation({ longitude, latitude })
									}
								/>
							</div>

							<div
								aria-live="polite"
								className="pointer-events-none absolute inset-x-3 top-3 flex justify-center"
							>
								<span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-caption shadow-sm ring-1 ring-foreground/10 backdrop-blur">
									<HugeiconsIcon
										icon={location ? Location01Icon : Cursor01Icon}
										className="size-3.5 text-wsu-green"
									/>

									{location ? (
										<span className="tabular-nums">
											{location.latitude.toFixed(5)},{" "}
											{location.longitude.toFixed(5)}
										</span>
									) : (
										"Click the map to drop a pin"
									)}
								</span>
							</div>
						</div>

						<div className="flex flex-col gap-3 border-t border-border/60 px-5 py-4 sm:px-6">
							{locationError && !location && (
								<p role="alert" className="text-body-sm text-destructive">
									{locationError}
								</p>
							)}

							<FieldSet
								data-invalid={Boolean(state.fieldErrors?.radius) || undefined}
							>
								<FieldLegend variant="label" className="text-label">
									Unlock radius
								</FieldLegend>

								<FieldDescription id="radius-hint">
									Students must be within {radius} m of the pin to unlock it.
								</FieldDescription>

								<RadioGroup
									className="sm:grid-cols-3"
									value={String(radius)}
									onValueChange={(value) =>
										setRadius(Number(value) as UnlockRadius)
									}
									aria-describedby="radius-hint"
								>
									{UNLOCK_RADII.map((r) => (
										<FieldLabel
											className="w-full gap-2.5 rounded-2xl border border-input bg-input/20 px-3 py-2.5 transition-colors has-data-checked:border-primary has-data-checked:bg-primary/5"
											key={r}
										>
											<Radio value={String(r)} className="mt-0.5" />

											<span className="flex flex-col gap-0.5">
												<span className="text-label tabular-nums">
													{r} m
												</span>

												<span className="text-caption font-normal text-muted-foreground">
													{UNLOCK_RADIUS_LABELS[r]}
												</span>
											</span>
										</FieldLabel>
									))}
								</RadioGroup>

								<FieldError>{state.fieldErrors?.radius}</FieldError>
							</FieldSet>

							<Field orientation="horizontal">
								<Checkbox
									id="hidden"
									name="hidden"
									checked={hidden}
									onCheckedChange={(checked) => setHidden(checked)}
									aria-describedby="hidden-hint"
								/>

								<FieldContent>
									<FieldLabel className="text-label" htmlFor="hidden">
										Hide pin on the map
									</FieldLabel>

									<FieldDescription id="hidden-hint">
										If this is checked, students won{"'"}t see the pin until
										they{"'"}re the unlock radius.
									</FieldDescription>
								</FieldContent>
							</Field>
						</div>
					</FormSection>
				</div>

				{/* Full width under the grid: test cases need room, and code-like
				    text would be cramped beside the map */}
				<FormSection id="challenge-tests" title="Test cases" icon={TestTube01Icon}>
					<div className="flex flex-col gap-4 p-5 sm:p-6">
						<p className="text-body-sm text-muted-foreground">
							Each test gives the input to the student&apos;s program (as stdin) and
							checks what it prints. Hidden tests are never shown to students.
						</p>

						<ol className="flex flex-col gap-4">
							{testCases.map((tc, index) => {
								// Unique IDs link each label to own textarea,
								const inputId = `test-${tc.id}-input`;
								const outputId = `test-${tc.id}-output`;
								const hiddenId = `test-${tc.id}-hidden`;

								return (
									<li
										key={tc.id}
										className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4"
									>
										<div className="flex items-center justify-between gap-3">
											<h3 className="text-label">Test {index + 1}</h3>

											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												aria-label={`Remove test ${index + 1}`}
												disabled={testCases.length === 2}
												onClick={() => removeTestCase(tc.id)}
											>
												<HugeiconsIcon icon={Delete02Icon} />
											</Button>
										</div>

										<div className="grid gap-3 sm:grid-cols-2">
											<Field>
												<FieldLabel htmlFor={inputId}>Input</FieldLabel>

												<Textarea
													className="min-h-24 font-mono"
													id={inputId}
													value={tc.input}
													onChange={(e) =>
														updateTestCase(tc.id, {
															input: e.target.value,
														})
													}
													placeholder={"3\n1 2 3"}
												/>
											</Field>

											<Field>
												<FieldLabel htmlFor={outputId}>
													Expected output
												</FieldLabel>

												<Textarea
													className="min-h-24 font-mono"
													id={outputId}
													value={tc.expectedOutput}
													onChange={(e) =>
														updateTestCase(tc.id, {
															expectedOutput: e.target.value,
														})
													}
													placeholder="6"
													required
												/>
											</Field>
										</div>

										<Field orientation="horizontal">
											<Checkbox
												id={hiddenId}
												checked={tc.hidden}
												// passing new checked value
												onCheckedChange={(checked) =>
													updateTestCase(tc.id, { hidden: checked })
												}
											/>

											<FieldLabel htmlFor={hiddenId}>
												Hidden from students
											</FieldLabel>
										</Field>
									</li>
								);
							})}
						</ol>

						<Button
							type="button"
							variant="outline"
							className="w-fit"
							onClick={addTestCase}
							// Stop at the limit
							disabled={testCases.length >= MAX_TEST_CASES}
						>
							<HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
							Add test case
						</Button>
					</div>
				</FormSection>

				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Link
						className={buttonVariants({ variant: "ghost", size: "lg" })}
						href={classHref}
					>
						Cancel
					</Link>

					<Button type="submit" size="lg" className="px-6" disabled={pending}>
						{pending ? "Creating challenge…" : "Create challenge"}
					</Button>
				</div>
			</form>
		</>
	);
}

function FormSection({
	id,
	title,
	icon,
	invalid,
	children,
}: {
	id: string;
	title: string;
	icon: IconSvgElement;
	invalid?: boolean;
	children: React.ReactNode;
}) {
	return (
		<section
			className="flex min-w-0 flex-col rounded-3xl border border-accent bg-white data-[invalid=true]:border-destructive/50"
			data-invalid={invalid || undefined}
			aria-labelledby={id}
		>
			<header className="flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-wsu-green">
					<HugeiconsIcon icon={icon} className="size-4.5" />
				</span>

				<h2 className="text-label" id={id}>
					{title}
				</h2>
			</header>

			{children}
		</section>
	);
}
