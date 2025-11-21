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
import { ArrowLeft, PackageX, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

// --- Mock Data for Sales Orders & Return Reasons ---
const mockSalesOrders = [
  {
    id: "SO-2025-001",
    customer: "Global Retail Co.",
    orderDate: "2025-01-15",
    status: "จัดส่งแล้ว",
    items: [
      { sku: "IT-001", name: 'Monitor 24"', deliveredQty: 5, unit: "ชิ้น", price: 4500 },
      { sku: "IT-005", name: "Keyboard", deliveredQty: 10, unit: "ชิ้น", price: 500 },
      { sku: "IT-006", name: "Mouse Wireless", deliveredQty: 10, unit: "ชิ้น", price: 500 },
    ],
  },
  {
    id: "SO-2025-002",
    customer: "Local Tech Shop",
    orderDate: "2025-01-18",
    status: "จัดส่งแล้ว",
    items: [
      { sku: "CAB-001", name: "HDMI Cable 2m", deliveredQty: 20, unit: "เส้น", price: 250 },
      { sku: "CAB-002", name: "USB-C Cable", deliveredQty: 15, unit: "เส้น", price: 450 },
      { sku: "ACC-001", name: "Mousepads", deliveredQty: 30, unit: "ชิ้น", price: 89 },
    ],
  },
  {
    id: "SO-2025-003",
    customer: "ABC Trading Ltd.",
    orderDate: "2025-01-20",
    status: "จัดส่งแล้ว",
    items: [
      { sku: "SKU001", name: "A4 Paper 80gsm", deliveredQty: 50, unit: "รีม", price: 120 },
      { sku: "SKU002", name: "Blue Ink Pen", deliveredQty: 100, unit: "แพ็ค", price: 25 },
      { sku: "IT-003", name: "Webcam 1080p", deliveredQty: 8, unit: "ชิ้น", price: 4500 },
    ],
  },
];

const returnReasons = [
  { id: "defective", name: "สินค้าชำรุด/บกพร่อง" },
  { id: "wrong_item", name: "ส่งผิดรุ่น/ผิดสินค้า" },
  { id: "wrong_qty", name: "ส่งผิดจำนวน" },
  { id: "damaged", name: "สินค้าเสียหายระหว่างขนส่ง" },
  { id: "customer_change", name: "ลูกค้าเปลี่ยนใจ" },
  { id: "expired", name: "สินค้าหมดอายุ" },
  { id: "not_as_described", name: "ไม่ตรงตามรายละเอียด" },
  { id: "other", name: "อื่นๆ" },
];

const productConditions = [
  { id: "new", name: "สภาพดี - สามารถขายต่อได้", color: "text-green-600" },
  { id: "used", name: "สภาพปานกลาง - ใช้งานได้แต่มีตำหนิ", color: "text-yellow-600" },
  { id: "damaged", name: "สินค้าชำรุด - ไม่สามารถขายต่อได้", color: "text-red-600" },
];

interface ReturnItem {
  sku: string;
  name: string;
  deliveredQty: number;
  returnQty: number;
  unit: string;
  price: number;
  total: number;
  reason: string;
  condition: string;
}

export default function NewReturnPage() {
  const router = useRouter();

  // Form State
  const [salesOrderId, setSalesOrderId] = useState("");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [generalReason, setGeneralReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<ReturnItem[]>([]);

  // Calculate Totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatRate = 0.07;
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal + vatAmount;

  const handleSalesOrderChange = (orderId: string) => {
    setSalesOrderId(orderId);
    const order = mockSalesOrders.find((o) => o.id === orderId);
    if (order) {
      const returnItems: ReturnItem[] = order.items.map((item) => ({
        sku: item.sku,
        name: item.name,
        deliveredQty: item.deliveredQty,
        returnQty: 0, // Default to 0, user needs to specify
        unit: item.unit,
        price: item.price,
        total: 0,
        reason: "",
        condition: "",
      }));
      setItems(returnItems);
      toast.success("โหลดรายการสินค้าจาก Sales Order แล้ว");
    }
  };

  const handleQuantityChange = (index: number, value: string) => {
    const qty = parseInt(value) || 0;
    const updatedItems = [...items];
    const item = updatedItems[index];

    if (qty > item.deliveredQty) {
      toast.error(`จำนวนคืนต้องไม่เกิน ${item.deliveredQty} ${item.unit}`);
      return;
    }

    if (qty < 0) {
      toast.error("จำนวนต้องไม่น้อยกว่า 0");
      return;
    }

    updatedItems[index].returnQty = qty;
    updatedItems[index].total = qty * item.price;
    setItems(updatedItems);
  };

  const handleReasonChange = (index: number, reason: string) => {
    const updatedItems = [...items];
    updatedItems[index].reason = reason;
    setItems(updatedItems);
  };

  const handleConditionChange = (index: number, condition: string) => {
    const updatedItems = [...items];
    updatedItems[index].condition = condition;
    setItems(updatedItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!salesOrderId) {
      toast.error("กรุณาเลือก Sales Order");
      return;
    }

    if (!returnDate) {
      toast.error("กรุณาระบุวันที่คืนสินค้า");
      return;
    }

    if (!generalReason) {
      toast.error("กรุณาระบุสาเหตุการคืนสินค้า");
      return;
    }

    const itemsToReturn = items.filter((item) => item.returnQty > 0);

    if (itemsToReturn.length === 0) {
      toast.error("กรุณาระบุจำนวนสินค้าที่ต้องการคืนอย่างน้อย 1 รายการ");
      return;
    }

    // Validate all items with returnQty > 0 must have reason and condition
    const invalidItems = itemsToReturn.filter(
      (item) => !item.reason || !item.condition
    );

    if (invalidItems.length > 0) {
      toast.error("กรุณาระบุเหตุผลและสภาพสินค้าสำหรับทุกรายการที่คืน");
      return;
    }

    // Simulate API call
    toast.success("สร้างใบคืนสินค้าสำเร็จ!");
    setTimeout(() => {
      router.push("/sales/returns");
    }, 1000);
  };

  const selectedOrder = mockSalesOrders.find((o) => o.id === salesOrderId);
  const selectedReason = returnReasons.find((r) => r.id === generalReason);
  const itemsToReturn = items.filter((item) => item.returnQty > 0);

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
              สร้างใบคืนสินค้าใหม่
            </h1>
            <p className="text-slate-500 mt-1">
              เลือก Sales Order และระบุรายละเอียดการคืนสินค้า
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Return Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-orange-600" />
                    ข้อมูลการคืนสินค้า
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
                        htmlFor="returnDate"
                        className="text-sm font-medium text-slate-700"
                      >
                        วันที่คืนสินค้า <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="returnDate"
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="generalReason"
                      className="text-sm font-medium text-slate-700"
                    >
                      สาเหตุการคืนสินค้า <span className="text-red-500">*</span>
                    </Label>
                    <Select value={generalReason} onValueChange={setGeneralReason}>
                      <SelectTrigger id="generalReason">
                        <SelectValue placeholder="เลือกสาเหตุ" />
                      </SelectTrigger>
                      <SelectContent>
                        {returnReasons.map((reason) => (
                          <SelectItem key={reason.id} value={reason.id}>
                            {reason.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="remarks"
                      className="text-sm font-medium text-slate-700"
                    >
                      หมายเหตุ / รายละเอียดเพิ่มเติม
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับการคืนสินค้า..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg">
                    รายการสินค้าที่สามารถคืนได้ ({items.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {items.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <PackageX className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>ยังไม่ได้เลือก Sales Order</p>
                      <p className="text-sm mt-1">
                        กรุณาเลือก Sales Order เพื่อโหลดรายการสินค้า
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-slate-200 bg-slate-50/30 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded">
                                  {item.sku}
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {item.name}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-slate-600">
                                จัดส่งไปแล้ว: <span className="font-medium">{item.deliveredQty} {item.unit}</span>
                                {" | "}
                                ราคา: <span className="font-medium">฿{item.price.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-slate-700">
                                จำนวนที่คืน
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max={item.deliveredQty}
                                value={item.returnQty}
                                onChange={(e) =>
                                  handleQuantityChange(index, e.target.value)
                                }
                                placeholder="0"
                                className="text-center font-medium"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-slate-700">
                                เหตุผล
                              </Label>
                              <Select
                                value={item.reason}
                                onValueChange={(value) =>
                                  handleReasonChange(index, value)
                                }
                                disabled={item.returnQty === 0}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกเหตุผล" />
                                </SelectTrigger>
                                <SelectContent>
                                  {returnReasons.map((reason) => (
                                    <SelectItem key={reason.id} value={reason.id}>
                                      {reason.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-slate-700">
                                สภาพสินค้า
                              </Label>
                              <Select
                                value={item.condition}
                                onValueChange={(value) =>
                                  handleConditionChange(index, value)
                                }
                                disabled={item.returnQty === 0}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกสภาพ" />
                                </SelectTrigger>
                                <SelectContent>
                                  {productConditions.map((cond) => (
                                    <SelectItem key={cond.id} value={cond.id}>
                                      {cond.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {item.returnQty > 0 && (
                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                              <span className="text-sm text-slate-600">
                                มูลค่าคืน:
                              </span>
                              <span className="text-lg font-bold text-orange-600">
                                ฿{item.total.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
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

              {/* Return Reason Card */}
              {selectedReason && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg">สาเหตุการคืน</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-orange-600">
                      {selectedReason.name}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Return Summary Card */}
              <Card className="border-slate-200 shadow-sm sticky top-6">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg">สรุปการคืนสินค้า</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-500">รายการคืน</span>
                    <span className="text-sm font-medium text-slate-900">
                      {itemsToReturn.length} รายการ
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-500">มูลค่ารวม</span>
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
                        มูลค่าคืนทั้งสิ้น
                      </span>
                      <span className="text-xl font-bold text-orange-600">
                        ฿{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={itemsToReturn.length === 0}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      สร้างใบคืนสินค้า
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
