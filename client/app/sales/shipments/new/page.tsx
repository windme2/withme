"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Package, Save, Truck } from "lucide-react";
import { toast } from "sonner";

// --- Mock Data for Sales Orders & Shipping Companies ---
const mockSalesOrders = [
  {
    id: "SO-2025-001",
    customer: "Global Retail Co.",
    orderDate: "2025-01-15",
    status: "รออนุมัติ",
    items: [
      { sku: "IT-001", name: 'Monitor 24"', orderedQty: 5, unit: "ชิ้น", price: 4500 },
      { sku: "IT-005", name: "Keyboard", orderedQty: 10, unit: "ชิ้น", price: 500 },
      { sku: "IT-006", name: "Mouse Wireless", orderedQty: 10, unit: "ชิ้น", price: 500 },
    ],
  },
  {
    id: "SO-2025-002",
    customer: "Local Tech Shop",
    orderDate: "2025-01-18",
    status: "อนุมัติแล้ว",
    items: [
      { sku: "CAB-001", name: "HDMI Cable 2m", orderedQty: 20, unit: "เส้น", price: 250 },
      { sku: "CAB-002", name: "USB-C Cable", orderedQty: 15, unit: "เส้น", price: 450 },
      { sku: "ACC-001", name: "Mousepads", orderedQty: 30, unit: "ชิ้น", price: 89 },
    ],
  },
  {
    id: "SO-2025-003",
    customer: "ABC Trading Ltd.",
    orderDate: "2025-01-20",
    status: "อนุมัติแล้ว",
    items: [
      { sku: "SKU001", name: "A4 Paper 80gsm", orderedQty: 50, unit: "รีม", price: 120 },
      { sku: "SKU002", name: "Blue Ink Pen", orderedQty: 100, unit: "แพ็ค", price: 25 },
      { sku: "IT-003", name: "Webcam 1080p", orderedQty: 8, unit: "ชิ้น", price: 4500 },
    ],
  },
];

const shippingCompanies = [
  { id: "kerry", name: "Kerry Express" },
  { id: "flash", name: "Flash Express" },
  { id: "jnt", name: "J&T Express" },
  { id: "thailandpost", name: "Thailand Post" },
  { id: "dhl", name: "DHL Express" },
  { id: "scg", name: "SCG Express" },
];

interface ShipmentItem {
  sku: string;
  name: string;
  orderedQty: number;
  shipQty: number;
  unit: string;
  price: number;
  total: number;
}

export default function NewShipmentPage() {
  const router = useRouter();

  // Form State
  const [salesOrderId, setSalesOrderId] = useState("");
  const [shipmentDate, setShipmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [shippingCompany, setShippingCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<ShipmentItem[]>([]);

  // Calculate Totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatRate = 0.07;
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal + vatAmount;

  const handleSalesOrderChange = (orderId: string) => {
    setSalesOrderId(orderId);
    const order = mockSalesOrders.find((o) => o.id === orderId);
    if (order) {
      const shipmentItems: ShipmentItem[] = order.items.map((item) => ({
        sku: item.sku,
        name: item.name,
        orderedQty: item.orderedQty,
        shipQty: item.orderedQty, // Default to full quantity
        unit: item.unit,
        price: item.price,
        total: item.orderedQty * item.price,
      }));
      setItems(shipmentItems);
      toast.success("โหลดรายการสินค้าจาก Sales Order แล้ว");
    }
  };

  const handleQuantityChange = (index: number, value: string) => {
    const qty = parseInt(value) || 0;
    const updatedItems = [...items];
    const item = updatedItems[index];

    if (qty > item.orderedQty) {
      toast.error(`จำนวนจัดส่งต้องไม่เกิน ${item.orderedQty} ${item.unit}`);
      return;
    }

    if (qty < 0) {
      toast.error("จำนวนต้องไม่น้อยกว่า 0");
      return;
    }

    updatedItems[index].shipQty = qty;
    updatedItems[index].total = qty * item.price;
    setItems(updatedItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!salesOrderId) {
      toast.error("กรุณาเลือก Sales Order");
      return;
    }

    if (!shipmentDate) {
      toast.error("กรุณาระบุวันที่จัดส่ง");
      return;
    }

    if (!shippingCompany) {
      toast.error("กรุณาเลือกบริษัทขนส่ง");
      return;
    }

    if (!trackingNumber.trim()) {
      toast.error("กรุณาระบุเลข Tracking");
      return;
    }

    if (!shippingAddress.trim()) {
      toast.error("กรุณาระบุที่อยู่จัดส่ง");
      return;
    }

    if (items.length === 0) {
      toast.error("ไม่มีรายการสินค้าที่จะจัดส่ง");
      return;
    }

    const hasZeroQty = items.some((item) => item.shipQty === 0);
    if (hasZeroQty) {
      toast.error("กรุณาระบุจำนวนจัดส่งให้ครบทุกรายการ");
      return;
    }

    // Simulate API call
    toast.success("สร้างใบจัดส่งสำเร็จ!");
    setTimeout(() => {
      router.push("/sales/shipment");
    }, 1000);
  };

  const selectedOrder = mockSalesOrders.find((o) => o.id === salesOrderId);
  const selectedShippingCompany = shippingCompanies.find(
    (c) => c.id === shippingCompany
  );

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              สร้างใบจัดส่งใหม่
            </h1>
            <p className="text-slate-500 mt-1">
              เลือก Sales Order และระบุข้อมูลการจัดส่ง
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Shipment Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    ข้อมูลการจัดส่ง
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="salesOrder"
                        className="text-sm font-medium text-slate-700"
                      >
                        Sales Order <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={salesOrderId}
                        onValueChange={handleSalesOrderChange}
                      >
                        <SelectTrigger id="salesOrder">
                          <SelectValue placeholder="เลือก Sales Order" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockSalesOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.id} - {order.customer} ({order.status})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="shipmentDate"
                        className="text-sm font-medium text-slate-700"
                      >
                        วันที่จัดส่ง <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="shipmentDate"
                        type="date"
                        value={shipmentDate}
                        onChange={(e) => setShipmentDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="shippingCompany"
                        className="text-sm font-medium text-slate-700"
                      >
                        บริษัทขนส่ง <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={shippingCompany}
                        onValueChange={setShippingCompany}
                      >
                        <SelectTrigger id="shippingCompany">
                          <SelectValue placeholder="เลือกบริษัทขนส่ง" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingCompanies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="trackingNumber"
                        className="text-sm font-medium text-slate-700"
                      >
                        เลข Tracking <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="trackingNumber"
                        type="text"
                        placeholder="กรอกเลข Tracking"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="shippingAddress"
                      className="text-sm font-medium text-slate-700"
                    >
                      ที่อยู่จัดส่ง <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="shippingAddress"
                      placeholder="ระบุที่อยู่สำหรับการจัดส่ง..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="remarks"
                      className="text-sm font-medium text-slate-700"
                    >
                      หมายเหตุ
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับการจัดส่ง..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg">
                    รายการสินค้าที่จะจัดส่ง ({items.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {items.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>ยังไม่ได้เลือก Sales Order</p>
                      <p className="text-sm mt-1">
                        กรุณาเลือก Sales Order เพื่อโหลดรายการสินค้า
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="font-semibold text-slate-700">
                              SKU
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              ชื่อสินค้า
                            </TableHead>
                            <TableHead className="text-center font-semibold text-slate-700">
                              สั่งซื้อ
                            </TableHead>
                            <TableHead className="text-center font-semibold text-slate-700">
                              จัดส่ง
                            </TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">
                              ราคา
                            </TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">
                              รวม
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium text-slate-600">
                                {item.sku}
                              </TableCell>
                              <TableCell className="font-medium text-slate-900">
                                {item.name}
                              </TableCell>
                              <TableCell className="text-center text-slate-600">
                                {item.orderedQty} {item.unit}
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  min="0"
                                  max={item.orderedQty}
                                  value={item.shipQty}
                                  onChange={(e) =>
                                    handleQuantityChange(index, e.target.value)
                                  }
                                  className="w-24 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="text-right text-slate-600">
                                ฿{item.price.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-bold text-slate-900">
                                ฿{item.total.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Summary */}
            <div className="space-y-6">
              {/* Order Info Card */}
              {selectedOrder && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg">ข้อมูล Sales Order</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">เลขที่</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedOrder.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ลูกค้า</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedOrder.customer}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">วันที่สั่งซื้อ</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(selectedOrder.orderDate).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">สถานะ</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedOrder.status}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shipping Info Card */}
              {selectedShippingCompany && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg">ข้อมูลการขนส่ง</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">บริษัทขนส่ง</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedShippingCompany.name}
                      </p>
                    </div>
                    {trackingNumber && (
                      <div>
                        <p className="text-xs text-slate-500">เลข Tracking</p>
                        <p className="text-sm font-medium text-slate-900 font-mono">
                          {trackingNumber}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Shipment Summary Card */}
              <Card className="border-slate-200 shadow-sm sticky top-6">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg">สรุปการจัดส่ง</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-500">ยอดรวม</span>
                    <span className="text-sm font-medium text-slate-900">
                      ฿{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-500">VAT 7%</span>
                    <span className="text-sm font-medium text-slate-900">
                      ฿{vatAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-slate-900">
                        ยอดรวมทั้งสิ้น
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        ฿{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={items.length === 0}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      สร้างใบจัดส่ง
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.back()}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
