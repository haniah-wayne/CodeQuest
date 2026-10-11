// actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function createChallenge(prevState: { error?: string }, formData: FormData) {
	const classId = formData.get("classId") as string; //values
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const solution = formData.get("solution") as string;

	const supabase = await createClient(); //await used to wait foer server

	const {
		data: { user },
	} = await supabase.auth.getUser(); //check theyre signed in
	if (!user) {
		return { error: "You must be signed in to create a challenge." };
	}

	const { data: classInfo } = await supabase //confirm ownership
		.from("classes")
		.select("instructor_id")
		.eq("class_id", classId)
		.single();
	if (!classInfo || classInfo.instructor_id !== user.id) {
		return { error: "You don't have permission to create a challenge." };
	}

	const { error } = await supabase.from("challenges").insert({
		class_id: classId,
		title,
		description,
		solution,
	});

	if (error) {
		return { error: "Something went wrong saving that challenge." };
	}

	redirect(`/instructor/class/${classId}`);
}
