"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import type { PurchaseRequisition, PurchaseRequisitionItem } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  X,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { purchasingApi } from "@/lib/api";

export default function PurchasingStatusPage() {
  const [userRole, setUserRole] = useState<string>("user");
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<PurchaseRequisition | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Batch Operations State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkApproveDialog, setBulkApproveDialog] = useState(false);
  const [bulkRejectDialog, setBulkRejectDialog] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [requests, setRequests] = useState<PurchaseRequisition[]>([]);

  // Fetch Data
  const fetchRequests = async () => {
    try {
      const data = await purchasingApi.getAll();
      setRequests(data);
    } catch (error) {
      toast.error("Failed to fetch requests");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole") || "user";
      setUserRole(role);
    }
    fetchRequests();
  }, []);

  // Batch Selection Handlers
  const handleSelectAll = () => {
    const pendingIds = paginatedRequests
      .filter((r) => r.status === "Pending")
      .map((r) => String(r.id));
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    setBulkApproveDialog(true);
  };

  const handleBulkReject = () => {
    setBulkRejectDialog(true);
  };

  const confirmBulkApprove = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const approverId = currentUser?.id;

      await Promise.all(
        selectedIds.map((id) => {
          const req = requests.find((r) => String(r.id) === String(id));
          return purchasingApi.updateStatus(id, "approved", req?.supplierId, approverId);
        })
      );
      toast.success(`Approved ${selectedIds.length} requests.`);
      fetchRequests();
      setSelectedIds([]);
      setBulkApproveDialog(false);
    } catch (error) {
      toast.error("Failed to approve some requests");
    }
  };

  const confirmBulkReject = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => purchasingApi.updateStatus(id, "rejected"))
      );
      toast.success(`Rejected ${selectedIds.length} requests.`);
      fetchRequests();
      setSelectedIds([]);
      setBulkRejectDialog(false);
    } catch (error) {
      toast.error("Failed to reject some requests");
    }
  };

  // Helper to process data for table view
  const processedRequests = requests.map((req) => {
    const itemsSummary = (req.itemsList || []).map((i) => i.name).join(", ");
    const totalQty = (req.itemsList || []).reduce(
      (sum, i) => sum + (i.qty || i.quantity || 0),
      0
    );
    return { ...req, itemsSummary, totalQty };
  });

  // --- Filter Logic ---
  const filteredRequests = processedRequests.filter((req) => {
    const matchesSearch =
      String(req.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.itemsSummary || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (req.requester || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // --- Handlers ---
  const handleRowClick = (req: PurchaseRequisition) => {
    setSelectedRequest(req);
    setIsSheetOpen(true);
  };

  const handleApproveClick = () => setApproveDialog(true);
  const handleRejectClick = () => setRejectDialog(true);

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    try {
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const approverId = currentUser?.id;

      await purchasingApi.updateStatus(String(selectedRequest.id), "approved", (selectedRequest as any).supplierId, approverId);
      toast.success(`Approved PR ${selectedRequest.id}.`);
      fetchRequests();
      setApproveDialog(false);
      setIsSheetOpen(false);
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    try {
      await purchasingApi.updateStatus(String(selectedRequest.id), "rejected");
      toast.error(`Rejected PR ${selectedRequest.id}.`);
      fetchRequests();
      setRejectDialog(false);
      setIsSheetOpen(false);
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Purchase Requisition Status
            </h1>
            <p className="text-slate-500 mt-1">
              ติดตามสถานะการอนุมัติใบขอซื้อสินค้า
            </p>
          </div>
        </div>

        {/* Main Table Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2"></CardHeader>
          <CardContent>
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search PR No, Item or Requester..."
                  className="pl-10 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || filterStatus !== "all") && (
                  <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="h-4 w-4 text-slate-500" />
                  </Button>
                )}
              </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  {selectedIds.length} selected
                </Badge>
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkReject}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
              </div>
            )}

            {/* Data Table - Updated Layout */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    {/* Checkbox Column */}
                    <TableHead className="w-[50px] pl-6 h-12">
                      <Checkbox
                        checked={
                          paginatedRequests.filter(
                            (r) => r.status === "Pending"
                          ).length > 0 &&
                          selectedIds.length ===
                            paginatedRequests.filter(
                              (r) => r.status === "Pending"
                            ).length
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all pending items"
                      />
                    </TableHead>
                    {/* Header: Added h-12 and adjusted pl/pr */}
                    <TableHead className="w-[150px] font-semibold text-slate-700 pl-4 h-12">
                      PR No.
                    </TableHead>
                    <TableHead className="min-w-[200px] font-semibold text-slate-700 h-12">
                      Item Description
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 h-12">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 pl-8 h-12">
                      Requester By
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12">
                      Date
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 pr-6 h-12">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((req) => (
                    <TableRow
                      key={req.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(req)}
                    >
                      {/* Checkbox Column */}
                      <TableCell
                        className="pl-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.includes(String(req.id))}
                          onCheckedChange={() =>
                            handleSelectOne(String(req.id))
                          }
                          disabled={req.status !== "Pending"}
                          aria-label={`Select ${req.id}`}
                        />
                      </TableCell>

                      {/* Body: Added py-4 for vertical spacing */}

                      {/* PR No. */}
                      <TableCell className="pl-4 py-4">
                        <span className="font-medium text-blue-600 group-hover:underline underline-offset-4">
                          {req.id}
                        </span>
                      </TableCell>

                      {/* Item Description */}
                      <TableCell className="font-medium text-slate-900 py-4">
                        <div className="flex items-center gap-2">
                          {req.itemsSummary}
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-medium text-slate-700 py-4">
                        ฿{(req.total || 0).toLocaleString()}
                      </TableCell>

                      {/* Requester */}
                      <TableCell className="pl-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                            {(req.requester || "?").charAt(0)}
                          </div>
                          <span className="text-sm text-slate-600">
                            {req.requester}
                          </span>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-slate-500 text-sm whitespace-nowrap py-4">
                        {req.date}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center pr-6 py-4">
                        <StatusBadge status={req.status} />
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
                  {Math.min(startIndex + itemsPerPage, filteredRequests.length)}{" "}
                  of {filteredRequests.length} entries
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

      {/* --- Detail Sheet (Read Only) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedRequest && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  PR Status
                </SheetTitle>
                <SheetDescription>
                  Review details for {selectedRequest.id}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Info Block */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">PR Number</span>
                    <span className="font-medium text-slate-900">
                      {selectedRequest.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Date</span>
                    <span className="font-medium text-slate-900">
                      {selectedRequest.date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Status</span>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                </div>

                {/* Items List (Read Only) */}
                <div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b grid grid-cols-12 gap-2">
                      <div className="col-span-6">Item</div>
                      <div className="col-span-2 text-right">Qty</div>
                      <div className="col-span-4 text-right">Total</div>
                    </div>
                    <div className="divide-y max-h-[300px] overflow-y-auto">
                      {(selectedRequest.itemsList || []).map(
                        (item: PurchaseRequisitionItem, idx: number) => (
                          <div
                            key={idx}
                            className="px-4 py-3 text-sm grid grid-cols-12 gap-2 items-center"
                          >
                            {/* Column 1: Name & SKU */}
                            <div className="col-span-6">
                              <div className="font-medium text-slate-900">
                                {item.name}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">
                                {item.sku}
                              </div>
                            </div>

                            {/* Column 2: Quantity */}
                            <div className="col-span-2 text-right text-slate-600">
                              {item.qty || item.quantity}
                            </div>

                            {/* Column 3: Total Price */}
                            <div className="col-span-4 text-right font-medium text-slate-900">
                              ฿
                              {(
                                (item.price || 0) *
                                (item.qty || item.quantity || 0)
                              ).toLocaleString()}
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Grand Total Footer */}
                    <div className="bg-slate-50 p-3 border-t flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">
                        Grand Total
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ฿{(selectedRequest.total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requester Info */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">
                    Requester Info
                  </h4>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {(selectedRequest.requester || "?").charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {selectedRequest.requester}
                      </div>
                      <div className="text-xs text-slate-500">Staff Member</div>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-8 border-t pt-4">
                {userRole === "admin" &&
                selectedRequest.status === "Pending" ? (
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleRejectClick}
                    >
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={handleApproveClick}
                    >
                      Approve Request
                    </Button>
                  </div>
                ) : (
                  <div className="w-full text-center text-slate-400 text-sm italic">
                    {selectedRequest.status !== "Pending"
                      ? "Request finalized."
                      : "Waiting for Admin approval"}
                  </div>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm Dialogs */}
      <ConfirmationDialog
        open={approveDialog}
        onOpenChange={setApproveDialog}
        onConfirm={confirmApprove}
        title="Approve Request"
        description="Confirm approval?"
        confirmText="Approve"
        variant="default"
      />
      <ConfirmationDialog
        open={rejectDialog}
        onOpenChange={setRejectDialog}
        onConfirm={confirmReject}
        title="Reject Request"
        description="Confirm rejection?"
        confirmText="Reject"
        variant="destructive"
      />

      {/* Bulk Approve Dialog */}
      <ConfirmationDialog
        open={bulkApproveDialog}
        onOpenChange={setBulkApproveDialog}
        onConfirm={confirmBulkApprove}
        title="Bulk Approve Purchase Requisitions"
        description={`Are you sure you want to approve ${selectedIds.length} selected PR(s)?`}
        confirmText="Approve All"
        variant="default"
      />

      {/* Bulk Reject Dialog */}
      <ConfirmationDialog
        open={bulkRejectDialog}
        onOpenChange={setBulkRejectDialog}
        onConfirm={confirmBulkReject}
        title="Bulk Reject Purchase Requisitions"
        description={`Are you sure you want to reject ${selectedIds.length} selected PR(s)?`}
        confirmText="Reject All"
        variant="destructive"
      />
    </MainLayout>
  );
}

// Sub-components...
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Ordered: "bg-blue-50 text-blue-700 border-blue-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };
  const currentStyle =
    styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status === "Approved" && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === "Pending" && <Clock className="w-3 h-3 mr-1" />}
      {status === "Ordered" && <AlertCircle className="w-3 h-3 mr-1" />}
      {status === "Rejected" && <XCircle className="w-3 h-3 mr-1" />}
      {status}
    </span>
  );
}
