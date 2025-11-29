"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Map paths to readable names
const pathNameMap: Record<string, string> = {
  // Main modules
  dashboard: "Dashboard",
  inventory: "คลังสินค้า",
  purchasing: "จัดซื้อ",
  sales: "ขาย",
  transactions: "รายการเคลื่อนไหว",
  admin: "จัดการระบบ",
  settings: "ตั้งค่า",
  profile: "โปรไฟล์",
  
  // Inventory sub-pages
  "goods-received": "รับสินค้า (GRN)",
  adjustments: "ปรับปรุง Stock",
  items: "รายการสินค้า",
  
  // Purchasing sub-pages
  orders: "ใบสั่งซื้อ (PO)",
  requisition: "ใบขอซื้อ (PR)",
  status: "สถานะการอนุมัติ",
  suppliers: "ซัพพลายเออร์",
  
  // Sales sub-pages
  customers: "ลูกค้า",
  shipments: "จัดส่งสินค้า",
  returns: "รับคืนสินค้า",
  
  // Transactions sub-pages
  movements: "ประวัติการเคลื่อนไหว",
  
  // Admin sub-pages
  "user-management": "จัดการผู้ใช้",
  
  // Actions
  new: "เพิ่มใหม่",
  edit: "แก้ไข",
};

// Map paths to their module/category (for first-level breadcrumb)
const pathModuleMap: Record<string, string> = {
  // Inventory module paths
  inventory: "คลังสินค้า",
  
  // Purchasing module paths
  purchasing: "จัดซื้อ",
  
  // Sales module paths
  sales: "ขาย",
  
  // Transactions module paths
  transactions: "รายการเคลื่อนไหว",
  
  // Admin module paths
  admin: "จัดการระบบ",
};

export function BreadcrumbNav() {
  const pathname = usePathname();

  // Split path and filter empty strings
  const segments = pathname.split("/").filter(Boolean);

  // Generate breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const name = pathNameMap[segment] || segment;

    // Add module name for first level if it exists
    const moduleName = index === 0 ? pathModuleMap[segment] : null;

    return {
      name,
      path,
      moduleName,
      isLast: index === segments.length - 1,
    };
  });

  // Don't show breadcrumb on login page
  if (pathname === "/login" || pathname === "/") {
    return null;
  }

  return (
    <nav className="sticky top-16 z-30 flex items-center space-x-1 text-sm px-6 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Home Icon */}
      <Link
        href="/dashboard"
        className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />

          {crumb.moduleName && index === 0 && (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider px-2">
                {crumb.moduleName}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
            </>
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
  );
}
