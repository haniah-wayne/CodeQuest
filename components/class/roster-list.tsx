import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import { StudentAvatar } from "@/components/class/student-avatar";

interface RosterStudent {
	id: string;
	name: string;
	email: string | null;
}

export function RosterList({
	students,
	error,
	showEmails,
}: {
	students: RosterStudent[];
	error: unknown;
	showEmails: boolean;
}) {
	return (
		<ClassSection id="roster" title="Roster" icon={UserGroupIcon} count={students.length}>
			{error ? (
				<SectionError what="the roster" />
			) : students.length === 0 ? (
				<SectionEmpty
					icon={UserGroupIcon}
					title="No students yet"
					description="Share the join code with your students so they can join."
				/>
			) : (
				<ul className="flex flex-col gap-0.5">
					{students.map((student) => (
						<li
							key={student.id}
							className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
						>
							<StudentAvatar name={student.name} />

							<span className="flex min-w-0 flex-col">
								<span className="truncate text-label">{student.name}</span>

								{/* Classmates' emails stay private to the professor */}
								{showEmails && student.email && (
									<span className="truncate text-caption text-muted-foreground">
										{student.email}
									</span>
								)}
							</span>
						</li>
					))}
				</ul>
			)}
		</ClassSection>
	);
}
