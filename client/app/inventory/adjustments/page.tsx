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
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  FileClock,
  X,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adjustmentsApi } from "@/lib/api";
import type { StatCardProps } from "@/lib/types";

export default function StockAdjustmentPage() {
  const router = useRouter();
  const [adjustmentList, setAdjustmentList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    addRate: '0%',
    removeRate: '0%',
    accuracy: '0%'
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedAdjustment, setSelectedAdjustment] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
          adjustmentsApi.getAll(filterType, searchTerm),
          adjustmentsApi.getStats(),
        ]);
        setAdjustmentList(data);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching adjustments data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filterType, searchTerm]);

  // Filter Logic
  const filteredData = adjustmentList;

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (val: string) => {
    setFilterType(val);
    setCurrentPage(1);
  };

  const handleRowClick = async (adj: any) => {
    try {
      const detailData = await adjustmentsApi.getOne(adj.id);
      setSelectedAdjustment(detailData);
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Error fetching adjustment details:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Stock Adjustment
            </h1>
            <p className="text-slate-500 mt-1">
              จัดการรายการสินค้าและตรวจสอบประวัติการปรับยอดสินค้า
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/inventory/adjustments/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Adjustments"
            value={stats.total}
            icon={FileClock}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Stock Added Rate"
            value={stats.addRate}
            icon={ArrowUpCircle}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Stock Removed Rate"
            value={stats.removeRate}
            icon={ArrowDownCircle}
            color="text-red-600"
            bg="bg-red-50"
          />
          <StatCard
            title="Audit Accuracy"
            value={stats.accuracy}
            icon={Activity}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>

        {/* Main Table Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* Toolbar: Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search Product, SKU or ADJ No. ..."
                  className="pl-10 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={filterType} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-[160px] border-slate-200">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Add">Add Only</SelectItem>
                    <SelectItem value="Remove">Remove Only</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || filterType !== "all") && (
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

            {/* Data Table */}
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-semibold text-slate-700 pl-6 h-12 w-[140px]">
                          ADJ No.
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 h-12 w-[100px]">
                          Date
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 h-12 w-[100px]">
                          SKU
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 h-12 min-w-[180px]">
                          Item Description
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 h-12 w-[100px]">
                          Quantity
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 h-12 w-[120px]">
                          Type
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 pr-6 h-12">
                          Remark
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((adj) => (
                        <TableRow
                          key={adj.id}
                          className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                          onClick={() => handleRowClick(adj)}
                        >
                          <TableCell className="font-medium text-blue-600 pl-6 py-4">
                            {adj.id}
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm py-4">
                            {adj.date}
                          </TableCell>
                          <TableCell className="text-slate-600 py-4">
                            {adj.sku}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 py-4">
                            {adj.product}
                          </TableCell>
                          <TableCell className="text-right font-bold text-sm py-4">
                            {adj.type === "Add" ? (
                              <span className="text-emerald-600">+{adj.qty}</span>
                            ) : (
                              <span className="text-red-600">-{adj.qty}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center py-4">
                            <AdjustmentBadge type={adj.type} />
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm py-4 pr-6">
                            {adj.remark}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="text-sm text-slate-500">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                      {filteredData.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="h-8 px-3 text-slate-600"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <span className="text-sm font-medium text-slate-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="h-8 px-3 text-slate-600"
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

      {/* Adjustment Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedAdjustment && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <FileClock className="h-5 w-5 text-blue-600" />
                  Adjustment Details
                </SheetTitle>
                <SheetDescription>
                  Review history for {selectedAdjustment.id}.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                <InfoRow label="ADJ No." value={selectedAdjustment.id} />
                <InfoRow label="Date" value={selectedAdjustment.date} />
                <InfoRow label="Product" value={selectedAdjustment.product} />
                <InfoRow label="SKU" value={selectedAdjustment.sku} />

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-2">
                    Adjustment Summary
                  </h4>
                  <InfoRow
                    label="Type"
                    value={<AdjustmentBadge type={selectedAdjustment.type} />}
                    valueColor="text-slate-900"
                  />
                  <InfoRow
                    label="Quantity"
                    value={
                      selectedAdjustment.type === "Add"
                        ? `+${selectedAdjustment.qty}`
                        : `-${selectedAdjustment.qty}`
                    }
                    valueColor={
                      selectedAdjustment.type === "Add"
                        ? "text-emerald-600 font-bold"
                        : "text-red-600 font-bold"
                    }
                  />
                  <InfoRow label="Reason" value={selectedAdjustment.remark} />
                  <InfoRow
                    label="Recorded By"
                    value={selectedAdjustment.user}
                  />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// Sub-Components
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

function AdjustmentBadge({ type }: { type: string }) {
  const isAdd = type === "Add";
  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 font-medium border-0 ${isAdd
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
          : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
        }`}
    >
      {isAdd ? "Add Stock" : "Remove"}
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
    <div className="flex justify-between py-1 border-b border-slate-50/50 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm ${valueColor}`}>{value}</span>
    </div>
  );
}
