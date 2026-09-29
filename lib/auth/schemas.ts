import * as v from "valibot";
import { ROLES } from "./roles";

const email = v.pipe(
	v.string("Enter your email."),
	v.trim(),
	v.nonEmpty("Enter your email."),
	v.email("Enter a valid email address."),
);

export const MIN_PASSWORD_LENGTH = 8;

export const SignInSchema = v.object({
	email,
	password: v.pipe(v.string("Enter your password."), v.nonEmpty("Enter your password.")),
});

export const SignUpSchema = v.object({
	name: v.pipe(v.string("Enter your name."), v.trim(), v.minLength(2, "Enter your name.")),
	email,
	password: v.pipe(
		v.string("Enter a password."),
		v.minLength(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`),
	),
	role: v.picklist(ROLES, "Pick whether you're a student or a professor."),
});
