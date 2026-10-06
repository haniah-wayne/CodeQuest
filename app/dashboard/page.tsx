import { ProfessorDashboard } from "@/components/dashboard/professor-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { requireSessionUser } from "@/lib/auth/session";

export default async function DashboardPage() {
	const user = await requireSessionUser();

	switch (user.role) {
		case "student":
			return <StudentDashboard user={user} />;
		case "professor":
			return <ProfessorDashboard user={user} />;
		default:
			return null;
	}
}
