"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  FileText,
  Calendar,
  Filter,
  RefreshCw,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type definitions based on what we expect from the API
interface Transaction {
  id: string;
  type: string;
  itemId?: string;
  itemName?: string; // Flattened for display if needed
  quantity: number;
  date: string;
  reference: string;
  status: string;
  notes?: string;
  user?: { name: string };
}

export default function TransactionMovementsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Pagination
  const [page] = useState(1);
  const limit = 10;

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (selectedType && selectedType !== "all") params.append("type", selectedType);

      // Using api directly as it's cleaner than modifying api.ts right now
      // Assuming the backend returns { data: Transaction[], meta: { total, page, lastPage } } or similar
      // Or just an array. I'll handle both cases defensively.
      const response = await api.get(`/transactions?${params.toString()}`);
      
      if (response.data && Array.isArray(response.data.data)) {
         setData(response.data.data);
      } else if (Array.isArray(response.data)) {
         setData(response.data);
      } else {
         setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, selectedType]);

  const handleExportExcel = () => {
    try {
      if (data.length === 0) {
        toast.warning("No data to export");
        return;
      }

      const exportData = data.map(item => ({
        Date: format(new Date(item.date), 'yyyy-MM-dd HH:mm'),
        Type: item.type,
        Reference: item.reference,
        Item: item.itemName || 'N/A',
        Quantity: item.quantity,
        User: item.user?.name || 'N/A',
        Status: item.status,
        Notes: item.notes || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `transactions-${format(new Date(), 'yyyyMMdd-HHmm')}.xlsx`);
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Export Excel failed:", error);
      toast.error("Failed to export Excel");
    }
  };

  const handleExportPDF = () => {
    try {
      if (data.length === 0) {
        toast.warning("No data to export");
        return;
      }

      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(18);
      doc.text("Transaction History Report", 14, 22);
      
      // Add Date/Time
      doc.setFontSize(10);
      doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 30);

      const tableData = data.map(item => [
        format(new Date(item.date), 'yyyy-MM-dd HH:mm'),
        item.type,
        item.reference,
        item.itemName || 'N/A',
        item.quantity.toString(),
        item.status
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Date', 'Type', 'Reference', 'Item', 'Qty', 'Status']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      doc.save(`transactions-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Export PDF failed:", error);
      toast.error("Failed to export PDF");
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaction History</h1>
            <p className="text-slate-500 mt-1">
              View and manage inventory movement logs
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
              <FileText className="h-4 w-4 text-green-600" />
              Export Excel
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
              <Download className="h-4 w-4 text-red-600" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search by reference, item, or notes..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-[200px]">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Goods Received">Goods Received</SelectItem>
                    <SelectItem value="Sales Shipment">Sales Shipment</SelectItem>
                    <SelectItem value="Adjustment">Adjustment</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" onClick={fetchTransactions} title="Refresh">
                 <RefreshCw className={isLoading ? "animate-spin" : ""} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <div className="rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((transaction) => (
                  <TableRow key={transaction.id || Math.random().toString()} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-700">
                       <div className="flex items-center gap-2">
                         <Calendar className="h-3 w-3 text-slate-400" />
                         {transaction.date ? format(new Date(transaction.date), 'MMM dd, yyyy HH:mm') : '-'}
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{transaction.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{transaction.reference}</TableCell>
                    <TableCell>{transaction.itemName || 'Unknown Item'}</TableCell>
                    <TableCell className="text-right font-medium">
                        <span className={transaction.quantity > 0 ? "text-green-600" : "text-red-600"}>
                          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                        </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <Filter className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
