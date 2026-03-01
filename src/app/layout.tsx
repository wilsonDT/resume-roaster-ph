import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Roaster PH 🔥 — I-roast ang Resume Mo",
  description:
    "I-paste ang resume mo at tanggapin ang pinaka-brutal na feedback sa buhay mo — sa Taglish. Para sa mga Pilipino na gusto ng katotohanan.",
  openGraph: {
    title: "Resume Roaster PH 🔥",
    description: "I-roast ang resume mo. Walang prinsesa dito.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tl">
      <body>{children}</body>
    </html>
  );
}
