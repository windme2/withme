"use client";

import { useState, useEffect } from "react";
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
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  PackageOpen,
  X,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { salesOrdersApi } from "@/lib/api";

export default function SalesOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await salesOrdersApi.getAll(filterStatus, searchTerm);
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch sales orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- Stats Calculation ---
  const totalOrders = orders.length;
  const draftOrders = orders.filter((o) => o.status === "Draft").length;
  const confirmedOrders = orders.filter((o) => o.status === "Confirmed").length;
  const totalValue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalValue, 0);

  // --- Filter Logic ---
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const handleRowClick = async (order: any) => {
    try {
      const details = await salesOrdersApi.getOne(order.id);
      setSelectedOrder(details);
      setIsSheetOpen(true);
    } catch (error) {
      toast.error("Failed to fetch order details");
    }
  };

  const handleConfirmOrder = async () => {
    if (selectedOrder?.status === "Draft") {
      try {
        await salesOrdersApi.updateStatus(selectedOrder.id, "confirmed");
        toast.success(`ยืนยัน Sales Order ${selectedOrder.id} เรียบร้อย!`);
        setIsSheetOpen(false);
        fetchOrders();
      } catch (error) {
        toast.error("Failed to confirm order");
      }
    }
  };

  const handleCancelOrder = async () => {
    if (selectedOrder) {
      try {
        await salesOrdersApi.updateStatus(selectedOrder.id, "cancelled");
        toast.error(`ยกเลิก Sales Order ${selectedOrder.id}`);
        setIsSheetOpen(false);
        fetchOrders();
      } catch (error) {
        toast.error("Failed to cancel order");
      }
    }
  };

  const handleShipOrder = async () => {
    if (selectedOrder?.status === "Confirmed") {
      try {
        await salesOrdersApi.updateStatus(selectedOrder.id, "shipped");
        toast.success("เตรียมจัดส่งสินค้า");
        setIsSheetOpen(false);
        fetchOrders();
      } catch (error) {
        toast.error("Failed to ship order");
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Sales Orders
            </h1>
            <p className="text-slate-500 mt-1">
              จัดการคำสั่งขายและติดตามสถานะการจัดส่งสินค้า
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/sales/orders/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sales Order
          </Button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Sales"
            value={`฿${totalValue.toLocaleString()}`}
            icon={DollarSign}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Total Orders"
            value={totalOrders.toString()}
            icon={ShoppingCart}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatCard
            title="Draft Orders"
            value={draftOrders.toString()}
            icon={Clock}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            title="Confirmed Orders"
            value={confirmedOrders.toString()}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
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
                  placeholder="Search by SO No. or Customer..."
                  className="pl-10 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-[160px] border-slate-200">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || filterStatus !== "all") && (
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
                    <TableHead className="font-semibold text-slate-700 pl-6 h-12 w-[140px]">
                      Order No.
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12 w-[100px]">
                      Order Date
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12 min-w-[180px]">
                      Customer
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 h-12 w-[100px]">
                      Quantity
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 h-12 w-[120px]">
                      Total Amount
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 h-12 w-[120px]">
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
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(order)}
                      >
                        <TableCell className="font-medium text-blue-600 pl-6 py-4">
                          {order.id}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm py-4">
                          {order.date}
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <div className="font-medium text-slate-900">{order.customer}</div>
                            <div className="text-xs text-slate-500">{order.contactPerson}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-900 py-4">
                          {order.totalQty}
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 py-4">
                          ฿{order.totalValue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <StatusBadge status={order.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* --- Pagination Footer --- */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  แสดง {startIndex + 1} ถึง{" "}
                  {Math.min(startIndex + itemsPerPage, filteredOrders.length)} จาก{" "}
                  {filteredOrders.length} รายการ
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 text-slate-600"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> ก่อนหน้า
                  </Button>
                  <span className="text-sm font-medium text-slate-700">
                    หน้า {currentPage} จาก {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 text-slate-600"
                  >
                    ถัดไป <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Sales Order Detail Sheet --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Sales Order Details: {selectedOrder.id}
                </SheetTitle>
                <SheetDescription>
                  Ordered on {selectedOrder.date} • Due {selectedOrder.dueDate || 'N/A'}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Order Information */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Order Information
                  </h4>
                  <InfoRow label="SO No." value={selectedOrder.id} />
                  <InfoRow label="Order Date" value={selectedOrder.date} />
                  <InfoRow label="Due Date" value={selectedOrder.dueDate || 'N/A'} />
                  <InfoRow
                    label="Status"
                    value={<StatusBadge status={selectedOrder.status} />}
                  />
                </div>

                {/* Customer Information */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <User className="h-4 w-4" /> Customer Information
                  </h4>
                  <InfoRow label="Company Name" value={selectedOrder.customer} />
                  <InfoRow label="Contact Person" value={selectedOrder.contactPerson || '-'} />
                  {selectedOrder.email && <InfoRow label="Email" value={selectedOrder.email} />}
                  {selectedOrder.phone && <InfoRow label="Phone" value={selectedOrder.phone} />}
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Financial Summary
                  </h4>
                  <InfoRow
                    label="Total Quantity"
                    value={`${selectedOrder.totalQty} items`}
                  />
                  <InfoRow
                    label="Total Value"
                    value={`฿${selectedOrder.totalValue.toLocaleString()}`}
                    valueColor="text-blue-600 font-bold text-lg"
                  />
                </div>

                {/* Order Items List */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <PackageOpen className="h-4 w-4" /> รายการสินค้า
                  </h4>
                  <div className="border rounded-lg overflow-hidden divide-y">
                    {selectedOrder.items && selectedOrder.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 text-sm">
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              SKU: {item.sku} • ฿{item.price} / {item.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">
                              {item.qty} {item.unit}
                            </div>
                            <div className="text-xs text-slate-500">
                              รวม ฿{(item.qty * item.price).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6 border-t pt-4">
                {selectedOrder.status === "Draft" ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancelOrder}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      ยกเลิก
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleConfirmOrder}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      ยืนยันคำสั่งซื้อ
                    </Button>
                  </div>
                ) : selectedOrder.status === "Confirmed" ? (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleShipOrder}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    จัดส่งสินค้า
                  </Button>
                ) : (
                  <div className="w-full text-center text-slate-400 text-sm italic flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {selectedOrder.status === "Completed"
                      ? "สำเร็จแล้ว"
                      : selectedOrder.status === "Shipped"
                        ? "จัดส่งแล้ว"
                        : "ยกเลิกแล้ว"}
                  </div>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// --- Sub-Components ---

function StatCard({ title, value, icon: Icon, color, bg }: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
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
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    Draft: { bg: "bg-slate-50", text: "text-slate-700", icon: Clock },
    Confirmed: { bg: "bg-blue-50", text: "text-blue-700", icon: CheckCircle2 },
    Shipped: { bg: "bg-purple-50", text: "text-purple-700", icon: Truck },
    Completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
    Cancelled: { bg: "bg-red-50", text: "text-red-700", icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.Draft;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 font-medium border-0 ${config.bg} ${config.text} ring-1 ring-inset ring-${config.text.replace("text-", "")}/20`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {status}
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
    <div className="flex justify-between items-center py-1 border-b border-slate-100/50 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}
