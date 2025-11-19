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
  Calendar,
  PackageOpen,
  X,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// --- Mock Data ---
const mockOrders = [
  {
    id: "SO-2025-030",
    customer: "Global Retail Co.",
    contactPerson: "Jane Smith",
    date: "2025-02-15",
    dueDate: "2025-02-20",
    totalQty: 25,
    totalValue: 55000,
    status: "Confirmed",
    items: [
      { name: 'Monitor 24"', sku: "IT-001", qty: 5, price: 4500, unit: "ชิ้น" },
      { name: "HDMI Cable 2m", sku: "CAB-001", qty: 20, price: 250, unit: "เส้น" },
    ],
  },
  {
    id: "SO-2025-029",
    customer: "Local Tech Shop",
    contactPerson: "Mike Johnson",
    date: "2025-02-14",
    dueDate: "2025-02-19",
    totalQty: 50,
    totalValue: 25000,
    status: "Draft",
    items: [
      { name: "Keyboard", sku: "IT-005", qty: 10, price: 500, unit: "ชิ้น" },
      { name: "Mouse Wireless", sku: "IT-006", qty: 40, price: 500, unit: "ชิ้น" },
    ],
  },
  {
    id: "SO-2025-028",
    customer: "ABC Trading Ltd.",
    contactPerson: "Sarah Wilson",
    date: "2025-02-13",
    dueDate: "2025-02-18",
    totalQty: 100,
    totalValue: 8900,
    status: "Shipped",
    items: [
      { name: "Mousepads", sku: "ACC-001", qty: 100, price: 89, unit: "ชิ้น" },
    ],
  },
  {
    id: "SO-2025-027",
    customer: "Quick Serve Services",
    contactPerson: "David Lee",
    date: "2025-02-12",
    dueDate: "2025-02-17",
    totalQty: 5,
    totalValue: 25000,
    status: "Completed",
    items: [
      { name: "Laptop HP", sku: "IT-010", qty: 5, price: 5000, unit: "ชิ้น" },
    ],
  },
  {
    id: "SO-2025-026",
    customer: "IT Solution Hub",
    contactPerson: "Anna Chen",
    date: "2025-02-11",
    dueDate: "2025-02-16",
    totalQty: 1,
    totalValue: 85000,
    status: "Cancelled",
    items: [
      { name: "Server Rack", sku: "IT-020", qty: 1, price: 85000, unit: "ชุด" },
    ],
  },
  {
    id: "SO-2025-025",
    customer: "Global Retail Co.",
    contactPerson: "Jane Smith",
    date: "2025-02-10",
    dueDate: "2025-02-15",
    totalQty: 200,
    totalValue: 24000,
    status: "Confirmed",
    items: [
      { name: "A4 Paper 80gsm", sku: "SKU001", qty: 200, price: 120, unit: "รีม" },
    ],
  },
  {
    id: "SO-2025-024",
    customer: "Furniture Mart Inc.",
    contactPerson: "Emily Wong",
    date: "2025-02-09",
    dueDate: "2025-02-14",
    totalQty: 10,
    totalValue: 45000,
    status: "Shipped",
    items: [
      { name: "Office Chair", sku: "FUR-001", qty: 10, price: 4500, unit: "ตัว" },
    ],
  },
  {
    id: "SO-2025-023",
    customer: "Local Tech Shop",
    contactPerson: "Mike Johnson",
    date: "2025-02-08",
    dueDate: "2025-02-13",
    totalQty: 30,
    totalValue: 13500,
    status: "Completed",
    items: [
      { name: "USB-C Cable", sku: "CAB-002", qty: 30, price: 450, unit: "เส้น" },
    ],
  },
  {
    id: "SO-2025-022",
    customer: "ABC Trading Ltd.",
    contactPerson: "Sarah Wilson",
    date: "2025-02-07",
    dueDate: "2025-02-12",
    totalQty: 15,
    totalValue: 67500,
    status: "Confirmed",
    items: [
      { name: "Webcam 1080p", sku: "IT-003", qty: 15, price: 4500, unit: "ชิ้น" },
    ],
  },
  {
    id: "SO-2025-021",
    customer: "Quick Serve Services",
    contactPerson: "David Lee",
    date: "2025-02-06",
    dueDate: "2025-02-11",
    totalQty: 50,
    totalValue: 7500,
    status: "Draft",
    items: [
      { name: "Blue Ink Pen", sku: "SKU002", qty: 50, price: 150, unit: "แพ็ค" },
    ],
  },
];

export default function SalesOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Stats Calculation ---
  const totalOrders = mockOrders.length;
  const draftOrders = mockOrders.filter((o) => o.status === "Draft").length;
  const confirmedOrders = mockOrders.filter((o) => o.status === "Confirmed").length;
  const totalValue = mockOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalValue, 0);

  // --- Filter Logic ---
  const filteredOrders = mockOrders.filter((order) => {
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

  const handleRowClick = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const handleConfirmOrder = () => {
    if (selectedOrder?.status === "Draft") {
      toast.success(`ยืนยัน Sales Order ${selectedOrder.id} เรียบร้อย!`);
      setIsSheetOpen(false);
    }
  };

  const handleCancelOrder = () => {
    if (selectedOrder) {
      toast.error(`ยกเลิก Sales Order ${selectedOrder.id}`);
      setIsSheetOpen(false);
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
                  {paginatedOrders.map((order) => (
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
                  ))}
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
                  Ordered on {selectedOrder.date} • Due {selectedOrder.dueDate}
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
                  <InfoRow label="Due Date" value={selectedOrder.dueDate} />
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
                  <InfoRow label="Contact Person" value={selectedOrder.contactPerson} />
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
                    {selectedOrder.items.map((item, idx) => (
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
                    onClick={() => {
                      toast.success("เตรียมจัดส่งสินค้า");
                      setIsSheetOpen(false);
                    }}
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
