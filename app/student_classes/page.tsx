"use client";

import { useEffect, useState  } from "react";
import { supabase } from "@/lib/supabase";

type Class = {
  ClassID: number;
  ProfessorID: string;
  ClassName: string;
  Description: string | null;
  ClassCode: string;
  CreatedAt: string;
};

export default function Studentclassespage() {
  const [classes, setClasses] = useState<any[]>([]);

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
        .select("EnrollmentID,StudentID, ClassID, EnrolledAt")
        .eq("StudentID", user.id);

      if (enrollmentError) {
        console.log(enrollmentError);
        return;
      }

      const ClassIDs = enrollments?.map((enrollment) => enrollment.ClassID) ?? [];

      console.log(ClassIDs);

        const { data: classesData, error: classesError } = await supabase
        .from("Classes")
        .select("ClassID,ProfessorID,ClassName,Description,ClassCode,CreatedAt")
        .in("ClassID",ClassIDs)

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
  <div>
    <p>My classes</p>

    {classes.map((classItem) => (
      <div key={classItem.ClassID}>
        <p>{classItem.ClassName}</p>
        <p>{classItem.Description}</p>
        <p>{classItem.ClassCode}</p>
      </div>
    ))}
  </div>
);
}