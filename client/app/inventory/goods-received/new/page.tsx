"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { suppliersApi, inventoryApi, goodsReceivedApi, purchaseOrdersApi } from "@/lib/api";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Plus, Trash2, Save, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";

export default function NewGoodsReceivedPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [supplierId, setSupplierId] = useState("");
  const [poRef, setPoRef] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    { id: 1, productId: "", name: "", sku: "", quantity: 0, unitPrice: 0, total: 0 },
  ]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, productsData, posData] = await Promise.all([
          suppliersApi.getAll(),
          inventoryApi.getAll(),
          purchaseOrdersApi.getAll("", ""), // Get all POs
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);
        // Filter POs with status sent or pending
        const activePOs = posData.filter((po: any) => 
          po.status === "Sent" || po.status === "Pending" || po.status === "sent" || po.status === "pending"
        );
        setPurchaseOrders(activePOs);
      } catch (error) {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  // Handle PO selection
  const handlePoSelect = async (poId: string) => {
    if (!poId || poId === "" || poId === "none") {
      setPoRef("");
      // Reset to empty items when no PO selected
      setItems([{ id: 1, productId: "", name: "", sku: "", quantity: 0, unitPrice: 0, total: 0 }]);
      return;
    }
    
    try {
      const po = await purchaseOrdersApi.getOne(poId);
      if (po) {
        setPoRef(poId);
        setSupplierId(po.supplierId || "");
        
        // Auto-fill items from PO
        if (po.items && po.items.length > 0) {
          const newItems = po.items.map((item: any, index: number) => ({
            id: index + 1,
            productId: item.productId || "",
            name: item.productName || item.name || "",
            sku: item.sku || "",
            quantity: item.quantity || item.qty || 0,
            unitPrice: item.unitPrice || item.price || 0,
            total: (item.quantity || item.qty || 0) * (item.unitPrice || item.price || 0),
          }));
          setItems(newItems);
          toast.success(`Loaded ${newItems.length} items from PO ${poId}`);
        }
      }
    } catch (error) {
      console.error("Failed to load PO details:", error);
      toast.error("Failed to load PO details");
    }
  };

  // --- Event Handlers ---
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        productId: "",
        name: "",
        sku: "",
        quantity: 0,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };

          // If product selected, update details
          if (field === "productId") {
            const product = products.find(p => p.id === value);
            if (product) {
              updated.name = product.name;
              updated.sku = product.sku;
              updated.unitPrice = 0; // Default price?
            }
          }

          // Auto-calculate total
          if (field === "quantity" || field === "unitPrice" || field === "productId") {
            updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error("Please fill in all item details correctly");
      return;
    }

    setLoading(true);
    try {
      await goodsReceivedApi.create({
        supplierId,
        date,
        poRef,
        notes,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      });
      toast.success("GRN created successfully!");
      setTimeout(() => router.push("/inventory/goods-received"), 1000);
    } catch (error) {
      toast.error("Failed to create GRN");
    } finally {
      setLoading(false);
    }
  };

  // --- Financial Calculations ---
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vat = subtotal * 0.07; // Assuming 7% VAT
  const grandTotal = subtotal + vat;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MainLayout>
      <div className="space-y-6 p-1 pb-20">
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create New GRN
            </h1>
            <p className="text-slate-500">
              บันทึกสินค้าที่ได้รับเข้าสู่คลังสินค้า
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* items-stretch ensures both columns have equal height */}

          {/* --- Left Column: General Info (2/3 Width) --- */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="grn-number">GRN Number</Label>
                    <Input
                      id="grn-number"
                      placeholder="Auto-generated"
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Received Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="po-number">
                      Reference PO
                    </Label>
                    <Select value={poRef} onValueChange={handlePoSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select PO (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {purchaseOrders.map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.poNumber || po.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional remarks..."
                    rows={3}
                    className="resize-none min-h-[80px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- Right Column: Summary (1/3 Width) --- */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-sm h-full flex flex-col">
              {/* Header: Reduced padding as requested */}
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Summary
                </CardTitle>
              </CardHeader>

              {/* Content: Flex layout to push button to bottom */}
              <CardContent className="p-6 flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Items</span>
                    <span className="font-medium text-slate-900">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Quantity</span>
                    <span className="font-medium text-slate-900">
                      {totalQuantity}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 my-2"></div>

                  {/* Financial Details */}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">
                      ฿{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">VAT (7%)</span>
                    <span className="font-medium text-slate-900">
                      ฿
                      {vat.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Grand Total & Action */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-end mb-5">
                    <span className="text-base font-bold text-slate-800">
                      Grand Total
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ฿
                      {grandTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {/* Save Button (Green Theme) */}
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-11 text-base transition-all hover:scale-[1.02]"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save GRN"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Bottom Section: Items Table (Full Width) --- */}
        <div className="mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Received Items
                </CardTitle>
                <CardDescription>List of items being received.</CardDescription>
              </div>
              <Button
                onClick={addItem}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[50px] pl-6 text-center">
                        #
                      </TableHead>
                      <TableHead className="w-[250px]">Product</TableHead>
                      <TableHead className="w-[150px]">SKU</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Qty
                      </TableHead>
                      <TableHead className="w-[150px] text-right">
                        Unit Price
                      </TableHead>
                      <TableHead className="w-[150px] text-right">
                        Amount
                      </TableHead>
                      <TableHead className="w-[50px] pr-6 text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/40">
                        <TableCell className="pl-6 text-center text-slate-500">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-3">
                          <Select
                            value={item.productId}
                            onValueChange={(val) => updateItem(item.id, "productId", val)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-3">
                          <Input
                            placeholder="SKU"
                            value={item.sku}
                            disabled
                            className="bg-slate-50 border-slate-200 h-9"
                          />
                        </TableCell>
                        <TableCell className="py-3">
                          <Input
                            type="number"
                            placeholder="0"
                            className="text-right border-slate-200 focus:border-blue-500 h-9"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="py-3">
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="text-right border-slate-200 focus:border-blue-500 h-9"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "unitPrice",
                                Number(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-900 py-3">
                          ฿{item.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="pr-6 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            className="text-slate-400 hover:text-red-600 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
