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
} from "lucide-react";
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
              <ClipboardList className="h-7 w-7 text-blue-600" />
              ประวัติการเคลื่อนไหวสินค้าคงคลัง (Movement Log)
            </h1>
            <p className="text-slate-500 mt-1">
              แสดงบันทึกธุรกรรมทั้งหมดที่ส่งผลต่อจำนวนสินค้าคงคลัง
            </p>
          </div>
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
                        Qty Change
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 pr-6 h-12">
                        Source / Destination
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
                            className="hover:bg-slate-50/60 transition-colors"
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
    </MainLayout>
  );
}
