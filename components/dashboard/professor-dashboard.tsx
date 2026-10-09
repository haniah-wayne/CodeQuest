import { ClassGrid } from "@/components/dashboard/class-grid";
import { CreateClassDialog } from "@/components/dashboard/create-class-dialog";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import type { SessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

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

			<ClassGrid
				classes={classes}
				error={error}
				empty={{
					title: "No classes yet",
					description:
						"Create your first class, then share its join code with your students.",
					action: <CreateClassDialog />,
				}}
			/>
		</>
	);
}
