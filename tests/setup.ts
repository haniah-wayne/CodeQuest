//11.23 - Haniah Ahmed - makign the setup file
//importing the package for env files, reads and makes sure that no names are missing
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]) {
	if (!process.env[name]) {
		console.warn(`${name} is missing, supabase tests will be skipped`);
	}
}
