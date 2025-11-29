"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, RotateCcw, Clock, CheckCircle2, XCircle, User, FileText, DollarSign, PackageOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { returnsApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

export default function SalesReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Stats
  const totalReturns = returns.length;
  const pendingReturns = returns.filter((r) => r.status === "Pending").length;
  const approvedReturns = returns.filter((r) => r.status === "Approved" || r.status === "Completed").length;
  const rejectedReturns = returns.filter((r) => r.status === "Rejected").length;

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const data = await returnsApi.getAll(statusFilter, search);
      setReturns(data);
    } catch (error) {
      toast.error("Failed to load returns");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchReturns();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter]);

  // Filter Logic
  const filteredReturns = returns.filter((ret) => {
    const matchesSearch =
      ret.returnNumber?.toLowerCase().includes(search.toLowerCase()) ||
      ret.soNumber?.toLowerCase().includes(search.toLowerCase()) ||
      ret.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ret.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReturns = filteredReturns.slice(startIndex, startIndex + itemsPerPage);

  // Handle row click
  const handleRowClick = async (ret: any) => {
    try {
      const details = await returnsApi.getOne(ret.id);
      setSelectedReturn(details);
      setIsSheetOpen(true);
    } catch (error) {
      console.error("Failed to fetch return details:", error);
      toast.error("Failed to load return details");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sales Returns</h1>
            <p className="text-slate-500 mt-1">ติดตามรายการคืนสินค้า</p>
          </div>
          <Button
            onClick={() => router.push("/sales/returns/new")}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Return
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Returns"
            value={totalReturns}
            icon={RotateCcw}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Pending"
            value={pendingReturns}
            icon={Clock}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            title="Approved"
            value={approvedReturns}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Rejected"
            value={rejectedReturns}
            icon={XCircle}
            color="text-red-600"
            bg="bg-red-50"
          />
        </div>

        {/* Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* Filters - Inside Card like other pages */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search returns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/80">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="font-semibold text-slate-700 pl-6">Return No.</TableHead>
                    <TableHead className="font-semibold text-slate-700">Return Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">SO Number</TableHead>
                    <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Total Qty</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Total Amount</TableHead>
                    <TableHead className="text-center font-semibold text-slate-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span>Loading returns...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                        No returns found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReturns.map((ret) => (
                      <TableRow
                        key={ret.id}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(ret)}
                      >
                        <TableCell className="font-medium pl-6 py-4">
                          <span className="text-blue-600 font-medium">
                            {ret.returnNumber || ret.id}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm py-4">
                          {ret.returnDate || ret.date}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-slate-700 font-medium">{ret.soNumber}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <div className="font-medium text-slate-900">{ret.customerName}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-900 py-4">
                          {ret.totalQty || ret.totalQuantity || 0}
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 py-4">
                          ฿{(ret.totalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <ReturnStatusBadge status={ret.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 px-6 pb-6 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  แสดง {startIndex + 1} ถึง{" "}
                  {Math.min(startIndex + itemsPerPage, filteredReturns.length)} จาก{" "}
                  {filteredReturns.length} รายการ
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

      {/* Return Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedReturn && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-red-600" />
                  Sales Returns
                </SheetTitle>
                <SheetDescription>
                  Review details for {selectedReturn.returnNumber || selectedReturn.id}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Return Information */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <InfoRow label="Return No." value={selectedReturn?.returnNumber || selectedReturn?.id || '-'} />
                  <InfoRow label="Return Date" value={selectedReturn?.returnDate || selectedReturn?.date || '-'} />
                  <InfoRow label="SO Number" value={selectedReturn?.soNumber || '-'} />
                  <InfoRow label="Reason" value={selectedReturn?.reason || 'N/A'} />
                  <InfoRow
                    label="Status"
                    value={<ReturnStatusBadge status={selectedReturn.status} />}
                  />
                </div>

                {/* Customer Information */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <InfoRow label="Customer " value={selectedReturn?.customerName || '-'} />
                  {selectedReturn?.customerEmail && <InfoRow label="Email" value={selectedReturn.customerEmail} />}
                  {selectedReturn?.customerPhone && <InfoRow label="Phone" value={selectedReturn.customerPhone} />}
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">

                  <InfoRow
                    label="Total Quantity"
                    value={`${selectedReturn?.totalQty || selectedReturn?.totalQuantity || 0} items`}
                  />
                  <InfoRow
                    label="Refund Amount"
                    value={`฿${(selectedReturn?.totalAmount || 0).toLocaleString()}`}
                    valueColor="text-red-600 font-bold text-lg"
                  />
                </div>

                {/* Return Items List */}
                <div>
                  <div className="border rounded-lg overflow-hidden divide-y">
                    {selectedReturn?.items && selectedReturn.items.length > 0 ? selectedReturn.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 text-sm">
                              {item.productName || item.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              SKU: {item.sku} • ฿{item.price || item.unitPrice} / {item.unit}
                            </div>
                            {item.reason && (
                              <div className="text-xs text-red-600 mt-1">
                                Reason: {item.reason}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">
                              {item.quantity || item.qty} {item.unit}
                            </div>
                            <div className="text-xs text-slate-500">
                              ฿{((item.quantity || item.qty) * (item.price || item.unitPrice || 0)).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="px-4 py-8 text-center text-slate-500">
                        No items found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6 border-t pt-4">
                <div className="w-full text-center text-slate-400 text-sm italic flex items-center justify-center gap-2">
                  {selectedReturn.status === "Approved" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">อนุมัติแล้ว</span>
                    </>
                  ) : selectedReturn.status === "Rejected" ? (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">ปฏิเสธแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-600">รอการอนุมัติ</span>
                    </>
                  )}
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// Sub-Components
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

function ReturnStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    Pending: { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
    Approved: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
    Rejected: { bg: "bg-red-50", text: "text-red-700", icon: XCircle },
    Completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={`${config.bg} ${config.text} border-0 font-medium px-3 py-1 flex items-center gap-1.5 w-fit`}
    >
      <Icon className="h-3 w-3" />
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
    <div className="flex justify-between items-start text-sm">
      <span className="text-slate-600 font-medium">{label}:</span>
      <span className={`font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}
