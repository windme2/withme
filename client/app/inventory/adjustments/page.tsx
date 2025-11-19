"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  FileClock,
  X,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// --- Mock Data (15 items) ---
const adjustmentList = [
  {
    id: "ADJ-2025-015",
    date: "2025-01-15",
    product: "Wireless Mouse",
    sku: "SKU009",
    type: "Remove",
    qty: 2,
    remark: "Internal Use",
    user: "Admin",
  },
  {
    id: "ADJ-2025-014",
    date: "2025-01-14",
    product: "HDMI Cable 2m",
    sku: "SKU011",
    type: "Remove",
    qty: 1,
    remark: "Lost / Stolen",
    user: "Mike",
  },
  {
    id: "ADJ-2025-013",
    date: "2025-01-13",
    product: "Notebook A4",
    sku: "SKU003",
    type: "Add",
    qty: 30,
    remark: "Stock count error",
    user: "Wind",
  },
  {
    id: "ADJ-2025-012",
    date: "2025-01-12",
    product: "Blue Ink Pen",
    sku: "SKU002",
    type: "Remove",
    qty: 12,
    remark: "Damaged / Expired",
    user: "Jame",
  },
  {
    id: "ADJ-2025-011",
    date: "2025-01-11",
    product: "A4 Paper 80gsm",
    sku: "SKU001",
    type: "Add",
    qty: 50,
    remark: "Found in old stock",
    user: "Wind",
  },
  {
    id: "ADJ-2025-010",
    date: "2025-01-10",
    product: "Stapler HD",
    sku: "OFF-001",
    type: "Add",
    qty: 10,
    remark: "Returned from dept",
    user: "Sarah",
  },
  {
    id: "ADJ-2025-009",
    date: "2025-01-09",
    product: "Glue Stick",
    sku: "GLU-001",
    type: "Remove",
    qty: 5,
    remark: "Dried out",
    user: "Admin",
  },
  {
    id: "ADJ-2025-008",
    date: "2025-01-08",
    product: "Whiteboard Marker",
    sku: "PEN-005",
    type: "Add",
    qty: 20,
    remark: "Bonus from supplier",
    user: "Wind",
  },
  {
    id: "ADJ-2025-007",
    date: "2025-01-07",
    product: "Office Chair",
    sku: "FUR-001",
    type: "Remove",
    qty: 1,
    remark: "Broken wheel",
    user: "Mike",
  },
  {
    id: "ADJ-2025-006",
    date: "2025-01-06",
    product: "USB-C Cable",
    sku: "CAB-002",
    type: "Add",
    qty: 100,
    remark: "Initial stock",
    user: "Wind",
  },
  {
    id: "ADJ-2025-005",
    date: "2025-01-05",
    product: 'Monitor 24"',
    sku: "IT-001",
    type: "Remove",
    qty: 1,
    remark: "Dead pixel",
    user: "Jame",
  },
  {
    id: "ADJ-2025-004",
    date: "2025-01-04",
    product: "Keyboard Mech",
    sku: "IT-002",
    type: "Add",
    qty: 5,
    remark: "Restock adjustment",
    user: "Sarah",
  },
  {
    id: "ADJ-2025-003",
    date: "2025-01-03",
    product: "Mouse Pad",
    sku: "ACC-001",
    type: "Add",
    qty: 50,
    remark: "Found in warehouse B",
    user: "Wind",
  },
  {
    id: "ADJ-2025-002",
    date: "2025-01-02",
    product: "Laptop Stand",
    sku: "ACC-002",
    type: "Remove",
    qty: 2,
    remark: "Demo units",
    user: "Admin",
  },
  {
    id: "ADJ-2025-001",
    date: "2025-01-01",
    product: "Webcam 1080p",
    sku: "IT-003",
    type: "Add",
    qty: 10,
    remark: "Stock count correction",
    user: "Mike",
  },
];

export default function StockAdjustmentPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedAdjustment, setSelectedAdjustment] = useState<any>(null); // State for row click
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for sheet visibility

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Filter Logic ---
  const filteredData = adjustmentList.filter((item) => {
    const matchesSearch =
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page when filter changes
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (val: string) => {
    setFilterType(val);
    setCurrentPage(1);
  };

  // Handler for row click to show details
  const handleRowClick = (adj: any) => {
    setSelectedAdjustment(adj);
    setIsSheetOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Stock Adjustment
            </h1>
            <p className="text-slate-500 mt-1">
              จัดการรายการสินค้าและตรวจสอบประวัติการปรับยอดสินค้า
            </p>
          </div>
          {/* Navigate to Create Page */}
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/inventory/adjustments/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Adjustments"
            value="156"
            icon={FileClock}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Stock Added Rate"
            value="65%"
            icon={ArrowUpCircle}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Stock Removed Rate"
            value="35%"
            icon={ArrowDownCircle}
            color="text-red-600"
            bg="bg-red-50"
          />
          <StatCard
            title="Audit Accuracy"
            value="98.5%"
            icon={Activity}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>

        {/* --- Main Table Card --- */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* --- Toolbar: Search & Filter --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search Product, SKU or ADJ No. ..."
                  className="pl-10 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={filterType} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-[160px] border-slate-200">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Add">Add Only</SelectItem>
                    <SelectItem value="Remove">Remove Only</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || filterType !== "all") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      handleSearchChange("");
                      handleFilterChange("all");
                    }}
                  >
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
                    {/* [NEW HEADER ORDER & BALANCE] */}
                    <TableHead className="font-semibold text-slate-700 pl-6 h-12 w-[140px]">
                      ADJ No.
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12 w-[100px]">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12 w-[100px]">
                      SKU
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12 min-w-[180px]">
                      Item Description
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 h-12 w-[100px]">
                      Quantity
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 h-12 w-[120px]">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 pr-6 h-12">
                      Remark
                    </TableHead>
                    {/* User column removed */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((adj) => (
                    <TableRow
                      key={adj.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(adj)}
                    >
                      {/* [NEW BODY ORDER & PADDING] */}

                      {/* 1. ADJ No. (pl-6, py-4) */}
                      <TableCell className="font-medium text-blue-600 pl-6 py-4">
                        {adj.id}
                      </TableCell>

                      {/* 2. Date (py-4) */}
                      <TableCell className="text-slate-500 text-sm py-4">
                        {adj.date}
                      </TableCell>

                      {/* 3. SKU (py-4) */}
                      <TableCell className="text-slate-600 py-4">
                        {adj.sku}
                      </TableCell>

                      {/* 4. Item Description (py-4) */}
                      <TableCell className="font-medium text-slate-900 py-4">
                        {adj.product}
                      </TableCell>

                      {/* 5. Quantity (py-4) */}
                      <TableCell className="text-right font-bold text-sm py-4">
                        {adj.type === "Add" ? (
                          <span className="text-emerald-600">+{adj.qty}</span>
                        ) : (
                          <span className="text-red-600">-{adj.qty}</span>
                        )}
                      </TableCell>

                      {/* 6. Type (py-4) */}
                      <TableCell className="text-center py-4">
                        <AdjustmentBadge type={adj.type} />
                      </TableCell>

                      {/* 7. Remark (py-4, pr-6) */}
                      <TableCell className="text-slate-600 text-sm py-4 pr-6">
                        {adj.remark}
                      </TableCell>

                      {/* User column removed */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* --- Pagination Footer --- */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                  {filteredData.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="h-8 px-3 text-slate-600"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 text-slate-600"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Adjustment Detail Sheet --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedAdjustment && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <FileClock className="h-5 w-5 text-blue-600" />
                  Adjustment Details
                </SheetTitle>
                <SheetDescription>
                  Review history for {selectedAdjustment.id}.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <InfoRow label="ADJ No." value={selectedAdjustment.id} />
                <InfoRow label="Date" value={selectedAdjustment.date} />
                <InfoRow label="Product" value={selectedAdjustment.product} />
                <InfoRow label="SKU" value={selectedAdjustment.sku} />

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-2">
                    Adjustment Summary
                  </h4>
                  <InfoRow
                    label="Type"
                    value={<AdjustmentBadge type={selectedAdjustment.type} />}
                    valueColor="text-slate-900"
                  />
                  <InfoRow
                    label="Quantity"
                    value={
                      selectedAdjustment.type === "Add"
                        ? `+${selectedAdjustment.qty}`
                        : `-${selectedAdjustment.qty}`
                    }
                    valueColor={
                      selectedAdjustment.type === "Add"
                        ? "text-emerald-600 font-bold"
                        : "text-red-600 font-bold"
                    }
                  />
                  <InfoRow label="Reason" value={selectedAdjustment.remark} />
                  {/* Retain User/Auditing Info in the Detail Sheet */}
                  <InfoRow
                    label="Recorded By"
                    value={selectedAdjustment.user}
                  />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// --- Sub-Components ---

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function AdjustmentBadge({ type }: { type: string }) {
  const isAdd = type === "Add";
  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 font-medium border-0 ${
        isAdd
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
          : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
      }`}
    >
      {isAdd ? "Add Stock" : "Remove"}
    </Badge>
  );
}

function InfoRow({
  label,
  value,
  valueColor = "text-slate-900",
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="flex justify-between py-1 border-b border-slate-50/50 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm ${valueColor}`}>{value}</span>
    </div>
  );
}
