"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function generateRandomColor() {
	const c =
		"#" +
		Math.floor(Math.random() * 0xffffff)
			.toString(16)
			.padStart(6, "0");

	return c;
}
function generateClassCode() {
	//generates a random class code.
	const validChars = "abcdef1234567890";
	let classCode = "";
	for (let i = 0; i < 10; i++) {
		classCode += validChars.charAt(Math.floor(Math.random() * validChars.length));
	}
	return classCode;
}

type Course = {
	ClassID: number;
	ClassName: string;
	Description: string;
	color: string;
};

export default function CourseCreationForm() {
	const [professorName, setProfessorName] = useState("");
	const [professorId, setProfessorId] = useState<string | null>(null);

	const [courseName, setCourseName] = useState("");
	const [courseDesc, setCourseDesc] = useState("");

	const [Classes, setClasses] = useState<Course[]>([]);

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);

	// Load professor and their Classes when the component mounts
	useEffect(() => {
		async function loadProfessorData() {
			setLoading(true);
			setError("");

			// Get currently logged-in user
			const {
				data: { user },
				error: userError,
			} = await createClient().auth.getUser();

			if (userError || !user) {
				setError("Could not find the logged-in professor.");
				setLoading(false);
				return;
			}

			setProfessorId(user.id);

			// Get professor information
			const { data: professor, error: professorError } = await createClient()
				.from("Profile")
				.select("FirstName")
				.eq("ID", user.id)
				.single();

			if (professorError) {
				console.error(professorError);
				setError("Could not load professor information.");
				setLoading(false);
				return;
			}

			setProfessorName(professor.FirstName);

			// Get Classes belonging to this professor
			const { data: courseData, error: ClassesError } = await createClient()
				.from("Classes")
				.select("ClassID, ClassName, Description, color")
				.eq("professor_id", user.id)
				.order("id", { ascending: true });

			if (ClassesError) {
				console.error(ClassesError);
				setError("Could not load your Classes.");
				setLoading(false);
				return;
			}

			// Convert Supabase's "Description" field to the
			// "desc" field used by the React component
			const formattedClasses: Course[] = (courseData ?? []).map((course) => ({
				ClassID: course.ClassID,
				ClassName: course.ClassName,
				Description: course.Description,
				color: course.color,
			}));

			setClasses(formattedClasses);
			setLoading(false);
		}

		loadProfessorData();
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setError("");

		if (!courseName.trim() || !courseDesc.trim()) {
			setError("All fields are required.");
			return;
		}

		if (!professorId) {
			setError("Could not identify the professor.");
			return;
		}

		setCreating(true);

		const newColor = generateRandomColor();

		// Insert the course into Supabase
		const { data: newCourse, error: insertError } = await createClient()
			.from("Classes")
			.insert({
				ProfessorID: professorId,
				ClassName: courseName.trim(),
				Description: courseDesc.trim(),
				color: newColor,
				ClassCode: generateClassCode(),
			})
			.select("ClassID, ClassName, Description, color")
			.single();

		if (insertError) {
			console.error(insertError);
			setError("Could not create the course.");
			setCreating(false);
			return;
		}

		// Add the newly-created course to the UI
		const course: Course = {
			ClassID: newCourse.ClassID,
			ClassName: newCourse.ClassName,
			Description: newCourse.Description,
			color: newCourse.color,
		};

		setClasses((previousClasses) => [...previousClasses, course]);

		// Clear form
		setCourseName("");
		setCourseDesc("");
		setCreating(false);
	};

	if (loading) {
		return <p>Loading...</p>;
	}

	return (
		<div>
			<div>
				<h1>Welcome, {professorName}!</h1>

				<h2>Fill out the details below to make a new course!</h2>

				<p>
					To make a course, we{"'"}ll need to have information on the course name and
					Description.
				</p>
			</div>

			{/* Error message */}
			{error && <p style={{ color: "red" }}>{error}</p>}

			{/* Course creation form */}
			<div>
				<form onSubmit={handleSubmit}>
					<label htmlFor="courseName">Course Name</label>

					<input
						id="courseName"
						type="text"
						value={courseName}
						onChange={(e) => setCourseName(e.target.value)}
						placeholder="Course Name"
					/>

					<label htmlFor="courseDescription">Course Description</label>

					<input
						id="courseDescription"
						type="text"
						value={courseDesc}
						onChange={(e) => setCourseDesc(e.target.value)}
						placeholder="Course Description"
					/>

					<button type="submit" disabled={creating}>
						{creating ? "Creating..." : "Create Course!"}
					</button>
				</form>
			</div>

			{/* Previously-created Classes */}
			<div>
				<hr />

				<h2>Your Created Classes:</h2>

				{Classes.length === 0 ? (
					<p>You haven{"'"}t created any Classes yet.</p>
				) : (
					Classes.map((course) => (
						<div key={course.ClassID}>
							<h3>Course Name: {course.ClassName}</h3>

							<p>Course Description: {course.Description}</p>

							<div
								style={{
									width: "200px",
									height: "200px",
									backgroundColor: course.color,
								}}
							/>
						</div>
					))
				)}
			</div>
		</div>
	);
}
