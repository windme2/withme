import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Withme - Inventory Management System",
  description: "A comprehensive inventory management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <ErrorBoundary>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
