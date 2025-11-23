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
import { Plus, Search, Truck, Package, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { shipmentsApi } from "@/lib/api";

export default function ShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      const data = await shipmentsApi.getAll(filterStatus, searchTerm);
      setShipments(data);
    } catch (error) {
      toast.error("Failed to fetch shipments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [filterStatus, searchTerm]);

  const pendingCount = shipments.filter(s => s.status === 'Pending').length;
  const shippedCount = shipments.filter(s => s.status === 'Shipped').length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Shipments</h1>
            <p className="text-slate-500 mt-1">ติดตามการจัดส่งสินค้า</p>
          </div>
          <Button onClick={() => router.push('/sales/shipments/new')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Shipments" value={shipments.length} icon={Package} color="text-blue-600" bg="bg-blue-50" />
          <StatCard title="Pending" value={pendingCount} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
          <StatCard title="Shipped" value={shippedCount} icon={Truck} color="text-purple-600" bg="bg-purple-50" />
          <StatCard title="Delivered" value={deliveredCount} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search shipments..."
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
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Shipment No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Shipping Address</TableHead>
                    <TableHead>Shipment Date</TableHead>
                    <TableHead>Tracking No.</TableHead>
                    <TableHead className="text-right">Total Items</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : shipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No shipments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    shipments.map((shipment) => (
                      <TableRow key={shipment.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-blue-600">{shipment.shipmentNumber}</TableCell>
                        <TableCell className="font-medium">{shipment.customerName}</TableCell>
                        <TableCell className="text-slate-600">{shipment.shippingAddress}</TableCell>
                        <TableCell>{shipment.shipmentDate || '-'}</TableCell>
                        <TableCell>{shipment.trackingNumber || '-'}</TableCell>
                        <TableCell className="text-right">{shipment.totalItems}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={shipment.status} />
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
    Shipped: { bg: "bg-purple-50", text: "text-purple-700" },
    Delivered: { bg: "bg-emerald-50", text: "text-emerald-700" },
    Cancelled: { bg: "bg-red-50", text: "text-red-700" },
  };
  const c = config[status] || config.Pending;
  return (
    <Badge variant="outline" className={`${c.bg} ${c.text} border-0`}>
      {status}
    </Badge>
  );
}
