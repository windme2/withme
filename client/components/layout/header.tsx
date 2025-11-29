"use client";

import {
  User,
  Settings,
  Home,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/sidebar-context";
import Link from "next/link";
import { cn } from "@/lib/utils";

// -----------------------------
// Path Mapping (Breadcrumb display names)
// -----------------------------
const pathNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  inventory: "INVENTORY",
  items: "Items Management",
  "goods-received": "Goods Received Note (GRN)",
  adjustments: "Stock Adjustment",
  purchasing: "PURCHASING",
  requisition: "Purchase Requisition (PR)",
  status: "Purchase Requisition Status",
  order: "Purchase Order (PO)",
  supplier : "Suppliers",
  sales: "SALES",
  orders: "Sales Orders",
  shipments: "Sales Shipments",
  returns: "Sales Returns",
  customers: "Customers",
  transactions: "TRANSACTIONS",
  movements: "History of Movements",
  admin: "ADMIN",
  "user-management": "User Management",
  settings: "Settings",
  profile: "Profile",
  new: "New",
  edit: "Edit",
};

// ---------------------------------
// Module Mapping (Parent module category)
// ---------------------------------
const pathModuleMap: Record<string, string> = {
  DASHBOARD: "DASHBOARD",
  inventory: "INVENTORY",
  items: "INVENTORY",
  "goods-received": "INVENTORY",
  adjustments: "INVENTORY",
  "stock-remaining": "INVENTORY",
  purchasing: "PURCHASING",
  requisition: "PURCHASING",
  status: "PURCHASING",
  sales: "SALES",
  shipments: "SALES",
  returns: "SALES",
  transactions: "TRANSACTIONS",
  movements: "TRANSACTIONS",
  history: "TRANSACTIONS",
  admin: "ADMIN",
  "user-management": "ADMIN",
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  // ----- Breadcrumb Processing Logic -----
  const segments = pathname.split("/").filter(Boolean);

  // Create a linear breadcrumb list first
  const rawBreadcrumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const name = pathNameMap[segment] ?? segment;
    const isLast = index === segments.length - 1;

    // Find Module Title only for the first segment
    const moduleTitle = index === 0 ? pathModuleMap[segment] : null;

    return { name, path, isLast, moduleTitle, segment };
  });

  // Filter out duplicates (New Logic)
  const breadcrumbs = rawBreadcrumbs.filter((item, index) => {
    // If it's the first item (Module Root) and not the last page (e.g., just /inventory)
    // We might want to hide it if it duplicates the Module Title already shown
    if (
      index === 0 &&
      !item.isLast &&
      item.name.toUpperCase() === item.moduleTitle
    ) {
      return false; // Hide the first link if it matches the gray Module Title
    }
    return true;
  });

  // Extract Module Title separately (from the first segment)
  const currentModule = segments.length > 0 ? pathModuleMap[segments[0]] : null;

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/login");
  };

  const showBreadcrumb = pathname !== "/login" && pathname !== "/";

  return (
    <header
      className={`h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 right-0 z-40 transition-all duration-300 ${
        collapsed ? "left-20" : "left-64" // Updated to match Sidebar width
      }`}
    >
      {/* Breadcrumb Section */}
      {showBreadcrumb && (
        <nav className="flex items-center space-x-1 text-sm">
          {/* Home Icon */}
          <Link
            href="/dashboard"
            className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
          </Link>

          <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />

          {/* Module Title (Gray Uppercase) */}
          {currentModule && (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider px-1">
                {currentModule}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
            </>
          )}

          {/* Dynamic Breadcrumbs */}
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center space-x-1">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
              )}

              {crumb.isLast ? (
                <span className="font-semibold text-blue-600 dark:text-blue-400 px-2 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className={cn(
                    "text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors",
                    "px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Right section (Icons & Profile) */}
      <div className="flex items-center space-x-3 relative">
        {/* Notifications */}
        <NotificationDropdown />

        {/* Old notifications popover replaced */}
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-blue-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {notifications.length}
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-80 max-h-80 overflow-auto"
            align="end"
            sideOffset={8}
          >
            <h4 className="font-medium mb-2">Notifications</h4>

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => handleNotificationClick(notification.type)}
              >
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.time}
                </p>
              </div>
            ))}
          </PopoverContent>
        </Popover> */}

        {/* User Profile */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            >
              <User className="h-5 w-5 text-slate-700 dark:text-gray-300" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
            <DropdownMenuItem onClick={() => router.push("/profile/edit")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
