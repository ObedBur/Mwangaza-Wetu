import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coopérative Mwangaza Wetu",
  description: "Portail sécurisé de la Coopérative Mwangaza Wetu - Goma, RDC",
  // SEO
  keywords: ["coopérative", "épargne", "crédit", "Goma", "Nord-Kivu"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">  
      <body
        className={`${inter.variable} font-display antialiased bg-background-light dark:bg-background-dark min-h-screen`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}