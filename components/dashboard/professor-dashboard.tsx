import type * as React from "react";
import { CreateClassDialog } from "@/components/dashboard/create-class-dialog";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import type { SessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/supabase/database.types";

type ClassSummary = Pick<
	Tables<"Classes">,
	"ClassID" | "ClassName" | "Description" | "color" | "ClassCode"
>;

export async function ProfessorDashboard({ user }: { user: SessionUser }) {
	const supabase = await createClient();

	const { data: classes, error } = await supabase
		.from("Classes")
		.select("ClassID, ClassName, Description, color, ClassCode")
		.eq("ProfessorID", user.id)
		.order("CreatedAt");

	if (error) console.error(error);

	return (
		<>
			<DashboardPageHeader
				title={user.name ? `Welcome back, ${user.name}` : "Welcome back"}
				actions={<CreateClassDialog />}
			/>

			<section aria-labelledby="your-classes" className="flex flex-col gap-4">
				<hgroup className="flex flex-col gap-1">
					<h2 className="text-heading" id="your-classes">
						Your classes
					</h2>

					<p className="text-body-sm text-muted-foreground">
						Share a class’s join code with your students.
					</p>
				</hgroup>

				{error ? (
					<EmptyState>Couldn’t load your classes. Refresh to try again.</EmptyState>
				) : classes.length === 0 ? (
					<EmptyState>
						You haven’t created any classes yet. Your first one will show up here.
					</EmptyState>
				) : (
					<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{classes.map((c) => (
							<ClassCard key={c.ClassID} class={c} />
						))}
					</ul>
				)}
			</section>
		</>
	);
}

function ClassCard({ class: c }: { class: ClassSummary }) {
	return (
		<li className="flex flex-col gap-2 rounded-3xl border border-accent bg-white p-6">
			<span
				aria-hidden
				className="mb-2 h-1.5 w-10 rounded-full bg-wsu-green"
				style={c.color ? { backgroundColor: c.color } : undefined}
			/>

			<h3 className="text-heading">{c.ClassName}</h3>

			{c.Description && (
				<p className="text-body-sm text-pretty text-muted-foreground">{c.Description}</p>
			)}

			<p className="mt-auto flex items-center justify-between gap-3 border-t border-muted pt-4">
				<span className="text-caption text-muted-foreground">Join code</span>

				<code className="font-mono text-label tracking-wider">{c.ClassCode}</code>
			</p>
		</li>
	);
}

function EmptyState({ children }: { children: React.ReactNode }) {
	return (
		<p className="flex min-h-48 items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-8 text-center text-body-sm text-muted-foreground">
			{children}
		</p>
	);
}
