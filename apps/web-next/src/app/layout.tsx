import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cssVariables } from "@job-tracker/design-tokens";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "JobTracker",
  description: "Suivi de candidatures d'emploi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
