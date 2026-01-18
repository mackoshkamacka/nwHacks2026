import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";

export const headingFont = Space_Grotesk({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-heading",
});

export const bodyFont = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-body",
});
