import { Cormorant_Garamond } from "next/font/google";

/**
 * The home hero's headline face: Cormorant Garamond, the family the "AALIYA"
 * wordmark is set in. Open, unhurried letterforms, upright only: the site
 * uses no italics. It is loaded here, not in the root layout, so only the home
 * page fetches the heavier weight. The rest of the site's headings use
 * --font-display.
 */
export const heroDisplay = Cormorant_Garamond({
  variable: "--font-hero",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});
