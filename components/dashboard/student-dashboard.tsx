import { ClassGrid } from "@/components/dashboard/class-grid";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { JoinClassDialog } from "@/components/dashboard/join-class-dialog";
import type { SessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function StudentDashboard({ user }: { user: SessionUser }) {
	const supabase = await createClient();

	const { data: enrollments, error } = await supabase
		.from("Enrollment")
		.select("Classes!inner(ClassID, ClassName, Description, color)")
		.eq("StudentID", user.id)
		.order("EnrolledAt");

	if (error) console.error(error);

	return (
		<>
			<DashboardPageHeader
				title={user.name ? `Welcome back, ${user.name}` : "Welcome back"}
				actions={<JoinClassDialog />}
			/>

			<ClassGrid
				classes={enrollments?.map((e) => e.Classes) ?? null}
				error={error}
				empty={{
					title: "No classes yet",
					description: "Join a class with the code your professor shared.",
					action: <JoinClassDialog />,
				}}
			/>
		</>
	);
}
