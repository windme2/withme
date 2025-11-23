"use client";

import { useState, useEffect } from "react";
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
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  PackageOpen,
} from "lucide-react";
import { goodsReceivedApi } from "@/lib/api";
import type { StatCardProps } from "@/lib/types";

export default function GoodsReceivedPage() {
  const router = useRouter();
  const [grnList, setGrnList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    thisMonth: 0,
    pending: 0,
    totalValue: 0
  });
  const [selectedGRN, setSelectedGRN] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [data, statsData] = await Promise.all([
          goodsReceivedApi.getAll(filterStatus, searchTerm),
          goodsReceivedApi.getStats(),
        ]);
        setGrnList(data);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching goods received data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filterStatus, searchTerm]);

  // Filtering Logic
  const filteredData = grnList;

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  // Row Click Handler
  const handleRowClick = async (grn: any) => {
    try {
      const detailData = await goodsReceivedApi.getOne(grn.id);
      setSelectedGRN(detailData);
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Error fetching GRN details:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Goods Received Notes (GRN)
            </h1>
            <p className="text-slate-500 mt-1">
              รายการรับสินค้าเข้าคลังและตรวจสอบประวัติย้อนหลัง
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/inventory/goods-received/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New GRN
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total GRNs"
            value={stats.total}
            icon={FileText}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="This Month"
            value={stats.thisMonth}
            icon={Calendar}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            title="Total Value"
            value={`฿${(stats.totalValue / 1000).toFixed(0)}k`}
            icon={Truck}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>

        {/* Main Content: Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* Toolbar: Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search GRN Number, PO or Supplier..."
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-semibold text-slate-700 pl-6 h-12 w-[150px]">
                          GRN No.
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 h-12 w-[120px]">
                          PO Ref.
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 h-12 w-[120px]">
                          Date
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 h-12 min-w-[150px]">
                          Supplier
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 h-12 w-[100px]">
                          Items Qty.
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 h-12 w-[150px]">
                          Amount
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 pr-6 h-12 w-[120px]">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((grn) => (
                        <TableRow
                          key={grn.id}
                          className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                          onClick={() => handleRowClick(grn)}
                        >
                          <TableCell className="font-medium text-blue-600 pl-6 py-4">
                            {grn.id}
                          </TableCell>
                          <TableCell className="text-slate-600 py-4">
                            {grn.poRef}
                          </TableCell>
                          <TableCell className="text-slate-500 py-4">
                            {grn.date}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 py-4">
                            {grn.supplier}
                          </TableCell>
                          <TableCell className="text-center text-slate-700 py-4">
                            {grn.totalItems}
                          </TableCell>
                          <TableCell className="text-right font-medium py-4">
                            ฿{grn.totalValue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center pr-6 py-4">
                            <StatusBadge status={grn.status} />
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
                      {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                      {filteredData.length} entries
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Sheet (GRN) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedGRN && (
            <GRNDetailSheetContent
              grn={selectedGRN}
              setIsSheetOpen={setIsSheetOpen}
            />
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// Detail Sheet Component
function GRNDetailSheetContent({
  grn,
}: {
  grn: any;
  setIsSheetOpen: (open: boolean) => void;
}) {
  const vatRate = 0.07;
  const subtotal = grn.totalValue / (1 + vatRate);
  const vatAmount = grn.totalValue - subtotal;

  const detailItems =
    grn.details && grn.details.length > 0
      ? grn.details
      : [
        { name: "Notebook A4", qty: 100, price: 45, unit: "เล่ม" },
        { name: "Stapler Heavy Duty", qty: 10, price: 150, unit: "ชิ้น" },
        { name: "A4 Paper 80gsm", qty: 50, price: 25, unit: "รีม" },
      ];

  return (
    <>
      <SheetHeader className="mb-6 border-b pb-4">
        <div className="flex justify-between items-start w-full">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            {grn.id}
          </SheetTitle>
        </div>
      </SheetHeader>

      <div className="space-y-6">
        {/* Info Block */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
          <InfoRow label="PO Reference" value={grn.poRef} />
          <InfoRow label="Received By" value={grn.receivedBy} />
          <InfoRow label="Status" value={<StatusBadge status={grn.status} />} />
        </div>

        {/* Received Items List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <PackageOpen className="h-4 w-4" /> Received Items
            </h4>
          </div>
          <div className="divide-y border rounded-lg overflow-hidden">
            {detailItems.map((item: any, idx: number) => (
              <div
                key={idx}
                className="px-4 py-3 flex justify-between items-center text-sm"
              >
                <div>
                  <div className="font-medium text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ฿{item.price} / {item.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {item.qty.toLocaleString()} {item.unit}
                  </div>
                  <div className="text-xs text-slate-500">
                    รวม ฿{(item.qty * item.price).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="space-y-3 pt-2">
          <h4 className="font-medium text-slate-900 text-sm tracking-wide mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-600" /> Summary
          </h4>

          <div className="divide-y border rounded-lg overflow-hidden">
            <div className="px-4 py-2 flex justify-between items-center text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-900">
                {`฿${subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              </span>
            </div>
            <div className="px-4 py-2 flex justify-between items-center text-sm">
              <span className="text-slate-500">VAT (7%)</span>
              <span className="font-medium text-slate-900">
                {`฿${vatAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              </span>
            </div>
            <div className="px-4 py-3 flex justify-between font-bold text-lg border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-blue-600">
                ฿{grn.totalValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet Footer */}
      <SheetFooter className="mt-8 border-t pt-4">
        {grn.status === "Completed" && (
          <div className="w-full text-center text-slate-400 text-sm italic flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Receipt Completed
          </div>
        )}
        {grn.status === "Pending" && (
          <div className="w-full text-center text-amber-500 text-sm italic flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Action
          </div>
        )}
      </SheetFooter>
    </>
  );
}

// Sub-Components
function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
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
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const currentStyle =
    styles[status] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === "Pending" && <Clock className="w-3 h-3 mr-1" />}
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
