"use client";

import {
	ArrowLeft01Icon,
	Cursor01Icon,
	Edit02Icon,
	Location01Icon,
	ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useActionState, useState } from "react";
import type * as React from "react";
import { AuthFormError } from "@/components/auth-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Panel, PanelHeader, PanelIcon, PanelSurface } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_POINTS, MAX_POINTS, MIN_POINTS } from "@/lib/challenges/schemas";
import { type CreateChallengeState, createChallenge } from "./actions";

const MapView = dynamic(() => import("@/components/mapview"), {
	ssr: false,
	loading: () => <div className="size-full animate-pulse bg-muted" />,
});

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

	const locationError = state.fieldErrors?.longitude ?? state.fieldErrors?.latitude;
	const classHref = `/dashboard/classes/${classId}`;

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

				{state.error && <AuthFormError>{state.error}</AuthFormError>}

				<div className="grid items-stretch gap-6 lg:grid-cols-2">
					<FormSection id="challenge-details" title="Details" icon={Edit02Icon}>
						<PanelSurface className="flex-1">
							<FieldGroup className="p-5 sm:p-6">
								<Field
									data-invalid={Boolean(state.fieldErrors?.title) || undefined}
								>
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
										aria-invalid={
											Boolean(state.fieldErrors?.title) || undefined
										}
									/>

									<FieldError>{state.fieldErrors?.title}</FieldError>
								</Field>

								<Field
									data-invalid={Boolean(state.fieldErrors?.points) || undefined}
								>
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
										aria-invalid={
											Boolean(state.fieldErrors?.points) || undefined
										}
										aria-describedby="points-hint"
									/>

									<FieldDescription id="points-hint">
										Awarded once to each student who solves it.
									</FieldDescription>

									<FieldError>{state.fieldErrors?.points}</FieldError>
								</Field>

								<Field
									data-invalid={
										Boolean(state.fieldErrors?.description) || undefined
									}
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

								<Field
									data-invalid={Boolean(state.fieldErrors?.solution) || undefined}
								>
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
										aria-invalid={
											Boolean(state.fieldErrors?.solution) || undefined
										}
										aria-describedby="solution-hint"
									/>

									<FieldDescription
										id="solution-hint"
										className="flex items-center gap-1.5"
									>
										<HugeiconsIcon
											icon={ViewOffSlashIcon}
											className="size-3.5"
										/>
										Hidden from students. Their code&apos;s output is checked
										against this.
									</FieldDescription>

									<FieldError>{state.fieldErrors?.solution}</FieldError>
								</Field>
							</FieldGroup>
						</PanelSurface>
					</FormSection>

					<FormSection
						id="challenge-location"
						title="Location"
						icon={Location01Icon}
						invalid={Boolean(locationError)}
					>
						<PanelSurface className="relative min-h-80 flex-1 overflow-hidden lg:min-h-0">
							<div className="absolute inset-0">
								<MapView
									mode="professor"
									className="size-full"
									locationSelect={(longitude, latitude) =>
										setLocation({ longitude, latitude })
									}
								/>
							</div>

							<div
								aria-live="polite"
								className="pointer-events-none absolute inset-x-3 top-3 flex justify-center"
							>
								<span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-caption smooth-shadow-ring-md backdrop-blur">
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
						</PanelSurface>

						{/* TODO: update radius description when radius field is added */}
						<div className="flex flex-col gap-1 px-3 py-1.5">
							<p className="text-body-sm text-muted-foreground">
								Students must be within 100 m of the pin to unlock it.
							</p>

							{locationError && !location && (
								<p role="alert" className="text-body-sm text-destructive">
									{locationError}
								</p>
							)}
						</div>
					</FormSection>
				</div>

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
		<Panel
			className="data-[invalid=true]:smooth-ring-destructive/60"
			data-invalid={invalid || undefined}
			aria-labelledby={id}
		>
			<PanelHeader>
				<PanelIcon icon={icon} />

				<h2 className="text-label" id={id}>
					{title}
				</h2>
			</PanelHeader>

			{children}
		</Panel>
	);
}
