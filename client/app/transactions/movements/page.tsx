"use client";

import { useState, useEffect } from "react";
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
  ClipboardList,
  ArrowUpRight,
  ArrowDownLeft,
  ListOrdered,
  Loader2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Package,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { transactionsApi } from "@/lib/api";
import { toast } from "sonner";

export default function InventoryMovementLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Stats
  const receiptCount = transactions.filter((t) => t.transaction_type === "Receipt" || t.transaction_type === "Return").length;
  const issueCount = transactions.filter((t) => t.transaction_type === "Issue").length;
  const adjustmentCount = transactions.filter((t) => t.transaction_type === "Adjustment").length;

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const data = await transactionsApi.getAll({
          page: currentPage,
          limit: itemsPerPage,
          type: filterType,
          search: searchTerm,
        });
        setTransactions(data.data);
        setTotalPages(data.meta.totalPages);
        setTotalItems(data.meta.totalItems);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, filterType, searchTerm]);

  const handleRowClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsSheetOpen(true);
  };

  // Define Movement Type Icons and colors
  const getMovementStyle = (type: string, qty: number) => {
    switch (type) {
      case "Receipt":
      case "Return":
        return {
          icon: ArrowUpRight,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          sign: "+",
        };
      case "Issue":
        return {
          icon: ArrowDownLeft,
          color: "text-red-600",
          bg: "bg-red-50",
          sign: "",
        };
      case "Adjustment":
        const isPositive = qty > 0;
        return {
          icon: isPositive ? ArrowUpRight : ArrowDownLeft,
          color: isPositive ? "text-blue-600" : "text-red-600",
          bg: isPositive ? "bg-blue-50" : "bg-red-50",
          sign: isPositive ? "+" : "",
        };
      default:
        return {
          icon: ListOrdered,
          color: "text-slate-500",
          bg: "bg-slate-100",
          sign: "",
        };
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              History of Movements
            </h1>
            <p className="text-slate-500 mt-1">
              บันทึกการเคลื่อนไหวสินค้าคงคลังทั้งหมด
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Movements"
            value={totalItems}
            icon={ClipboardList}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Receipts"
            value={receiptCount}
            icon={TrendingUp}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Issues"
            value={issueCount}
            icon={TrendingDown}
            color="text-red-600"
            bg="bg-red-50"
          />
          <StatCard
            title="Adjustments"
            value={adjustmentCount}
            icon={RefreshCw}
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        {/* --- Main Content: Table --- */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* --- Toolbar: Filter --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Item, Reference, or Source..."
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
                  <SelectTrigger className="w-[180px] border-slate-200">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Receipt">รับเข้า (Receipt)</SelectItem>
                    <SelectItem value="Issue">เบิกออก (Issue)</SelectItem>
                    <SelectItem value="Return">สินค้าคืน (Return)</SelectItem>
                    <SelectItem value="Adjustment">
                      ปรับปรุงยอด (Adjustment)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* --- Data Table --- */}
            <div className="rounded-lg border border-slate-200 overflow-hidden min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[160px] font-semibold text-slate-700 pl-6 h-12">
                        Date/Time
                      </TableHead>
                      <TableHead className="w-[150px] font-semibold text-slate-700 h-12">
                        Reference No.
                      </TableHead>
                      <TableHead className="w-[150px] font-semibold text-slate-700 h-12">
                        Type
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 h-12">
                        Item
                      </TableHead>
                      <TableHead className="text-right w-[140px] font-semibold text-slate-700 h-12">
                        Qty.
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 pr-6 h-12">
                        Reason
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-12 text-slate-500"
                        >
                          No transactions found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((log) => {
                        const movementStyle = getMovementStyle(
                          log.type,
                          log.qtyChange
                        );
                        const Icon = movementStyle.icon;
                        return (
                          <TableRow
                            key={log.id}
                            className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                            onClick={() => handleRowClick(log)}
                          >
                            {/* Date/Time */}
                            <TableCell className="pl-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                              {log.dateTime}
                            </TableCell>

                            {/* Reference No. */}
                            <TableCell className="font-medium text-blue-600 py-4">
                              {log.refNo}
                            </TableCell>

                            {/* Type */}
                            <TableCell className="py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${movementStyle.bg} ${movementStyle.color} border-current`}
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                {log.type}
                              </span>
                            </TableCell>

                            {/* Item */}
                            <TableCell className="font-medium text-slate-900 py-4">
                              {log.item}
                            </TableCell>

                            {/* Qty Change */}
                            <TableCell
                              className={`text-right font-bold py-4 ${movementStyle.color}`}
                            >
                              {movementStyle.sign}
                              {log.qtyChange.toLocaleString()}
                            </TableCell>

                            {/* Source / Destination */}
                            <TableCell className="text-slate-700 py-4 pr-6">
                              {log.source}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination Footer */}
            {!loading && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 gap-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} entries
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

      {/* Transaction Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedTransaction && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  History of Movements
                </SheetTitle>
                <SheetDescription>
                  Review details for {selectedTransaction.refNo}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Transaction Information */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <InfoRow label="Reference No." value={selectedTransaction.refNo || '-'} />
                  <InfoRow label="Date/Time" value={selectedTransaction.dateTime || '-'} />
                  <InfoRow 
                    label="Type" 
                    value={
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getMovementStyle(selectedTransaction.type, selectedTransaction.qtyChange).bg
                      } ${getMovementStyle(selectedTransaction.type, selectedTransaction.qtyChange).color}`}>
                        {selectedTransaction.type}
                      </span>
                    } 
                  />
                </div>

                {/* Item Information */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <InfoRow label="Item Name" value={selectedTransaction.item || '-'} />
                  <InfoRow 
                    label="Quantity Change" 
                    value={
                      <span className={`font-bold ${getMovementStyle(selectedTransaction.type, selectedTransaction.qtyChange).color}`}>
                        {getMovementStyle(selectedTransaction.type, selectedTransaction.qtyChange).sign}
                        {selectedTransaction.qtyChange?.toLocaleString() || 0}
                      </span>
                    }
                    valueColor={getMovementStyle(selectedTransaction.type, selectedTransaction.qtyChange).color}
                  />
                  <InfoRow label="Reason" value={selectedTransaction.source || '-'} />
                </div>

                {/* Additional Details */}
                {(selectedTransaction.notes || selectedTransaction.user) && (
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Additional Details
                    </h4>
                    {selectedTransaction.user && (
                      <InfoRow 
                        label="User" 
                        value={
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {selectedTransaction.user}
                          </span>
                        } 
                      />
                    )}
                    {selectedTransaction.notes && (
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-slate-600 font-medium">Notes:</span>
                        <span className="text-slate-900 font-medium pl-0">{selectedTransaction.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

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
