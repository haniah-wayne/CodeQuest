"use client";
// creating the reset password form components

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
	// setting the email, password, error, and role state
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// handling password is empty
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password) {
			setError("Fill out the email");
			return;
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
			<div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
				<div className="mb-8 text-center">
					<h2 className="mb-2 text-3xl font-bold text-gray-800">Reset Your Password</h2>
					<p className="text-sm text-gray-500">Enter your new password!</p>
				</div>

				{error && (
					<div className="mb-6 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
						<p className="flex items-center text-sm text-red-600">
							<svg
								className="mr-2 h-4 w-4"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
							{error}
						</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700">
							Password
						</label>
						<div className="relative rounded-md shadow-sm">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<svg
									className="h-5 w-5 text-gray-400"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
									<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
								</svg>
							</div>
							<input
								type="password"
								className="w-full rounded-xl border border-gray-200 py-3 pl-10 text-black transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
								placeholder="you@example.com"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					<button
						type="submit"
						className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					>
						Set New Password
					</button>
				</form>
			</div>
		</div>
	);
}
