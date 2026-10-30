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
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldContent,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
									Hidden from students. Their code output is checked against this.
								</FieldDescription>

								<FieldError>{state.fieldErrors?.solution}</FieldError>
							</Field>
						</FieldGroup>

						<FieldGroup className="mx-auto w-72">
							<Field orientation="horizontal">
								<Checkbox
									id="hidden"
									name="hidden"
									value="true"
									defaultChecked={state.values?.hidden ?? false}
								/>
								<FieldContent>
									<FieldLabel htmlFor="terms-checkbox-desc">
										Hide Pin From Students?
									</FieldLabel>
									<FieldDescription>
										By clicking this checkbox, you are able to hide the pin from
										students. This means that students will not be able to see
										the pin on the map, but they will still be able to unlock
										and solve the challenge if they are within the radius of the
										pin.
									</FieldDescription>
								</FieldContent>
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

						{/* TODO: update radius description when radius field is added */}
						<div className="flex flex-col gap-1 border-t border-border/60 px-5 py-3 sm:px-6">
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
