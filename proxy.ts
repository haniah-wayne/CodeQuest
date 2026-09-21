import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];

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

	if (user && AUTH_ROUTES.includes(request.nextUrl.pathname)) {
		const redirect = NextResponse.redirect(new URL("/", request.url));

		// Carry over any cookies the refresh above wrote
		for (const cookie of response.cookies.getAll()) {
			redirect.cookies.set(cookie);
		}

		return redirect;
	}

	return response;
}

export const config = {
	// Filter out internals and assets
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
	],
};
