import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Musical Fitness Assessment — Rock 'n' Read",
  description:
    "Administer the Rock 'n' Read Musical Fitness Assessment in the browser. " +
    "Built-in metronome and pitch player. Nothing is recorded or sent anywhere.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Assessments happen on phones and tablets held at odd angles. Do not
  // disable zoom — some administrators will need it.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
