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
  Package,
  Truck,
  ListOrdered,
} from "lucide-react";
import { toast } from "sonner";
import { purchasingApi, suppliersApi, inventoryApi, purchaseOrdersApi } from "@/lib/api";

type ItemType = {
  id: number;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export default function NewPurchaseOrderPage() {
  const router = useRouter();

  const [items, setItems] = useState<ItemType[]>([
    { id: 1, productId: "", name: "", sku: "", quantity: 0, unitPrice: 0, total: 0 },
  ]);
  const [selectedPRId, setSelectedPRId] = useState<string | null>(null);
  const [generalInfo, setGeneralInfo] = useState({
    supplierId: "",
    supplierName: "",
    prRef: "",
    expectedDate: "",
    notes: "",
  });

  // Data from API
  const [approvedPRs, setApprovedPRs] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [prsData, suppliersData, productsData] = await Promise.all([
          // fetch all PRs (include approved/pending) to avoid missing items created elsewhere
          purchasingApi.getAll(),
          suppliersApi.getAll(),
          inventoryApi.getAll(),
        ]);
        // normalize product price field names so client code can rely on `unit_price`
        const normalizedProducts = productsData.map((p: any) => ({
          ...p,
          unit_price: p.unit_price ?? p.unitPrice ?? p.price ?? p.unitPrice,
        }));

        setApprovedPRs(prsData);
        setSuppliers(suppliersData);
        setProducts(normalizedProducts);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrSelect = async (prId: string) => {
    if (!prId || prId === "" || prId === "none") {
      setSelectedPRId(null);
      setGeneralInfo((prev) => ({ ...prev, prRef: "" }));
      return;
    }

    setSelectedPRId(prId);

    try {
      const pr = await purchasingApi.getOne(prId);
      console.log('🔍 PR Data received:', pr);

      if (pr && pr.itemsList) {
        const newItems: ItemType[] = pr.itemsList.map((item: any, index: number) => {
          const qty = item.qty || item.quantity || 0;
          // try to find product details from loaded products list
          const prod = products.find((p) => p.id === item.productId);
          // prefer PR supplied price (item.price), else product unit price, else 0
          const unitPrice = item.price ? Number(item.price) : prod?.unit_price ? Number(prod.unit_price) : 0;
          const total = unitPrice * qty;

          return {
            id: index + 1,
            productId: item.productId || "",
            name: item.name,
            sku: item.sku,
            quantity: qty,
            unitPrice,
            total,
          };
        });
        setItems(newItems);
        toast.info(`Loaded ${newItems.length} items from ${prId}`);
      }

      // Auto-fill supplier if PR contains supplier information
      if (pr) {
        const supplierId = pr.supplierId || "";
        const supplierName = pr.supplierName || "";
        const sup = suppliers.find((s) => s.id === supplierId);

        console.log('🔍 Supplier info from PR:', { supplierId, supplierName, foundInList: !!sup });

        if (supplierId && sup) {
          // supplier exists in our suppliers list — select it
          setGeneralInfo((prev) => ({
            ...prev,
            prRef: prId,
            supplierId: supplierId,
            supplierName: supplierName,
          }));
        } else {
          // supplierId missing or supplier not in list — set PR ref and fallback name only
          setGeneralInfo((prev) => ({
            ...prev,
            prRef: prId,
            supplierName: supplierName,
          }));
        }
      } else {
        setGeneralInfo((prev) => ({ ...prev, prRef: prId }));
      }
    } catch (error) {
      console.error("Failed to load PR details:", error);
      toast.error("Failed to load PR details");
    }
  };

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

          // If product is selected, auto-fill name and SKU
          if (field === "productId") {
            const product = products.find((p) => p.id === value);
            if (product) {
              updated.name = product.name;
              updated.sku = product.sku;
            }
          }

          // Auto-calculate total when qty or price changes
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    if (!generalInfo.supplierId) {
      toast.error("Please select a Supplier.");
      return;
    }
    if (items.some((item) => !item.productId || item.quantity <= 0)) {
      toast.error("All items must have a product selected and quantity greater than zero.");
      return;
    }
    if (items.some((item) => item.unitPrice <= 0)) {
      toast.error("Please specify Unit Price for all items.");
      return;
    }

    try {
      const payload = {
        supplierId: generalInfo.supplierId,
        prNumber: generalInfo.prRef || null,
        expectedDate: generalInfo.expectedDate || null,
        notes: generalInfo.notes,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      await purchaseOrdersApi.create(payload);
      toast.success("Purchase Order issued successfully!");
      setTimeout(() => router.push("/purchasing/orders"), 1000);
    } catch (error) {
      console.error("Failed to create purchase order:", error);
      toast.error("Failed to create purchase order");
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const isPrItem = (item: ItemType) => selectedPRId && item.productId !== "";

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-500">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-1 pb-20">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create New PO
            </h1>
            <p className="text-slate-500">สร้างใบสั่งซื้อสินค้าใหม่</p>
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

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: General Information */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Purchase Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* PO Number / Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="po-number">PO Number</Label>
                    <Input
                      id="po-number"
                      placeholder="Auto-generated"
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Issue Date</Label>
                    <Input
                      id="date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>

                {/* Supplier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">
                      Supplier <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => {
                        const supplier = suppliers.find((s) => s.id === val);
                        setGeneralInfo((prev) => ({
                          ...prev,
                          supplierId: val,
                          supplierName: supplier?.name || "",
                        }));
                      }}
                      value={generalInfo.supplierId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* If supplier was auto-filled from PR but not present in suppliers list,
                        show the supplier name as a fallback so the user can see it. */}
                    {generalInfo.supplierId &&
                      !suppliers.find((s) => s.id === generalInfo.supplierId) && (
                        <div className="mt-2 text-sm text-slate-700">
                          {generalInfo.supplierName || generalInfo.supplierId}
                        </div>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pr-ref">
                      Reference PR
                    </Label>
                    <Select
                      onValueChange={handlePrSelect}
                      value={generalInfo.prRef || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select approved PR (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedPRs.map((pr) => (
                          <SelectItem key={pr.id} value={pr.id}>
                            {pr.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Expected Date */}
                <div className="space-y-2">
                  <Label htmlFor="expected-date">Expected Delivery Date</Label>
                  <Input
                    id="expected-date"
                    type="date"
                    value={generalInfo.expectedDate}
                    onChange={(e) =>
                      setGeneralInfo((prev) => ({ ...prev, expectedDate: e.target.value }))
                    }
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / Delivery Instructions</Label>
                  <Textarea
                    id="notes"
                    placeholder="Specific delivery time or receiving instructions..."
                    rows={3}
                    className="resize-none min-h-[80px]"
                    value={generalInfo.notes}
                    onChange={(e) =>
                      setGeneralInfo((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary */}
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
                    <span className="text-slate-500">Total Line Items</span>
                    <span className="font-medium text-slate-900">
                      {totalItems}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Units</span>
                    <span className="font-medium text-slate-900">
                      {totalQuantity}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 my-2"></div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-base font-bold text-slate-800">
                      Grand Total
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
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Issue PO
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Items to Order
                </CardTitle>
                <CardDescription>
                  Specify the products required from the supplier.
                </CardDescription>
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
                      <TableHead className="w-[150px]">
                        SKU / Part No.
                      </TableHead>
                      <TableHead className="w-[100px] text-right">
                        Qty
                      </TableHead>
                      <TableHead className="w-[140px] text-right">
                        Unit Price (฿)
                      </TableHead>
                      <TableHead className="w-[140px] text-right">
                        Total Amount (฿)
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
                            onValueChange={(val) =>
                              updateItem(item.id, "productId", val)
                            }
                            disabled={isPrItem(item)}
                          >
                            <SelectTrigger
                              className={`h-9 ${isPrItem(item)
                                ? "bg-slate-100 text-slate-600"
                                : "border-slate-200 focus:border-blue-500"
                                }`}
                            >
                              <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-3">
                          <Input
                            placeholder="SKU"
                            value={item.sku}
                            disabled
                            className="h-9 bg-slate-100 text-slate-600"
                          />
                        </TableCell>
                        <TableCell className="py-3">
                          <Input
                            type="number"
                            min="1"
                            placeholder="0"
                            className="text-right border-slate-200 focus:border-blue-500 h-9"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "quantity",
                                Number(e.target.value) < 0
                                  ? 0
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="py-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="text-right border-slate-200 focus:border-blue-500 h-9"
                            value={item.unitPrice === 0 ? "" : item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "unitPrice",
                                Number(e.target.value) < 0
                                  ? 0
                                  : Number(e.target.value)
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
                            disabled={items.length === 1 || isPrItem(item)}
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
