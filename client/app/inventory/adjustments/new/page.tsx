"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { inventoryApi, adjustmentsApi } from "@/lib/api";
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
import { Plus, Trash2, Save, ArrowLeft, ClipboardList, Package } from "lucide-react";
import { toast } from "sonner";

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("Add");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    { id: 1, productId: "", name: "", sku: "", quantity: 0, unitPrice: 0, reason: "" },
  ]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await inventoryApi.getAll();
        setProducts(productsData);
      } catch (error) {
        toast.error("Failed to load products");
      }
    };
    fetchData();
  }, []);

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
        reason: "",
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
              updated.unitPrice = product.unit_price || product.unitPrice || 0;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    if (items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error("Please fill in all item details correctly");
      return;
    }

    setLoading(true);
    try {
      await adjustmentsApi.create({
        type,
        date,
        notes,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          reason: i.reason
        }))
      });
      toast.success("Adjustment created successfully!");
      setTimeout(() => router.push("/inventory/adjustments"), 1000);
    } catch (error) {
      toast.error("Failed to create adjustment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1 pb-20">
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create New Adjustment
            </h1>
            <p className="text-slate-500">
              ปรับปรุงยอดสินค้าคงคลัง (เพิ่ม/ลด)
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
          {/* --- Left Column: General Info (2/3 Width) --- */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="adj-number">Adjustment Number</Label>
                    <Input
                      id="adj-number"
                      placeholder="Auto-generated"
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
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
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Add">Add Stock</SelectItem>
                        <SelectItem value="Remove">Remove Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Reason for adjustment..."
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
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Summary
                </CardTitle>
              </CardHeader>

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
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-11 text-base transition-all hover:scale-[1.02]"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Adjustment"}
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
                  Adjustment Items
                </CardTitle>
                <CardDescription>List of items to adjust.</CardDescription>
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
                      <TableHead className="w-[120px]">SKU</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Qty
                      </TableHead>
                      <TableHead className="w-[120px] text-right">
                        Unit Price
                      </TableHead>
                      <TableHead className="min-w-[180px]">
                        Reason
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
                            step="0.01"
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
                        <TableCell className="py-3">
                          <Input
                            placeholder="Reason (Optional)"
                            className="border-slate-200 focus:border-blue-500 h-9"
                            value={item.reason}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "reason",
                                e.target.value
                              )
                            }
                          />
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
