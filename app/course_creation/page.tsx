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

type Course = {
	id: number;
	name: string;
	desc: string;
	color: string;
};

export default function CourseCreationForm() {
	const [professorName, setProfessorName] = useState("");
	const [professorId, setProfessorId] = useState<string | null>(null);

	const [courseName, setCourseName] = useState("");
	const [courseDesc, setCourseDesc] = useState("");

	const [courses, setCourses] = useState<Course[]>([]);

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);

	// Load professor and their courses when the component mounts
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
				.select("LastName")
				.eq("ID", user.id)
				.single();

			if (professorError) {
				console.error(professorError);
				setError("Could not load professor information.");
				setLoading(false);
				return;
			}

			setProfessorName(professor.LastName);

			// Get courses belonging to this professor
			const { data: courseData, error: coursesError } = await createClient()
				.from("Classes")
				.select("ClassID, ClassName, Description, color")
				.eq("professor_id", user.id)
				.order("id", { ascending: true });

			if (coursesError) {
				console.error(coursesError);
				setError("Could not load your courses.");
				setLoading(false);
				return;
			}

			// Convert Supabase's "description" field to the
			// "desc" field used by the React component
			const formattedCourses: Course[] = (courseData ?? []).map((course) => ({
				id: course.ClassID,
				name: course.ClassName,
				desc: course.Description,
				color: course.color,
			}));

			setCourses(formattedCourses);
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
			.from("courses")
			.insert({
				professor_id: professorId,
				name: courseName.trim(),
				description: courseDesc.trim(),
				color: newColor,
			})
			.select("id, name, description, color")
			.single();

		if (insertError) {
			console.error(insertError);
			setError("Could not create the course.");
			setCreating(false);
			return;
		}

		// Add the newly-created course to the UI
		const course: Course = {
			id: newCourse.id,
			name: newCourse.name,
			desc: newCourse.description,
			color: newCourse.color,
		};

		setCourses((previousCourses) => [...previousCourses, course]);

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
					To make a course, we&pos;ll need to have information on the course name and
					description.
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

			{/* Previously-created courses */}
			<div>
				<hr />

				<h2>Your Created Courses:</h2>

				{courses.length === 0 ? (
					<p>You haven&pos;t created any courses yet.</p>
				) : (
					courses.map((course) => (
						<div key={course.id}>
							<h3>Course Name: {course.name}</h3>

							<p>Course Description: {course.desc}</p>

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
