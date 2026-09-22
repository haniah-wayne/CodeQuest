
//unsure if i need these, modeling it after the other page
"use client"
import { useState } from "react";

export default function CourseCreationForm() {
    const [courseName, setCourseName] = useState("");
    const [courseDesc, setCourseDes] = useState("");
    const [error, setError] = useState("");
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!courseName || !courseDesc){
            setError("All fields are required.");
            return;
        }
        setCourses((previousCourses) => [
            ...previousCourses,
            {
                id: previousCourses.length + 1,
                name: courseName,
                desc: courseDesc,
            },
        ]);
    }
        console.log("Creating course with:", {courseName, courseDesc});
    const [courses, setCourses] = useState([{
        id: 1,
        name: courseName,
        desc: courseDesc
    }])
    return (
        <div>
            <div>
                <h2> Fill out the details below to make a new course!</h2>
                <p> To make a course, we'll need to have information on </p>
            </div>
            {/* form for filling out course material */}
            <div>
                <form onSubmit={handleSubmit}>
                    <label> Course Name</label>
                    <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Course Name" />
                    <label> Course Description</label>
                    <input type="text" value={courseDesc} onChange={(e) => setCourseDes(e.target.value)} placeholder="Course Description" />
                    <button type="submit" color="white">Create Course!</button>
                </form>
            </div>
            {/* area where courses will be displayed */}
            <div>
                <hr />
                <h2>Your Created Courses:</h2>
                {courses.map((course, i)=>(
                <div key={course.id}>
                    <h3>Course Name: {course.name}</h3>
                    <p>Course Description: {course.desc}</p>
                    <div style={{ width: '200px', height: '200px', backgroundColor: `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}` }}></div>
                </div>
                ))}
            </div>
        </div>
            /* When the button is pressed, it should either create a course and a new "box" for it like how would on canvas,
            then link it to the professor's account, or give an error that they didn't fill out the form correctly. */
        );
}