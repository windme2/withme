"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, RotateCcw, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { returnsApi } from "@/lib/api";

export default function ReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const data = await returnsApi.getAll(filterStatus, searchTerm);
      setReturns(data);
    } catch (error) {
      toast.error("Failed to fetch returns");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [filterStatus, searchTerm]);

  const pendingCount = returns.filter(r => r.status === 'Pending').length;
  const approvedCount = returns.filter(r => r.status === 'Approved').length;
  const completedCount = returns.filter(r => r.status === 'Completed').length;

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Returns</h1>
            <p className="text-slate-500 mt-1">จัดการการคืนสินค้า</p>
          </div>
          <Button onClick={() => router.push('/sales/returns/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Return
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Returns" value={returns.length} icon={RotateCcw} color="text-blue-600" bg="bg-blue-50" />
          <StatCard title="Pending" value={pendingCount} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
          <StatCard title="Approved" value={approvedCount} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard title="Completed" value={completedCount} icon={CheckCircle2} color="text-purple-600" bg="bg-purple-50" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search returns..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
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

            <div className="rounded-lg border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Return No.</TableHead>
                    <TableHead>SO No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : returns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No returns found
                      </TableCell>
                    </TableRow>
                  ) : (
                    returns.map((ret) => (
                      <TableRow key={ret.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-blue-600">{ret.returnNumber}</TableCell>
                        <TableCell>{ret.soNumber || '-'}</TableCell>
                        <TableCell className="font-medium">{ret.customerName}</TableCell>
                        <TableCell>{ret.returnDate}</TableCell>
                        <TableCell className="text-slate-600">{ret.reason || '-'}</TableCell>
                        <TableCell className="text-right font-bold">฿{ret.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={ret.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    Pending: { bg: "bg-amber-50", text: "text-amber-700" },
    Approved: { bg: "bg-emerald-50", text: "text-emerald-700" },
    Rejected: { bg: "bg-red-50", text: "text-red-700" },
    Completed: { bg: "bg-purple-50", text: "text-purple-700" },
  };
  const c = config[status] || config.Pending;
  return (
    <Badge variant="outline" className={`${c.bg} ${c.text} border-0`}>
      {status}
    </Badge>
  );
}
