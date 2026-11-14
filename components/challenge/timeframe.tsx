"use client";

import { useState } from "react";

// Professor
export function TimeframeInput() {
	const [dueDate, setDueDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");

	return (
		<div className="flex flex-col gap-4">
			<div>
				<label htmlFor="dueDate">Due Date</label>
				<input
					id="dueDate"
					name="dueDate"
					type="datetime-local"
					value={dueDate}
					onChange={(e) => setDueDate(e.target.value)}
				/>
			</div>

			<div>
				<label htmlFor="startTime">Submission Start</label>
				<input
					id="startTime"
					name="startTime"
					type="datetime-local"
					value={startTime}
					onChange={(e) => setStartTime(e.target.value)}
				/>
			</div>

			<div>
				<label htmlFor="endTime">Submission End</label>
				<input
					id="endTime"
					name="endTime"
					type="datetime-local"
					value={endTime}
					onChange={(e) => setEndTime(e.target.value)}
				/>
			</div>
		</div>
	);
}

// Student
type TimeframeDisplayProps = {
	dueDate: string | null;
	startTime: string | null;
	endTime: string | null;
};

export function TimeframeDisplay({ dueDate, startTime, endTime }: TimeframeDisplayProps) {
	return (
		<div>
			<p>Due Date: {dueDate ?? "Not set"}</p>
			<p>Submission Start: {startTime ?? "Not set"}</p>
			<p>Submission End: {endTime ?? "Not set"}</p>
		</div>
	);
}
