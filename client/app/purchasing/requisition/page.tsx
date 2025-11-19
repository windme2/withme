"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  Plus,
} from "lucide-react";
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
} from "@/components/ui/sheet";

export default function PurchaseRequisitionPage() {
  const router = useRouter();

  // --- Data States ---
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Mock Data (15 Items) ---
  const [requests, setRequests] = useState([
    {
      id: "PR-2025-015",
      itemsList: [{ name: 'Monitor 24"', sku: "IT-005", qty: 5, price: 4500 }],
      total: 22500,
      status: "Pending",
      date: "2025-01-15",
      requester: "John Doe",
    },
    {
      id: "PR-2025-014",
      itemsList: [{ name: "Office Desk", sku: "FUR-002", qty: 2, price: 3500 }],
      total: 7000,
      status: "Approved",
      date: "2025-01-14",
      requester: "Mike Johnson",
    },
    {
      id: "PR-2025-013",
      itemsList: [{ name: "Laptop Pro", sku: "IT-001", qty: 1, price: 45000 }],
      total: 45000,
      status: "Rejected",
      date: "2025-01-13",
      requester: "Sarah Smith",
    },
    {
      id: "PR-2025-012",
      itemsList: [
        { name: "File Cabinet", sku: "OFF-003", qty: 3, price: 2500 },
      ],
      total: 7500,
      status: "Approved",
      date: "2025-01-12",
      requester: "Jane Doe",
    },
    {
      id: "PR-2025-011",
      itemsList: [
        { name: "Mech Keyboard", sku: "IT-004", qty: 10, price: 1200 },
      ],
      total: 12000,
      status: "Pending",
      date: "2025-01-11",
      requester: "John Doe",
    },
    {
      id: "PR-2025-010",
      itemsList: [{ name: "Sticky Notes", sku: "PAP-002", qty: 50, price: 25 }],
      total: 1250,
      status: "Approved",
      date: "2025-01-10",
      requester: "Mike Johnson",
    },
    {
      id: "PR-2025-009",
      itemsList: [
        { name: "Whiteboard Marker", sku: "ST-001", qty: 20, price: 35 },
      ],
      total: 700,
      status: "Approved",
      date: "2025-01-09",
      requester: "Admin",
    },
    {
      id: "PR-2025-008",
      itemsList: [
        { name: "Ergonomic Chair", sku: "FUR-005", qty: 1, price: 8500 },
      ],
      total: 8500,
      status: "Pending",
      date: "2025-01-08",
      requester: "Sarah Smith",
    },
    {
      id: "PR-2025-007",
      itemsList: [{ name: "USB-C Hub", sku: "IT-009", qty: 5, price: 1200 }],
      total: 6000,
      status: "Rejected",
      date: "2025-01-07",
      requester: "Jane Doe",
    },
    {
      id: "PR-2025-006",
      itemsList: [
        { name: "A4 Paper (Box)", sku: "PAP-001", qty: 10, price: 550 },
      ],
      total: 5500,
      status: "Approved",
      date: "2025-01-06",
      requester: "Admin",
    },
    {
      id: "PR-2025-005",
      itemsList: [
        { name: "Coffee Beans 1kg", sku: "PAN-002", qty: 4, price: 450 },
      ],
      total: 1800,
      status: "Pending",
      date: "2025-01-05",
      requester: "Mike Johnson",
    },
    {
      id: "PR-2025-004",
      itemsList: [
        { name: "HDMI Cable 3m", sku: "IT-012", qty: 10, price: 250 },
      ],
      total: 2500,
      status: "Approved",
      date: "2025-01-04",
      requester: "IT Support",
    },
    {
      id: "PR-2025-003",
      itemsList: [
        { name: "Safety Helmet", sku: "SAF-001", qty: 15, price: 350 },
      ],
      total: 5250,
      status: "Approved",
      date: "2025-01-03",
      requester: "Site Manager",
    },
    {
      id: "PR-2025-002",
      itemsList: [
        { name: "Extension Cord", sku: "ELE-003", qty: 8, price: 180 },
      ],
      total: 1440,
      status: "Pending",
      date: "2025-01-02",
      requester: "John Doe",
    },
    {
      id: "PR-2025-001",
      itemsList: [
        { name: "Wireless Mouse", sku: "IT-002", qty: 3, price: 450 },
      ],
      total: 1350,
      status: "Approved",
      date: "2025-01-01",
      requester: "Sarah Smith",
    },
  ]);

  // --- Helpers ---
  const processedRequests = requests.map((req) => {
    const itemsSummary = req.itemsList.map((i) => i.name).join(", ");
    return { ...req, itemsSummary };
  });

  // --- Filter Logic ---
  const filteredRequests = processedRequests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.itemsSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requester.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // --- Handlers ---
  const handleRowClick = (req: any) => {
    setSelectedRequest(req);
    setIsSheetOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  // Calculate Stats
  const pendingCount = requests.filter((i) => i.status === "Pending").length;
  const approvedCount = requests.filter((i) => i.status === "Approved").length;
  const rejectedCount = requests.filter((i) => i.status === "Rejected").length;

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Purchase Requisitions (PR)
            </h1>
            <p className="text-slate-500 mt-1">สร้างและจัดการใบขอซื้อสินค้า</p>
          </div>

          {/* New Request Button */}
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/purchasing/requisition/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Requests"
            value={requests.length}
            icon={FileText}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Pending"
            value={pendingCount}
            icon={Clock}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            title="Approved"
            value={approvedCount}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Rejected"
            value={rejectedCount}
            icon={XCircle}
            color="text-red-600"
            bg="bg-red-50"
          />
        </div>

        {/* --- Main Table Card --- */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2"></CardHeader>
          <CardContent>
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search PR No, Item or Requester..."
                  className="pl-10 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || filterStatus !== "all") && (
                  <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="h-4 w-4 text-slate-500" />
                  </Button>
                )}
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    {/* Header cells: Added h-12 for height, pl-6/pr-6 for ends */}
                    <TableHead className="w-[150px] font-semibold text-slate-700 pl-6 h-12">
                      PR No.
                    </TableHead>
                    <TableHead className="min-w-[200px] font-semibold text-slate-700 h-12">
                      Item Description
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 h-12">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 pl-8 h-12">
                      Requester By
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
                  {paginatedRequests.map((req) => (
                    <TableRow
                      key={req.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(req)}
                    >
                      {/* Body cells: Added py-4 for vertical padding */}

                      {/* PR No. */}
                      <TableCell className="pl-6 py-4">
                        <span className="font-medium text-blue-600 group-hover:underline underline-offset-4">
                          {req.id}
                        </span>
                      </TableCell>

                      {/* Item Description */}
                      <TableCell className="font-medium text-slate-900 py-4">
                        <div className="flex items-center gap-2">
                          {req.itemsSummary}
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-medium text-slate-700 py-4">
                        ฿{req.total.toLocaleString()}
                      </TableCell>

                      {/* Requester By */}
                      <TableCell className="pl-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                            {req.requester.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-600">
                            {req.requester}
                          </span>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-slate-500 text-sm whitespace-nowrap py-4">
                        {req.date}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center pr-6 py-4">
                        <StatusBadge status={req.status} />
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
                  {Math.min(startIndex + itemsPerPage, filteredRequests.length)}{" "}
                  of {filteredRequests.length} entries
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

      {/* --- Detail Sheet (View Only) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
          {selectedRequest && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Request Details
                </SheetTitle>
                <SheetDescription>Review details.</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Info Block */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">PR Number</span>
                    <span className="font-medium text-slate-900">
                      {selectedRequest.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Date</span>
                    <span className="font-medium text-slate-900">
                      {selectedRequest.date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Status</span>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <PackageOpen className="h-4 w-4" /> Requested Items
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b grid grid-cols-12 gap-2">
                      <div className="col-span-6">Item / SKU</div>
                      <div className="col-span-2 text-right">Qty</div>
                      <div className="col-span-4 text-right">Total</div>
                    </div>
                    <div className="divide-y max-h-[300px] overflow-y-auto">
                      {selectedRequest.itemsList.map(
                        (item: any, idx: number) => (
                          <div
                            key={idx}
                            className="px-4 py-3 text-sm grid grid-cols-12 gap-2 items-center"
                          >
                            {/* Column 1: Name & SKU */}
                            <div className="col-span-6">
                              <div className="font-medium text-slate-900">
                                {item.name}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">
                                {item.sku}
                              </div>
                            </div>

                            {/* Column 2: Quantity */}
                            <div className="col-span-2 text-right text-slate-600">
                              {item.qty}
                            </div>

                            {/* Column 3: Total Price */}
                            <div className="col-span-4 text-right font-medium text-slate-900">
                              ฿{(item.price * item.qty).toLocaleString()}
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Grand Total Footer */}
                    <div className="bg-slate-50 p-3 border-t flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">
                        Grand Total
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ฿{selectedRequest.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requester Info */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">
                    Requester Info
                  </h4>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {selectedRequest.requester.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {selectedRequest.requester}
                      </div>
                      <div className="text-xs text-slate-500">Staff Member</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// --- Sub-components ---

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
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };
  const currentStyle =
    styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status === "Approved" && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === "Pending" && <Clock className="w-3 h-3 mr-1" />}
      {status === "Rejected" && <XCircle className="w-3 h-3 mr-1" />}
      {status}
    </span>
  );
}
