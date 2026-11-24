import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
	distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
