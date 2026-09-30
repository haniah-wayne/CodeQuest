import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/auth/session";

export function ProfessorDashboard({ user }: { user: SessionUser }) {
	return (
		<>
			<DashboardPageHeader
				title={user.name ? `Welcome back, ${user.name}` : "Welcome back"}
				actions={
					<Button className="px-4" render={<Link href="/course_creation" />}>
						Create a class
					</Button>
				}
			/>
		</>
	);
}
