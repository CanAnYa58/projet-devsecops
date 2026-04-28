import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "les ptits boursiers - Suivi Boursier",
  description:
    "Suivez les marchés financiers mondiaux, gérez votre portefeuille et vos favoris",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body 
        className="bg-bg-primary text-slate-200 font-sans antialiased"
        suppressHydrationWarning
      >
        <Navigation />
        <main className="min-h-screen pt-16">{children}</main>
      </body>
    </html>
  );
}
