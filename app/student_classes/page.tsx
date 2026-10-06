"use client";

import { DashboardSquare01Icon, BookOpen01Icon, ChartUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Class = {
	ClassID: number;
	ProfessorID: string;
	ClassName: string;
	Description: string | null;
	ClassCode: string;
	CreatedAt: string;
	color: string | null;
};

const supabase = createClient();

export default function Studentclassespage() {
	const [classes, setClasses] = useState<Class[]>([]);
	const [classCode, setClassCode] = useState("");

	useEffect(() => {
		async function getUser() {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error) {
				console.log(error);
				return;
			}

			if (!user) {
				return;
			}

			console.log("Student ID:", user.id);

			const { data: enrollments, error: enrollmentError } = await supabase
				.from("Enrollment")
				.select("EnrollmentID,StudentID,ClassID,EnrolledAt")
				.eq("StudentID", user.id);

			if (enrollmentError) {
				console.log(enrollmentError);
				return;
			}

			const ClassIDs = enrollments?.map((enrollment) => enrollment.ClassID) ?? [];

			console.log(ClassIDs);

			const { data: classesData, error: classesError } = await supabase
				.from("Classes")
				.select("ClassID,ProfessorID,ClassName,Description,ClassCode,CreatedAt,color")
				.in("ClassID", ClassIDs);

			if (classesError) {
				console.log(classesError);
				return;
			}

			console.log(classesData);

			setClasses(classesData ?? []);
		}

		getUser();
	}, []);

	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}
			<aside className="w-64 border-r bg-card p-6">
				<h2 className="mb-8 text-xl font-bold">CodeQuest</h2>

				<nav className="flex flex-col gap-4">
					<Button variant="ghost" className="justify-start gap-3">
						<HugeiconsIcon icon={DashboardSquare01Icon} size={20} />
						Dashboard
					</Button>

					<Button variant="ghost" className="justify-start gap-3">
						<HugeiconsIcon icon={BookOpen01Icon} size={20} />
						My Classes
					</Button>

					<Button variant="ghost" className="justify-start gap-3">
						<HugeiconsIcon icon={ChartUpIcon} size={20} />
						Progress
					</Button>
				</nav>
			</aside>

			{/* Main Content */}
			<div className="flex-1 p-6">
				{/* Join class*/}
				<Card className="mb-4 px-4">
					<p className="text-2xl font-bold text-foreground">Join a class</p>
					<div className="mb-4 px-4">
						<Input
							placeholder="Enter class code"
							value={classCode}
							onChange={(e) => setClassCode(e.target.value)}
							className="max-w-sm"
						/>
					</div>
				</Card>

				{/* My classes*/}

				<Card className="mb-4 px-4">
					<p className="text-2xl font-bold text-foreground">My Classes</p>

					{classes.map((classItem) => (
						<Card
							key={classItem.ClassID}
							className="w-96 overflow-hidden rounded-md border border-border bg-card py-0 shadow-lg"
						>
							{/* Class Header */}
							<div
								className="px-4 py-4"
								style={{
									backgroundColor: classItem.color ?? "#98B6A7",
								}}
							>
								<p className="text-xl font-bold text-foreground">
									{classItem.ClassName}
								</p>
							</div>

							{/* Class Information */}
							<div className="px-4 py-4">
								<p className="text-sm text-[#333333]">{classItem.Description}</p>

								<p className="mt-3 text-sm font-medium text-[#333333]">
									Class Code: {classItem.ClassCode}
								</p>

								<Button
									className="mt-4 ml-auto block w-30 text-white transition-opacity hover:opacity-80"
									style={{ backgroundColor: classItem.color ?? "#98B6A7" }}
								>
									View Class
								</Button>
							</div>
						</Card>
					))}
				</Card>
			</div>
		</div>
	);
}
