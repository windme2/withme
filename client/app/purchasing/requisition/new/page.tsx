"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  FileText,
  Package,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { inventoryApi, purchasingApi } from "@/lib/api";

export default function NewPurchaseRequisitionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Form State ---
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [requester, setRequester] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    { id: 1, productId: "", name: "", sku: "", quantity: 0, unitPrice: 0, total: 0 },
  ]);

  // --- Fetch Products ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await inventoryApi.getAll();
        setProducts(data);
      } catch (error) {
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
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
              // PR usually estimates price. Let's assume 0 or last price if we had it.
              // For now, let user input price or default to 0.
              updated.unitPrice = 0;
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
    if (!requester) {
      toast.error("Please enter requester name");
      return;
    }
    if (items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error("Please fill in all item details correctly");
      return;
    }

    setLoading(true);
    try {
      await purchasingApi.create({
        date,
        requester, // Note: Backend currently uses hardcoded userId, but we can pass this in notes or update backend to use it if needed.
        // Actually, backend uses hardcoded userId for `requested_by`.
        // Let's pass requester name in notes for now or just rely on the hardcoded user.
        priority,
        notes: `${notes} (Requested by: ${requester})`,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      });
      toast.success("Purchase Requisition created successfully!");
      setTimeout(() => router.push("/purchasing/requisition"), 1000);
    } catch (error) {
      toast.error("Failed to create PR");
    } finally {
      setLoading(false);
    }
  };

  // --- Calculations ---
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MainLayout>
      <div className="space-y-6 p-1 pb-20">
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create New PR
            </h1>
            <p className="text-slate-500">สร้างใบขอซื้อสินค้าใหม่</p>
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

        {/* --- Top Section: General Info (2/3) & Summary (1/3) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: General Information (2/3) */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pr-number">PR Number</Label>
                    <Input
                      id="pr-number"
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

                {/* Combined Requested By and Priority into one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* REQUESTED BY */}
                  <div className="space-y-2">
                    <Label htmlFor="requested-by">Requested By</Label>
                    <Input
                      id="requested-by"
                      placeholder="Enter requester name"
                      value={requester}
                      onChange={(e) => setRequester(e.target.value)}
                    />
                  </div>
                  {/* PRIORITY */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Reason for this purchase request..."
                    rows={3}
                    className="resize-none min-h-[80px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary (1/3) */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-sm sticky top-6 h-full">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col justify-between gap-6 flex-1">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Items</span>
                    <span className="font-medium text-slate-900">
                      {totalItems}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Quantity</span>
                    <span className="font-medium text-slate-900">
                      {totalQuantity}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 my-2"></div>

                  {/* Estimated Total */}
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-base font-bold text-slate-800">
                      Estimated Total
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ฿{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md h-11 text-base transition-all hover:scale-[1.02]"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Submitting..." : "Submit PR"}
                  </Button>
                  <div className="flex items-start gap-2 text-xs text-slate-400 px-1">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Final price is subject to approval, vendor quotation,
                      taxes, and shipping fees.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Bottom Section: Requested Items Table (FULL WIDTH) --- */}
        <div className="mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Requested Items
                </CardTitle>
                <CardDescription>Add items to list.</CardDescription>
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
                      <TableHead className="pl-6 w-[50px] text-center">
                        #
                      </TableHead>
                      <TableHead className="min-w-[250px]">Product</TableHead>
                      <TableHead className="w-[150px]">SKU</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Qty
                      </TableHead>
                      <TableHead className="w-[140px] text-right">
                        Est. Unit Price
                      </TableHead>
                      <TableHead className="w-[140px] text-right">
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
