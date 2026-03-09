"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  History,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
} from "lucide-react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useState, useEffect, useRef } from "react";

interface MenuItem {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SidebarModule {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  items: MenuItem[];
  defaultOpen?: boolean;
  adminOnly?: boolean;
  noCollapse?: boolean;
}

const getSidebarModules = (userRole: string): SidebarModule[] => [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    emoji: "📊",
    items: [{ name: "Dashboard", path: "/dashboard" }],
    noCollapse: true,
  },
  {
    label: "Inventory",
    icon: Package,
    emoji: "📦",
    items: [
      { name: "รายการสินค้าทั้งหมด", path: "/inventory/items" },
      { name: "รายการสินค้ารับเข้า", path: "/inventory/goods-received" },
      ...(userRole === 'admin' ? [{ name: "ปรับปรุงรายการสินค้า", path: "/inventory/adjustments" }] : []),
    ],
    defaultOpen: true,
  },
  {
    label: "Purchasing",
    icon: ShoppingCart,
    emoji: "🛒",
    items: [
      { name: "รายการใบขอซื้อ (PR)", path: "/purchasing/requisition" },
      { name: "สถานะคำขอ (PR)", path: "/purchasing/status" },
      { name: "รายการใบสั่งซื้อ (PO)", path: "/purchasing/orders" },
      ...(userRole === 'admin' ? [{ name: "รายชื่อ Suppliers", path: "/purchasing/suppliers" }] : []),
    ],
    defaultOpen: true,
  },
  {
    label: "Sales",
    icon: Truck,
    emoji: "🚚",
    items: [
      { name: "รายการขายสินค้า", path: "/sales/orders" },
      { name: "รายการจัดส่งขาย", path: "/sales/shipments" },
      { name: "รายการคืนสินค้า", path: "/sales/returns" },
      { name: "รายชื่อลูกค้า", path: "/sales/customers" },
    ],
    defaultOpen: true,
  },
  {
    label: "Transactions",
    icon: History,
    emoji: "🔄",
    items: [
      { name: "การเคลื่อนไหวสินค้า", path: "/transactions/movements" }
    ],
    defaultOpen: true,
  },
  {
    label: "Reports",
    icon: FileText,
    emoji: "📊",
    items: [
      { name: "รายงานและส่งออกข้อมูล", path: "/reports" }
    ],
    defaultOpen: true,
    noCollapse: true,
  },
  {
    label: "Admin",
    icon: Users,
    emoji: "👥",
    items: [
      { name: "จัดการผู้ใช้งาน", path: "/admin/user-management" }
    ],
    defaultOpen: true,
    adminOnly: true,
  },
];

// Extracted Content for reuse
function SidebarContent({ 
  modules, 
  collapsed, 
  pathname, 
  expandedModules, 
  toggleModule, 
  onNavigate 
}: { 
  modules: SidebarModule[], 
  collapsed: boolean, 
  pathname: string,
  expandedModules: Set<string>,
  toggleModule: (label: string) => void,
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
      {modules.map((module) => {
        const isActive = (
            module.items.some((item) => pathname === item.path) ||
            pathname.startsWith(`/${module.label.toLowerCase()}`)
          );
        const isOpen = expandedModules.has(module.label);
        const Icon = module.icon;
        const shouldShowAsButton = module.noCollapse === true;

        if (collapsed) {
          return (
            <div
              key={module.label}
              className="flex justify-center relative group mb-3"
            >
              <Link
                href={module.items[0]?.path || '#'}
                onClick={onNavigate}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
              <div className="absolute left-12 top-1 z-50 hidden group-hover:block">
                <div className="bg-slate-800 text-white text-sm px-3 py-2 rounded-md shadow-xl border border-slate-700 whitespace-nowrap ml-2">
                  {module.label}
                </div>
              </div>
            </div>
          );
        }

        if (shouldShowAsButton) {
          return (
            <Link
              key={module.label}
              href={module.items[0].path}
              onClick={onNavigate}
              className="mb-1 block"
            >
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors flex-shrink-0",
                    isActive
                      ? "bg-white/10"
                      : "bg-slate-800/50 group-hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm truncate">
                  {module.label}
                </span>
              </button>
            </Link>
          );
        }

        return (
          <div key={module.label} className="mb-1">
            <button
              onClick={() => toggleModule(module.label)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-blue-600/10 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors flex-shrink-0",
                    isActive
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md"
                      : "bg-slate-800/50 group-hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "font-medium text-sm truncate",
                    isActive ? "text-white" : ""
                  )}
                >
                  {module.label}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300 flex-shrink-0",
                  isOpen ? "rotate-180" : "",
                  isActive ? "text-blue-400" : "text-slate-600"
                )}
              />
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen
                  ? "max-h-[500px] opacity-100 mt-1"
                  : "max-h-0 opacity-0"
              )}
            >
              <div className="ml-7 pl-3 border-l border-slate-700/50 space-y-1 py-1">
                {module.items.map((item) => {
                  const isItemActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onNavigate}
                      className={cn(
                        "block py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 truncate",
                        isItemActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const [userRole, setUserRole] = useState<string>("user");
  const [sidebarModules, setSidebarModules] = useState<SidebarModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [justExpanded, setJustExpanded] = useState(false);
  const prevCollapsedRef = useRef(collapsed);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole") || "user";
      setUserRole(role);
      const modules = getSidebarModules(role);
      setSidebarModules(modules);
      
      const saved = localStorage.getItem("sidebar-expanded-modules");
      if (saved) {
        try {
          setExpandedModules(new Set(JSON.parse(saved)));
        } catch {}
      } else {
        setExpandedModules(new Set(modules.map((m) => m.label)));
      }
    }
  }, []);

  useEffect(() => {
    if (prevCollapsedRef.current === true && collapsed === false) {
      setJustExpanded(true);
      setTimeout(() => setJustExpanded(false), 500);
    }
    prevCollapsedRef.current = collapsed;
  }, [collapsed]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "sidebar-expanded-modules",
        JSON.stringify(Array.from(expandedModules))
      );
    }
  }, [expandedModules]);

  const toggleModule = (label: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const visibleModules = sidebarModules.filter(
    (m) => !m.adminOnly || userRole === "admin"
  );

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-[#0F172A] text-slate-300 border-r border-slate-800 transition-all duration-300 z-50 flex flex-col shadow-2xl hidden md:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* --- Header --- */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60 shrink-0">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="mx-auto h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        ) : (
          <>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
            >
              {/* Logo Icon */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20 border border-blue-400/20 relative overflow-hidden flex-shrink-0">
                <Layers className="w-5 h-5 text-white relative z-10" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent z-0"></div>
              </div>

              {/* Text */}
              <div className="text-left flex flex-col min-w-0">
                <span className="text-lg font-bold text-white leading-none tracking-tight">
                  IMS
                </span>
                <span
                  className={cn(
                    "text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-1 truncate group-hover:text-slate-400 transition-colors",
                    justExpanded && "animate-fade-in-delayed"
                  )}
                >
                  Inventory Management
                </span>
              </div>
            </button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full ml-auto flex-shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      <SidebarContent 
        modules={visibleModules} 
        collapsed={collapsed} 
        pathname={pathname}
        expandedModules={expandedModules}
        toggleModule={toggleModule}
      />
    </div>
  );
}

export function MobileSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("user");
  const [sidebarModules, setSidebarModules] = useState<SidebarModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "user";
    setUserRole(role);
    const modules = getSidebarModules(role);
    setSidebarModules(modules);
    setExpandedModules(new Set(modules.map((m) => m.label)));
  }, []);

  const toggleModule = (label: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const visibleModules = sidebarModules.filter(
    (m) => !m.adminOnly || userRole === "admin"
  );

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300">
       {/* --- Header --- */}
       <div className="h-16 flex items-center px-4 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20 border border-blue-400/20 relative overflow-hidden flex-shrink-0">
                <Layers className="w-5 h-5 text-white relative z-10" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent z-0"></div>
              </div>
              <span className="text-lg font-bold text-white leading-none tracking-tight">
                  IMS
              </span>
          </div>
       </div>

      <SidebarContent 
        modules={visibleModules} 
        collapsed={false} 
        pathname={pathname}
        expandedModules={expandedModules}
        toggleModule={toggleModule}
        onNavigate={onNavigate}
      />
    </div>
  );
}
