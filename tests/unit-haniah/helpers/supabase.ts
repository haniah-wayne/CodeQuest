//11.24 - Haniah Ahmed - making a helper function to test the supabase connection
//imports
import { createClient } from "@supabase/supabase-js";

//use url from the the setup, ? means user right if not left
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

//function, taking 3 inputs,
export function makeClient(
	url = SUPABASE_URL,
	key = SUPABASE_KEY,
	fetchIMpl?: typeof fetch, //optional input that looks like fetch function
) {
	//return output with safe cases built in
	return createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}
