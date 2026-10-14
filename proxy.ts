import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isRole, roleHome } from "@/lib/auth/roles";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];
const PROTECTED_PREFIXES = ["/dashboard"];

// Middleware to keep the Supabase session fresh on every request.
export async function proxy(request: NextRequest) {
	let response = NextResponse.next({ request });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookies, headers) {
					for (const c of cookies) {
						request.cookies.set(c.name, c.value);
					}

					response = NextResponse.next({ request });

					for (const c of cookies) {
						response.cookies.set(c.name, c.value, c.options);
					}

					// Responses that set auth cookies must not be cached
					for (const [name, value] of Object.entries(headers)) {
						response.headers.set(name, value);
					}
				},
			},
		},
	);

	// This call is what triggers the refresh
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { pathname } = request.nextUrl;

	if (user && AUTH_ROUTES.includes(pathname)) {
		const role = user.user_metadata?.role;

		return redirectWithCookies(request, response, roleHome(isRole(role) ? role : null));
	}

	// Optimistic check only. Pages still verify the session themselves.
	const isProtected = PROTECTED_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);

	if (!user && isProtected) {
		return redirectWithCookies(request, response, "/sign-in");
	}

	return response;
}

function redirectWithCookies(request: NextRequest, response: NextResponse, to: string) {
	const redirect = NextResponse.redirect(new URL(to, request.url));

	// Carry over any cookies the refresh above wrote
	for (const cookie of response.cookies.getAll()) {
		redirect.cookies.set(cookie);
	}

	return redirect;
}

export const config = {
	// Filter out internals and assets
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
	],
};
