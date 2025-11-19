"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Clock,
  User,
  ShoppingBag,
  Package,
  FileText,
  Key,
  X,
} from "lucide-react";

// --- Mock Data ---
const mockActivityLog = [
  {
    id: 1,
    dateTime: "2025-11-19 02:30 PM",
    user: "John Smith",
    type: "Purchasing",
    action: "Issued new Purchase Order",
    ref: "PO-2025-020",
  },
  {
    id: 2,
    dateTime: "2025-11-19 01:45 PM",
    user: "Mike Johnson",
    type: "Inventory",
    action: "Recorded Goods Receipt",
    ref: "GRN-2025-015",
  },
  {
    id: 3,
    dateTime: "2025-11-19 12:00 PM",
    user: "Emily Clark",
    type: "Sales",
    action: "Created new Sales Order",
    ref: "SO-0092",
  },
  {
    id: 4,
    dateTime: "2025-11-19 11:20 AM",
    user: "Jane Wilson",
    type: "Purchasing",
    action: "Approved Purchase Requisition",
    ref: "PR-2025-025",
  },
  {
    id: 5,
    dateTime: "2025-11-19 10:15 AM",
    user: "David Chen",
    type: "Inventory",
    action: "Adjusted stock level (Variance)",
    ref: "ADJ-0012",
  },
  {
    id: 6,
    dateTime: "2025-11-19 09:30 AM",
    user: "Lisa Anderson",
    type: "Purchasing",
    action: "Created Purchase Requisition",
    ref: "PR-2025-024",
  },
  {
    id: 7,
    dateTime: "2025-11-18 04:45 PM",
    user: "Tom Martinez",
    type: "Inventory",
    action: "Recorded Goods Receipt",
    ref: "GRN-2025-014",
  },
  {
    id: 8,
    dateTime: "2025-11-18 03:30 PM",
    user: "Nancy White",
    type: "Sales",
    action: "Processed Return Request",
    ref: "RT-0015",
  },
  {
    id: 9,
    dateTime: "2025-11-18 02:15 PM",
    user: "Robert Taylor",
    type: "System",
    action: "Updated User Permissions",
    ref: "U-12",
  },
  {
    id: 10,
    dateTime: "2025-11-18 01:00 PM",
    user: "System",
    type: "System",
    action: "Daily Backup Completed",
    ref: "-",
  },
];

export default function RecentActivityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Pagination State ---
  const itemsPerPage = 10;

  // --- Filter Logic ---
  const filteredLog = mockActivityLog.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ref.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesUser = filterUser === "all" || log.user === filterUser;
    return matchesSearch && matchesType && matchesUser;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredLog.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLog = filteredLog.slice(startIndex, startIndex + itemsPerPage);

  const activityTypes = ["all", "Purchasing", "Inventory", "Sales", "System"];
  const users = ["all", ...new Set(mockActivityLog.map((log) => log.user))];

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterUser("all");
    setCurrentPage(1);
  };

  // Define Type Icons and colors
  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Purchasing":
        return { icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" };
      case "Inventory":
        return { icon: Package, color: "text-amber-600", bg: "bg-amber-50" };
      case "Sales":
        return { icon: User, color: "text-emerald-600", bg: "bg-emerald-50" };
      case "System":
        return { icon: Key, color: "text-purple-600", bg: "bg-purple-50" };
      default:
        return { icon: FileText, color: "text-slate-500", bg: "bg-slate-100" };
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Recent Activity
            </h1>
            <p className="text-slate-500 mt-1">
              แสดงบันทึกการดำเนินการที่ทั้งหมดในระบบ
            </p>
          </div>
        </div>

        {/* --- Main Content: Table --- */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* --- Toolbar: Filter --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Action Description or Reference Number..."
                  className="pl-10 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterType}
                  onValueChange={(val) => {
                    setFilterType(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px] border-slate-200">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All Types" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterUser}
                  onValueChange={(val) => {
                    setFilterUser(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px] border-slate-200">
                    <SelectValue placeholder="Filter by User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user === "all" ? "All Users" : user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(searchTerm ||
                  filterType !== "all" ||
                  filterUser !== "all") && (
                  <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="h-4 w-4 text-slate-500" />
                  </Button>
                )}
              </div>
            </div>

            {/* --- Data Table --- */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[180px] font-semibold text-slate-700 pl-6 h-12">
                      Date/Time
                    </TableHead>
                    <TableHead className="w-[120px] font-semibold text-slate-700 h-12">
                      User
                    </TableHead>
                    <TableHead className="w-[120px] font-semibold text-slate-700 h-12 text-center">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12">
                      Action / Description
                    </TableHead>
                    <TableHead className="w-[140px] font-semibold text-slate-700 pr-6 h-12">
                      Reference
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLog.map((log) => {
                    const typeStyle = getTypeStyle(log.type);
                    const Icon = typeStyle.icon;
                    return (
                      <TableRow
                        key={log.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Date/Time */}
                        <TableCell className="pl-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {log.dateTime}
                        </TableCell>

                        {/* User */}
                        <TableCell className="font-medium text-slate-900 py-4">
                          {log.user}
                        </TableCell>

                        {/* Type */}
                        <TableCell className="py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeStyle.bg} ${typeStyle.color} border-current`}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {log.type}
                          </span>
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-slate-700 py-4">
                          {log.action}
                        </TableCell>

                        {/* Reference */}
                        <TableCell className="text-slate-600 font-medium py-4 pr-6">
                          {log.ref}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 gap-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(startIndex + itemsPerPage, filteredLog.length)} of{" "}
                  {filteredLog.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="text-sm font-medium text-slate-700 px-2">
                    Page {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="border-slate-200"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
