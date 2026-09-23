"use client";

import { useActionState } from "react";
import { sendResetPasswordEmail } from "@/app/(auth)/actions"; //import the serveer action

export default function ForgotPasswordPage() {
	//calling on the predefined function sendResetPasswordEmail from actions.ts to send the reset password email
	const [state, formAction, isPending] = useActionState(sendResetPasswordEmail, {
		//almost calling the function
		success: "",
		error: "",
	});

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
			<div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
				<h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
					Forgot Password?
				</h2>
				<form action={formAction} className="space-y-6">
					<input
						name="email"
						type="email"
						placeholder="you@example.com"
						className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<button
						type="submit"
						disabled={isPending}
						className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-white hover:bg-indigo-700"
					>
						{isPending ? "Sending..." : "Send Password Reset Email"}
					</button>
					{state.error && <p className="text-sm text-red-600">{state.error}</p>}
					{state.success && <p className="text-sm text-green-600">{state.success}</p>}
				</form>
			</div>
		</div>
	);
}
