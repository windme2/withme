"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { MobileSidebar, Sidebar } from "@/components/layout/sidebar";
import { useSidebar } from "@/contexts/sidebar-context";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/login") {
      setIsLoading(false);
      return;
    }

    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [router, pathname]);

  // Don't show layout on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading spinner during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="loader-container">
            <span className="tile-1"></span>
            <span className="tile-2"></span>
            <span className="tile-3"></span>
            <span className="tile-4"></span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <MobileSidebar onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="font-bold text-lg">IMS</span>
          </div>
          <Header />
        </div>

        {/* Mobile Main Content */}
        <main className="p-4 min-h-[calc(100vh-4rem)] overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex">
        <Sidebar />
        <div
          className={`flex-1 fast-transition flex flex-col ${
            collapsed ? "ml-16" : "ml-64"
          }`}
        >
          <Header />
          <main className="pt-20 px-8 pb-6 min-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
          {/* Footer */}
          <footer className="mt-auto py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-900">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 Inventory Management System | All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
