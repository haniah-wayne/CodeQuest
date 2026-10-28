import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email links land here with a one-time `code` so we can exchange it for a
// session.
export async function GET(request: NextRequest) {
	const { searchParams, origin } = request.nextUrl;

	const code = searchParams.get("code");
	const next = searchParams.get("next") ?? "/";

	// Only allow same-site relative paths to avoid an open redirect
	const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			return NextResponse.redirect(`${origin}${safeNext}`);
		}
	}

	return NextResponse.redirect(`${origin}/sign-in?error=link_expired`);
}
