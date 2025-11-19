"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  ClipboardCheck,
  RotateCcw, // Icon for Returns/Goods Return
  Calendar,
  X,
  FileText,
  Package,
  ListRestart, // Icon for Pending Inspection
} from "lucide-react";

// --- Mock Data ---
const mockReturns = [
  {
    id: "RT-2025-005",
    shipmentRef: "SH-2025-015",
    customer: "Global Retail Co.",
    date: "2025-02-20",
    totalQty: 2,
    totalValue: 9000,
    status: "Completed",
    reason: "Defective item",
    details: [{ name: 'Monitor 24"', qty: 2, price: 4500 }],
  },
  {
    id: "RT-2025-004",
    shipmentRef: "SH-2025-014",
    customer: "Local Tech Shop",
    date: "2025-02-18",
    totalQty: 5,
    totalValue: 5000,
    status: "Received",
    reason: "Wrong item shipped",
    details: [{ name: "Keyboard", qty: 5, price: 500 }],
  },
  {
    id: "RT-2025-003",
    shipmentRef: "SH-2025-013",
    customer: "ABC Trading Ltd.",
    date: "2025-02-16",
    totalQty: 10,
    totalValue: 1000,
    status: "Pending Inspection",
    reason: "Change of mind",
    details: [{ name: "Mousepads", qty: 10, price: 100 }],
  },
  {
    id: "RT-2025-002",
    shipmentRef: "SH-2025-012",
    customer: "Quick Serve Services",
    date: "2025-02-14",
    totalQty: 1,
    totalValue: 5000,
    status: "Completed",
    reason: "Damaged in transit",
    details: [{ name: "Laptop HP", qty: 1, price: 5000 }],
  },
  {
    id: "RT-2025-001",
    shipmentRef: "SH-2025-011",
    customer: "IT Solution Hub",
    date: "2025-02-12",
    totalQty: 5,
    totalValue: 500,
    status: "Cancelled",
    reason: "Customer changed mind",
    details: [{ name: "Cable tie", qty: 5, price: 100 }],
  },
];

export default function SalesReturnsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Data Processing ---
  const totalValueSum = mockReturns.reduce((sum, s) => sum + s.totalValue, 0);

  // --- Filter Logic ---
  const filteredReturns = mockReturns.filter((returnItem) => {
    const matchesSearch =
      returnItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.shipmentRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || returnItem.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReturns = filteredReturns.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const handleRowClick = (returnItem: any) => {
    setSelectedReturn(returnItem);
    setIsSheetOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header & Primary Action --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              รายการคืนสินค้า (Sales Returns)
            </h1>
            <p className="text-slate-500 mt-1">
              จัดการและติดตามสินค้าที่ถูกส่งคืนจากลูกค้า
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/sales/returns/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            บันทึกรับคืนสินค้าใหม่
          </Button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Returns"
            value={mockReturns.length}
            icon={RotateCcw}
            color="text-red-600"
            bg="bg-red-50"
          />
          <StatCard
            title="Pending Inspection"
            value={
              mockReturns.filter((o) => o.status === "Pending Inspection")
                .length
            }
            icon={ListRestart}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            title="Completed"
            value={mockReturns.filter((o) => o.status === "Completed").length}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Total Value (K)"
            value={`฿${(totalValueSum / 1000).toFixed(1)}K`}
            icon={FileText}
            color="text-blue-600"
            bg="bg-blue-50"
          />
        </div>

        {/* --- Main Content: Table --- */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* --- Toolbar: Filter --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search Return No, Shipment Ref, or Customer..."
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
                  value={filterStatus}
                  onValueChange={(val) => {
                    setFilterStatus(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px] border-slate-200">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Pending Inspection">
                      Pending Inspection
                    </SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || filterStatus !== "all") && (
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
                    <TableHead className="w-[140px] font-semibold text-slate-700 pl-6 h-12">
                      Return No.
                    </TableHead>
                    <TableHead className="w-[140px] font-semibold text-slate-700 h-12">
                      Shipment Ref.
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12">
                      Customer
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 h-12">
                      Total Qty
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 h-12">
                      Total Value
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12">
                      Date
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 pr-6 h-12">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReturns.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(item)}
                    >
                      {/* Return No. */}
                      <TableCell className="pl-6 py-4">
                        <span className="font-medium text-red-600 group-hover:underline underline-offset-4">
                          {item.id}
                        </span>
                      </TableCell>

                      {/* Shipment Ref. */}
                      <TableCell className="text-slate-600 py-4">
                        {item.shipmentRef}
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="font-medium text-slate-900 py-4">
                        {item.customer}
                      </TableCell>

                      {/* Total Qty */}
                      <TableCell className="text-center text-slate-700 py-4">
                        {item.totalQty}
                      </TableCell>

                      {/* Total Value */}
                      <TableCell className="text-right font-bold text-slate-700 py-4">
                        ฿{item.totalValue.toLocaleString()}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-slate-500 text-sm py-4">
                        {item.date}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center pr-6 py-4">
                        <StatusBadge status={item.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 gap-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(startIndex + itemsPerPage, filteredReturns.length)}{" "}
                  of {filteredReturns.length} entries
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

      {/* --- Detail Sheet (Return) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedReturn && <ReturnDetailSheet returnItem={selectedReturn} />}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// --- Detail Sheet Component ---
function ReturnDetailSheet({ returnItem }: { returnItem: any }) {
  // Mock function to update status
  const handleUpdateStatus = (newStatus: string) => {
    if (newStatus === "Completed") {
      alert(
        `Simulating status update: Return ${returnItem.id} marked as Completed and inventory adjusted.`
      );
    }
  };

  return (
    <>
      <SheetHeader className="mb-6 border-b pb-4">
        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
          <RotateCcw className="h-6 w-6 text-red-600" />
          {returnItem.id}
        </SheetTitle>
        <SheetDescription>
          Shipment Ref: {returnItem.shipmentRef} | Customer:{" "}
          {returnItem.customer}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6">
        {/* Info Block */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
          <InfoRow label="Return Date" value={returnItem.date} />
          <InfoRow label="Customer" value={returnItem.customer} />
          <InfoRow label="Reason" value={returnItem.reason} />
          <InfoRow
            label="Current Status"
            value={<StatusBadge status={returnItem.status} />}
          />
        </div>

        {/* Item Summary */}
        <div>
          <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
            <PackageOpen className="h-4 w-4" /> Items Returned
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <div className="divide-y">
              {returnItem.details && returnItem.details.length > 0 ? (
                returnItem.details.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="px-4 py-3 flex justify-between items-center text-sm"
                  >
                    <div className="font-medium text-slate-900">
                      {item.name}
                    </div>
                    <div className="text-slate-500">Qty: {item.qty}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 italic">
                  No detailed items recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between font-bold text-lg pt-2">
            <span>Total Credit Value</span>
            <span className="text-red-600">
              - ฿{returnItem.totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <SheetFooter className="mt-8 border-t pt-4">
        {returnItem.status === "Pending Inspection" && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => handleUpdateStatus("Completed")}
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Complete Inspection & Process Refund
          </Button>
        )}
        {(returnItem.status === "Completed" ||
          returnItem.status === "Cancelled") && (
          <div className="w-full text-center text-slate-400 text-sm italic">
            Return process finalized.
          </div>
        )}
      </SheetFooter>
    </>
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Received: "bg-blue-50 text-blue-700 border-blue-200",
    "Pending Inspection": "bg-amber-50 text-amber-700 border-amber-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const currentStyle =
    styles[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === "Received" && <PackageOpen className="w-3 h-3 mr-1" />}
      {status === "Pending Inspection" && (
        <ListRestart className="w-3 h-3 mr-1" />
      )}
      {status === "Cancelled" && <XCircle className="w-3 h-3 mr-1" />}
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
