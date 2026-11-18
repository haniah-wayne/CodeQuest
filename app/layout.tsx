import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "CodeQuest",
	description:
		"Location-based coding challenges for Wayne State computer science students. Find challenges around campus, solve them in the browser, and climb your class leaderboard.",
	applicationName: "CodeQuest",
	icons: {
		icon: "/favicon.svg",
		apple: "/apple-icon.png",
	},
	appleWebApp: {
		capable: true,
		title: "CodeQuest",
		statusBarStyle: "default",
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport: Viewport = {
	themeColor: "#0c5449",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={cn(
				"h-full",
				"antialiased",
				geistSans.variable,
				geistMono.variable,
				"font-sans",
				figtree.variable,
			)}
		>
			<body className="flex min-h-full flex-col">{children}</body>
		</html>
	);
}
