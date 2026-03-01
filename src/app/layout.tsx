import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Roaster PH 🔥 — Get Your Resume Roasted",
  description:
    "Paste your resume and get the most brutal honest feedback of your life. No sugarcoating. Para sa Filipinos, by Filipinos.",
  openGraph: {
    title: "Resume Roaster PH 🔥",
    description: "Get your resume roasted. No sugarcoating, slay!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
