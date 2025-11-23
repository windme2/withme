"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  FileText,
  X,
  Printer,
  Download,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  AlertCircle,
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
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { purchaseOrdersApi } from "@/lib/api";
import type { StatCardProps } from "@/lib/types";

export default function PurchaseOrderPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await purchaseOrdersApi.getAll();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch purchase orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- Data Processing ---
  // Backend returns amount, date, id, prRef, status, supplier.
  // We need to calculate totalQty if not provided, but backend findAll doesn't provide items.
  // So we might show '-' for Qty in list or update backend to return it.
  // For now, let's assume backend doesn't return qty in list.

  // --- Filter Logic ---
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.prRef && order.prRef.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const handleRowClick = async (order: any) => {
    try {
      const details = await purchaseOrdersApi.getOne(order.id);
      setSelectedOrder(details);
      setIsSheetOpen(true);
    } catch (error) {
      toast.error("Failed to fetch order details");
    }
  };

  // --- Feature: Print PO ---
  const handlePrint = () => {
    if (!selectedOrder) return;
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write("<html><head><title>Purchase Order</title>");
      printWindow.document.write(
        "<style>body{font-family:sans-serif; padding: 20px;} table{width:100%; border-collapse:collapse;} th, td{border:1px solid #ddd; padding:8px; text-align:left;} .text-right{text-align:right;}</style>"
      );
      printWindow.document.write("</head><body>");
      printWindow.document.write(
        `<h1>Purchase Order: ${selectedOrder.id}</h1>`
      );
      printWindow.document.write(
        `<p><strong>Supplier:</strong> ${selectedOrder.supplier.name}</p>`
      );
      printWindow.document.write(
        `<p><strong>Date:</strong> ${selectedOrder.date}</p>`
      );
      printWindow.document.write(
        `<p><strong>PR Ref.:</strong> ${selectedOrder.prRef || '-'}</p>`
      );
      printWindow.document.write(
        '<br/><table><thead><tr><th>Item</th><th>Qty</th><th class="text-right">Total</th></tr></thead><tbody>'
      );
      selectedOrder.items.forEach((item: any) => {
        printWindow.document.write(
          `<tr><td>${item.productName}</td><td>${item.quantity
          }</td><td class="text-right">฿${(
            item.totalPrice
          ).toLocaleString()}</td></tr>`
        );
      });
      printWindow.document.write("</tbody></table>");
      printWindow.document.write(
        `<h3 class="text-right">Grand Total: ฿${selectedOrder.totalAmount.toLocaleString()}</h3>`
      );
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  // --- Feature: Download File ---
  const handleDownload = () => {
    if (!selectedOrder) return;
    const content = `PO Number: ${selectedOrder.id}\nSupplier: ${selectedOrder.supplier.name}\nDate: ${selectedOrder.date}\nTotal: ${selectedOrder.totalAmount}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedOrder.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File downloaded successfully");
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Purchase Orders (PO)
            </h1>
            <p className="text-slate-500 mt-1">
              สร้างและจัดการใบสั่งซื้อสินค้า
            </p>
          </div>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/purchasing/orders/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New PO
          </Button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={FileText}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Sent"
            value={orders.filter((o) => o.status === "Sent").length}
            icon={Truck}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            title="Completed"
            value={orders.filter((o) => o.status === "Completed").length}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Total Value"
            value={`฿${(orders.reduce((sum, o) => sum + o.amount, 0) / 1000).toFixed(1)}k`}
            icon={FileText}
            color="text-purple-600"
            bg="bg-purple-50"
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
                  placeholder="Search PO No, Supplier or PR Ref..."
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
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Partially Received">Partially Received</SelectItem>
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

            {/* Data Table - Added Padding */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[140px] font-semibold text-slate-700 pl-6 h-12">
                      PO No.
                    </TableHead>
                    <TableHead className="w-[140px] font-semibold text-slate-700 h-12">
                      PR Ref.
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12">
                      Supplier
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 h-12">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 pl-6 h-12">
                      Date
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 pr-6 h-12">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                        onClick={() => handleRowClick(order)}
                      >
                        {/* PO No. */}
                        <TableCell className="pl-6 py-4">
                          <span className="font-medium text-blue-600 group-hover:underline underline-offset-4">
                            {order.id}
                          </span>
                        </TableCell>

                        {/* PR Ref. */}
                        <TableCell className="text-slate-600 font-medium py-4">
                          {order.prRef}
                        </TableCell>

                        {/* Supplier */}
                        <TableCell className="font-medium text-slate-900 py-4">
                          {order.supplier}
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-right font-bold text-slate-700 py-4">
                          ฿{order.amount.toLocaleString()}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-slate-500 text-sm pl-6 whitespace-nowrap py-4">
                          {order.date}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center pr-6 py-4">
                          <StatusBadge status={order.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 gap-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(startIndex + itemsPerPage, filteredOrders.length)}{" "}
                  of {filteredOrders.length} entries
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

      {/* --- Detail Sheet --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Order Details
                </SheetTitle>
                <SheetDescription>Purchase Order Information</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">PO Number</span>
                    <span className="font-medium text-slate-900">
                      {selectedOrder.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">PR Reference</span>
                    <span className="font-medium text-slate-900">
                      {selectedOrder.prRef || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Date</span>
                    <span className="font-medium text-slate-900">
                      {selectedOrder.date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Status</span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-3">
                    Supplier Information
                  </h4>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-lg">
                      {selectedOrder.supplier.name}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {selectedOrder.supplier.address || 'No address provided'}
                      <br />
                      Tax ID: {selectedOrder.supplier.tax_id || '-'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <PackageOpen className="h-4 w-4" /> Ordered Items
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b grid grid-cols-12 gap-2">
                      <div className="col-span-6">Item</div>
                      <div className="col-span-2 text-right">Qty</div>
                      <div className="col-span-4 text-right">Total</div>
                    </div>
                    <div className="divide-y max-h-[300px] overflow-y-auto">
                      {selectedOrder.items &&
                        selectedOrder.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="px-4 py-3 text-sm grid grid-cols-12 gap-2 items-center"
                          >
                            <div className="col-span-6">
                              <div className="font-medium text-slate-900">
                                {item.productName}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">
                                {item.sku}
                              </div>
                            </div>
                            <div className="col-span-2 text-right text-slate-600">
                              {item.quantity}
                            </div>
                            <div className="col-span-4 text-right font-medium text-slate-900">
                              ฿{item.totalPrice.toLocaleString()}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="bg-slate-50 p-3 border-t flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">
                        Grand Total
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ฿{selectedOrder.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-8 border-t pt-4">
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4" /> Print PO
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// --- Sub-Components ---

function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
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
    Draft: "bg-slate-50 text-slate-700 border-slate-200",
    Sent: "bg-blue-50 text-blue-700 border-blue-200",
    "Partially Received": "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const currentStyle =
    styles[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === "Sent" && <Truck className="w-3 h-3 mr-1" />}
      {status === "Partially Received" && <Clock className="w-3 h-3 mr-1" />}
      {status === "Draft" && <FileText className="w-3 h-3 mr-1" />}
      {status === "Cancelled" && <XCircle className="w-3 h-3 mr-1" />}
      {status}
    </span>
  );
}
