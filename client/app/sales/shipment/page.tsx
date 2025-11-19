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
  PackageOpen, // For Shipments Icon
  Package, // For total packages
  ClipboardCheck, // For Delivered
  Clock3, // For Pending
  Calendar,
  X,
} from "lucide-react";

// --- Mock Data ---
const mockShipments = [
  {
    id: "SH-2025-015",
    orderRef: "SO-2025-030",
    customer: "Global Retail Co.",
    date: "2025-02-15",
    totalQty: 25,
    totalValue: 55000,
    status: "Delivered",
    details: [{ name: 'Monitor 24"', qty: 5, price: 4500 }],
  },
  {
    id: "SH-2025-014",
    orderRef: "SO-2025-029",
    customer: "Local Tech Shop",
    date: "2025-02-14",
    totalQty: 10,
    totalValue: 12500,
    status: "Shipped",
    details: [{ name: "Keyboard", qty: 10, price: 500 }],
  },
  {
    id: "SH-2025-013",
    orderRef: "SO-2025-028",
    customer: "ABC Trading Ltd.",
    date: "2025-02-13",
    totalQty: 50,
    totalValue: 8900,
    status: "Pending",
    details: [{ name: "Mousepads", qty: 50, price: 100 }],
  },
  {
    id: "SH-2025-012",
    orderRef: "SO-2025-027",
    customer: "Quick Serve Services",
    date: "2025-02-12",
    totalQty: 5,
    totalValue: 25000,
    status: "Delivered",
    details: [{ name: "Laptop HP", qty: 5, price: 5000 }],
  },
  {
    id: "SH-2025-011",
    orderRef: "SO-2025-026",
    customer: "IT Solution Hub",
    date: "2025-02-11",
    totalQty: 15,
    totalValue: 85000,
    status: "Cancelled",
    details: [{ name: "Server Rack", qty: 1, price: 70000 }],
  },
  {
    id: "SH-2025-010",
    orderRef: "SO-2025-025",
    customer: "Furniture Mart Inc.",
    date: "2025-02-10",
    totalQty: 2,
    totalValue: 35000,
    status: "Delivered",
    details: [{ name: "Office Desk", qty: 2, price: 15000 }],
  },
  // Add more mock data for better pagination demo
  {
    id: "SH-2025-009",
    orderRef: "SO-2025-024",
    customer: "Home Office Supply",
    date: "2025-02-09",
    totalQty: 10,
    totalValue: 7500,
    status: "Shipped",
    details: [],
  },
  {
    id: "SH-2025-008",
    orderRef: "SO-2025-023",
    customer: "Clean & Clear",
    date: "2025-02-08",
    totalQty: 30,
    totalValue: 4500,
    status: "Pending",
    details: [],
  },
  {
    id: "SH-2025-007",
    orderRef: "SO-2025-022",
    customer: "Tech World Co.",
    date: "2025-02-07",
    totalQty: 8,
    totalValue: 22000,
    status: "Delivered",
    details: [],
  },
  {
    id: "SH-2025-006",
    orderRef: "SO-2025-021",
    customer: "ABC Stationery Co.",
    date: "2025-02-06",
    totalQty: 5,
    totalValue: 25500,
    status: "Delivered",
    details: [],
  },
];

export default function SalesShipmentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Data Processing ---
  const totalValueSum = mockShipments.reduce((sum, s) => sum + s.totalValue, 0);

  // --- Filter Logic ---
  const filteredShipments = mockShipments.filter((shipment) => {
    const matchesSearch =
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || shipment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const handleRowClick = (shipment: any) => {
    setSelectedShipment(shipment);
    setIsSheetOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header & Primary Action --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              รายการส่งสินค้า (Sales Shipments)
            </h1>
            <p className="text-slate-500 mt-1">
              ติดตามสถานะและจัดการคำสั่งจัดส่งสินค้าให้ลูกค้า
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/sales/shipments/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            สร้างคำสั่งจัดส่งใหม่
          </Button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Shipments"
            value={mockShipments.length}
            icon={PackageOpen}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Pending/Shipped"
            value={
              mockShipments.filter(
                (o) => o.status === "Pending" || o.status === "Shipped"
              ).length
            }
            icon={Truck}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            title="Delivered"
            value={mockShipments.filter((o) => o.status === "Delivered").length}
            icon={ClipboardCheck}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Total Value"
            value={`฿${(totalValueSum / 1000).toFixed(1)}K`}
            icon={Package}
            color="text-purple-600"
            bg="bg-purple-50"
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
                  placeholder="Search Shipment No, Order Ref, or Customer..."
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
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
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
                    <TableHead className="w-[150px] font-semibold text-slate-700 pl-6 h-12">
                      Shipment No.
                    </TableHead>
                    <TableHead className="w-[150px] font-semibold text-slate-700 h-12">
                      Order Ref.
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
                  {paginatedShipments.map((shipment) => (
                    <TableRow
                      key={shipment.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(shipment)}
                    >
                      {/* Shipment No. */}
                      <TableCell className="pl-6 py-4">
                        <span className="font-medium text-blue-600 group-hover:underline underline-offset-4">
                          {shipment.id}
                        </span>
                      </TableCell>

                      {/* Order Ref. */}
                      <TableCell className="text-slate-600 py-4">
                        {shipment.orderRef}
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="font-medium text-slate-900 py-4">
                        {shipment.customer}
                      </TableCell>

                      {/* Total Qty */}
                      <TableCell className="text-center text-slate-700 py-4">
                        {shipment.totalQty}
                      </TableCell>

                      {/* Total Value */}
                      <TableCell className="text-right font-bold text-slate-700 py-4">
                        ฿{shipment.totalValue.toLocaleString()}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-slate-500 text-sm py-4">
                        {shipment.date}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center pr-6 py-4">
                        <StatusBadge status={shipment.status} />
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
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredShipments.length
                  )}{" "}
                  of {filteredShipments.length} entries
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

      {/* --- Detail Sheet (Shipment) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedShipment && (
            <ShipmentDetailSheet shipment={selectedShipment} />
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// --- Detail Sheet Component ---
function ShipmentDetailSheet({ shipment }: { shipment: any }) {
  // Mock function to update status
  const handleUpdateStatus = (newStatus: string) => {
    if (newStatus === "Delivered") {
      alert(
        `Simulating status update: Shipment ${shipment.id} marked as Delivered.`
      );
    }
  };

  return (
    <>
      <SheetHeader className="mb-6 border-b pb-4">
        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-6 w-6 text-blue-600" />
          {shipment.id}
        </SheetTitle>
        <SheetDescription>
          Order Ref: {shipment.orderRef} | Customer: {shipment.customer}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6">
        {/* Info Block */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
          <InfoRow label="Shipment Date" value={shipment.date} />
          <InfoRow label="Customer" value={shipment.customer} />
          <InfoRow
            label="Current Status"
            value={<StatusBadge status={shipment.status} />}
          />
        </div>

        {/* Item Summary (Simple version) */}
        <div>
          <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
            <PackageOpen className="h-4 w-4" /> Items Shipped
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <div className="divide-y">
              {shipment.details && shipment.details.length > 0 ? (
                shipment.details.map((item: any, idx: number) => (
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
            <span>Total Value</span>
            <span className="text-blue-600">
              ฿{shipment.totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <SheetFooter className="mt-8 border-t pt-4">
        {shipment.status === "Shipped" && (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleUpdateStatus("Delivered")}
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Mark as Delivered
          </Button>
        )}
        {(shipment.status === "Delivered" ||
          shipment.status === "Cancelled") && (
          <div className="w-full text-center text-slate-400 text-sm italic">
            Shipment status is final.
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
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Shipped: "bg-blue-50 text-blue-700 border-blue-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const currentStyle =
    styles[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status === "Delivered" && <ClipboardCheck className="w-3 h-3 mr-1" />}
      {status === "Shipped" && <Truck className="w-3 h-3 mr-1" />}
      {status === "Pending" && <Clock3 className="w-3 h-3 mr-1" />}
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
