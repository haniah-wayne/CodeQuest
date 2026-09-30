import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import type { SessionUser } from "@/lib/auth/session";

export function StudentDashboard({ user }: { user: SessionUser }) {
	return (
		<>
			<DashboardPageHeader
				title={user.name ? `Welcome back, ${user.name}` : "Welcome back"}
			/>
		</>
	);
}
