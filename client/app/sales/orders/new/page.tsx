"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Plus, Trash2, Save, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { salesOrdersApi, inventoryApi } from "@/lib/api";

interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
  total: number;
}

export default function NewSalesOrderPage() {
  const router = useRouter();

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);

  // Add Item State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Products from API
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await inventoryApi.getAll();
        setProducts(data);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Calculate Totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatRate = 0.07;
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal + vatAmount;

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.error("กรุณาเลือกสินค้า");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (quantity <= 0) {
      toast.error("กรุณาระบุจำนวนที่ถูกต้อง");
      return;
    }

    if (quantity > product.quantity) {
      toast.error(`สินค้าคงเหลือไม่เพียงพอ (มีเพียง ${product.quantity} ${product.unit})`);
      return;
    }

    // Check if item already exists
    const existingItemIndex = items.findIndex((item) => item.productId === product.id);
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].qty += quantity;
      updatedItems[existingItemIndex].total =
        updatedItems[existingItemIndex].qty * updatedItems[existingItemIndex].price;
      setItems(updatedItems);
      toast.success("เพิ่มจำนวนสินค้าแล้ว");
    } else {
      // Use a default price (you might want to add price field to products or use a fixed price)
      const unitPrice = 1000; // Default price, should be from product data
      const newItem: OrderItem = {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        qty: quantity,
        price: unitPrice,
        unit: product.unit,
        total: quantity * unitPrice,
      };
      setItems([...items, newItem]);
      toast.success("เพิ่มสินค้าลงรายการแล้ว");
    }

    // Reset selection
    setSelectedProductId("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    toast.success("ลบสินค้าออกจากรายการแล้ว");
  };

  const handleUpdatePrice = (index: number, newPrice: number) => {
    const updatedItems = [...items];
    updatedItems[index].price = newPrice;
    updatedItems[index].total = updatedItems[index].qty * newPrice;
    setItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("กรุณากรอกชื่อลูกค้า");
      return;
    }

    if (!dueDate) {
      toast.error("กรุณาระบุวันครบกำหนด");
      return;
    }

    if (items.length === 0) {
      toast.error("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    try {
      const payload = {
        customerName: customerName.trim(),
        contactPerson: contactPerson.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        dueDate: dueDate,
        notes: remarks.trim() || null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.qty,
          unitPrice: item.price,
        })),
      };

      await salesOrdersApi.create(payload);
      toast.success("สร้าง Sales Order สำเร็จ!");
      setTimeout(() => {
        router.push("/sales/orders");
      }, 1000);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสร้าง Sales Order");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-500">Loading products...</p>
        </div>
      </MainLayout>
    );
  }

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
              สร้าง Sales Order ใหม่
            </h1>
            <p className="text-slate-500 mt-1">กรอกข้อมูลคำสั่งซื้อและเลือกสินค้า</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Order Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    ข้อมูลคำสั่งซื้อ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-sm font-medium text-slate-700">
                        ชื่อลูกค้า <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="customerName"
                        placeholder="ชื่อบริษัทหรือลูกค้า"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPerson" className="text-sm font-medium text-slate-700">
                        ผู้ติดต่อ
                      </Label>
                      <Input
                        id="contactPerson"
                        placeholder="ชื่อผู้ติดต่อ"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                        อีเมล
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                        เบอร์โทร
                      </Label>
                      <Input
                        id="phone"
                        placeholder="02-xxx-xxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm font-medium text-slate-700">
                      วันครบกำหนด <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="text-sm font-medium text-slate-700">
                      หมายเหตุ
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder="ข้อมูลเพิ่มเติม หรือเงื่อนไขพิเศษ..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Items Card */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg">เพิ่มรายการสินค้า</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="product" className="text-sm font-medium text-slate-700">
                        สินค้า
                      </Label>
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger id="product">
                          <SelectValue placeholder="เลือกสินค้า" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.sku} (คงเหลือ: {product.stock} {product.unit || 'pcs'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-32 space-y-2">
                      <Label htmlFor="quantity" className="text-sm font-medium text-slate-700">
                        จำนวน
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleAddItem}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่ม
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg">
                    รายการสินค้า ({items.length} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {items.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>ยังไม่มีรายการสินค้า</p>
                      <p className="text-sm mt-1">กรุณาเพิ่มสินค้าจากด้านบน</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                            <TableHead className="font-semibold text-slate-700">
                              ชื่อสินค้า
                            </TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">
                              ราคา/หน่วย
                            </TableHead>
                            <TableHead className="text-center font-semibold text-slate-700">
                              จำนวน
                            </TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">
                              รวม
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
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
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.price}
                                  onChange={(e) => handleUpdatePrice(index, parseFloat(e.target.value) || 0)}
                                  className="w-24 text-right"
                                />
                              </TableCell>
                              <TableCell className="text-center font-medium text-slate-900">
                                {item.qty} {item.unit}
                              </TableCell>
                              <TableCell className="text-right font-bold text-slate-900">
                                ฿{item.total.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(index)}
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
              {/* Customer Info Card */}
              {customerName && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg">ข้อมูลลูกค้า</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">ชื่อบริษัท</p>
                      <p className="text-sm font-medium text-slate-900">
                        {customerName}
                      </p>
                    </div>
                    {contactPerson && (
                      <div>
                        <p className="text-xs text-slate-500">ผู้ติดต่อ</p>
                        <p className="text-sm font-medium text-slate-900">
                          {contactPerson}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Order Summary Card */}
              <Card className="border-slate-200 shadow-sm sticky top-6">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg">สรุปคำสั่งซื้อ</CardTitle>
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
                      สร้าง Sales Order
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
