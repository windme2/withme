"use client";

import { useState } from "react";
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
  ClipboardList, // Main icon for Activity Log
  ArrowUpRight, // Icon for positive movement
  ArrowDownLeft, // Icon for negative movement
  PackageOpen,
  ShoppingBag,
  RotateCcw,
  ListOrdered,
  X,
} from "lucide-react";

// --- Mock Data ---
const mockMovementLog = [
  {
    id: 1,
    dateTime: "2025-01-15 10:30",
    refNo: "GRN-0025",
    item: "A4 Paper 80gsm",
    type: "Receipt",
    qtyChange: 200,
    source: "Tech World Co.",
  },
  {
    id: 2,
    dateTime: "2025-01-15 11:45",
    refNo: "SO-0089",
    item: "Wireless Mouse",
    type: "Issue",
    qtyChange: -10,
    source: "Global Retail Co.",
  },
  {
    id: 3,
    dateTime: "2025-01-15 12:00",
    refNo: "ADJ-0008",
    item: "HDMI Cable",
    type: "Adjustment",
    qtyChange: -2,
    source: "Stock Count Discrepancy",
  },
  {
    id: 4,
    dateTime: "2025-01-14 09:15",
    refNo: "RT-0012",
    item: "Bluetooth Speaker",
    type: "Return",
    qtyChange: 5,
    source: "Local Tech Shop",
  },
  {
    id: 5,
    dateTime: "2025-01-14 15:00",
    refNo: "GRN-0024",
    item: "Stapler Heavy Duty",
    type: "Receipt",
    qtyChange: 50,
    source: "Office Pro Supply",
  },
  {
    id: 6,
    dateTime: "2025-01-14 10:00",
    refNo: "SO-0088",
    item: "A4 Paper 80gsm",
    type: "Issue",
    qtyChange: -50,
    source: "ABC Trading Ltd.",
  },
  {
    id: 7,
    dateTime: "2025-01-13 14:00",
    refNo: "ADJ-0007",
    item: "Wireless Mouse",
    type: "Adjustment",
    qtyChange: 1,
    source: "Found in Receiving Bay",
  },
  {
    id: 8,
    dateTime: "2025-01-13 16:30",
    refNo: "GRN-0023",
    item: "USB Flash Drive 64GB",
    type: "Receipt",
    qtyChange: 100,
    source: "Digital Hub Ltd.",
  },
  {
    id: 9,
    dateTime: "2025-01-12 08:15",
    refNo: "SO-0087",
    item: "Blue Ink Pen",
    type: "Issue",
    qtyChange: -25,
    source: "Office Supplies Inc.",
  },
  {
    id: 10,
    dateTime: "2025-01-12 11:00",
    refNo: "RT-0011",
    item: "Notebook A5",
    type: "Return",
    qtyChange: 8,
    source: "Stationery World",
  },
  {
    id: 11,
    dateTime: "2025-01-11 09:45",
    refNo: "GRN-0022",
    item: "Correction Tape",
    type: "Receipt",
    qtyChange: 75,
    source: "Office Pro Supply",
  },
  {
    id: 12,
    dateTime: "2025-01-11 13:20",
    refNo: "SO-0086",
    item: "Whiteboard Marker",
    type: "Issue",
    qtyChange: -30,
    source: "School Supplies Co.",
  },
  {
    id: 13,
    dateTime: "2025-01-10 10:00",
    refNo: "ADJ-0006",
    item: "Paper Clips (Box)",
    type: "Adjustment",
    qtyChange: -3,
    source: "Inventory Audit",
  },
  {
    id: 14,
    dateTime: "2025-01-10 14:15",
    refNo: "GRN-0021",
    item: "Mechanical Pencil",
    type: "Receipt",
    qtyChange: 120,
    source: "Tech World Co.",
  },
  {
    id: 15,
    dateTime: "2025-01-09 08:30",
    refNo: "SO-0085",
    item: "Calculator Basic",
    type: "Issue",
    qtyChange: -15,
    source: "Global Retail Co.",
  },
  {
    id: 16,
    dateTime: "2025-01-09 12:45",
    refNo: "RT-0010",
    item: "Desk Organizer",
    type: "Return",
    qtyChange: 3,
    source: "ABC Trading Ltd.",
  },
  {
    id: 17,
    dateTime: "2025-01-08 09:00",
    refNo: "GRN-0020",
    item: "Sticky Notes Pack",
    type: "Receipt",
    qtyChange: 200,
    source: "Office Pro Supply",
  },
  {
    id: 18,
    dateTime: "2025-01-08 15:30",
    refNo: "SO-0084",
    item: "Highlighter Set",
    type: "Issue",
    qtyChange: -20,
    source: "Stationery World",
  },
  {
    id: 19,
    dateTime: "2025-01-07 10:15",
    refNo: "ADJ-0005",
    item: "Binder Clips Large",
    type: "Adjustment",
    qtyChange: 5,
    source: "Stock Recount",
  },
  {
    id: 20,
    dateTime: "2025-01-07 13:00",
    refNo: "GRN-0019",
    item: "Envelope A4",
    type: "Receipt",
    qtyChange: 500,
    source: "Digital Hub Ltd.",
  },
  {
    id: 21,
    dateTime: "2025-01-06 08:45",
    refNo: "SO-0083",
    item: "Rubber Bands Box",
    type: "Issue",
    qtyChange: -40,
    source: "Office Supplies Inc.",
  },
  {
    id: 22,
    dateTime: "2025-01-06 11:30",
    refNo: "RT-0009",
    item: "File Folder",
    type: "Return",
    qtyChange: 12,
    source: "Local Tech Shop",
  },
  {
    id: 23,
    dateTime: "2025-01-05 09:20",
    refNo: "GRN-0018",
    item: "Label Maker",
    type: "Receipt",
    qtyChange: 25,
    source: "Tech World Co.",
  },
  {
    id: 24,
    dateTime: "2025-01-05 14:45",
    refNo: "SO-0082",
    item: "Scissors Office",
    type: "Issue",
    qtyChange: -18,
    source: "School Supplies Co.",
  },
  {
    id: 25,
    dateTime: "2025-01-04 10:30",
    refNo: "ADJ-0004",
    item: "Tape Dispenser",
    type: "Adjustment",
    qtyChange: -1,
    source: "Damaged Item",
  },
  {
    id: 26,
    dateTime: "2025-01-04 15:00",
    refNo: "GRN-0017",
    item: "Printer Paper A3",
    type: "Receipt",
    qtyChange: 150,
    source: "Office Pro Supply",
  },
  {
    id: 27,
    dateTime: "2025-01-03 08:00",
    refNo: "SO-0081",
    item: "Punch Hole 2-Hole",
    type: "Issue",
    qtyChange: -22,
    source: "ABC Trading Ltd.",
  },
  {
    id: 28,
    dateTime: "2025-01-03 12:30",
    refNo: "RT-0008",
    item: "Eraser White",
    type: "Return",
    qtyChange: 15,
    source: "Stationery World",
  },
  {
    id: 29,
    dateTime: "2025-01-02 09:45",
    refNo: "GRN-0016",
    item: "Marker Permanent",
    type: "Receipt",
    qtyChange: 90,
    source: "Digital Hub Ltd.",
  },
  {
    id: 30,
    dateTime: "2025-01-02 14:00",
    refNo: "SO-0080",
    item: "Clipboard A4",
    type: "Issue",
    qtyChange: -12,
    source: "Global Retail Co.",
  },
];

export default function InventoryMovementLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Pagination State ---
  const itemsPerPage = 10;

  // --- Filter Logic ---
  const filteredLog = mockMovementLog.filter((log) => {
    const matchesSearch =
      log.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesType;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredLog.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLog = filteredLog.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setCurrentPage(1);
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
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[160px] font-semibold text-slate-700 pl-6 h-12">
                      Date/Time
                    </TableHead>
                    <TableHead className="w-[120px] font-semibold text-slate-700 h-12">
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
                  {paginatedLog.map((log) => {
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
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 gap-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(startIndex + itemsPerPage, filteredLog.length)} of{" "}
                  {filteredLog.length} entries
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
