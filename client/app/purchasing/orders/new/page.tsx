"use client";

import { useState } from "react";
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
  Truck,
  ListOrdered, // New Icon for PR Ref selection
} from "lucide-react";
import { toast } from "sonner";

// --- Type Definitions for Clarity ---
type ItemType = {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

// --- Mock Data: Approved Purchase Requisitions (PRs) ---
const approvedPRs = [
  {
    id: "PR-2025-001",
    requestedBy: "Jane Doe",
    supplierRecommendation: "Tech World Co.",
    items: [
      { name: "Wireless Keyboard", sku: "KB01", quantity: 5, unitPrice: 0 },
      { name: "USB-C Hub", sku: "USBH03", quantity: 10, unitPrice: 0 },
    ],
  },
  {
    id: "PR-2025-002",
    requestedBy: "John Smith",
    supplierRecommendation: "Office Pro Supply",
    items: [
      { name: "Shipping Labels", sku: "LAB01", quantity: 100, unitPrice: 0 },
      { name: "Packing Tape", sku: "TAP05", quantity: 50, unitPrice: 0 },
    ],
  },
];

export default function NewPurchaseOrderPage() {
  const router = useRouter();

  // --- State Management ---
  const [items, setItems] = useState<ItemType[]>([
    { id: 1, name: "", sku: "", quantity: 0, unitPrice: 0, total: 0 },
  ]);
  const [selectedPRId, setSelectedPRId] = useState<string | null>(null); // Track selected PR
  const [generalInfo, setGeneralInfo] = useState({
    supplier: "",
    paymentTerms: "",
    prRef: "",
  });

  // --- Core Logic: Handle PR Selection ---
  const handlePrSelect = (prId: string) => {
    setSelectedPRId(prId);
    setGeneralInfo({ ...generalInfo, prRef: prId });
    const pr = approvedPRs.find((p) => p.id === prId);

    if (pr) {
      // 1. Populate items from the selected PR
      const newItems: ItemType[] = pr.items.map((item, index) => ({
        id: index + 1, // Use index + 1 for simple mapping ID
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice, // Unit Price starts at 0, must be filled by PO issuer
        total: 0,
      }));
      setItems(newItems);

      // 2. Automatically set the recommended supplier
      setGeneralInfo((prev) => ({
        ...prev,
        supplier: pr.supplierRecommendation, // Use the recommendation
      }));
      toast.info(`Loaded items from ${prId}. Supplier pre-filled.`);
    } else {
      // Reset if selection cleared
      setItems([
        { id: 1, name: "", sku: "", quantity: 0, unitPrice: 0, total: 0 },
      ]);
      setGeneralInfo({ ...generalInfo, supplier: "", prRef: "" });
    }
  };

  // --- Item Handlers (Simplified, allowing modification of Qty/Price) ---
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
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

  const updateItem = (id: number, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
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

  const handleSave = () => {
    if (!generalInfo.supplier) {
      toast.error("Please select a Supplier.");
      return;
    }
    if (items.some((item) => item.quantity <= 0)) {
      toast.error("All items must have a quantity greater than zero.");
      return;
    }
    if (items.some((item) => item.unitPrice <= 0)) {
      toast.error("Please specify Unit Price for all items.");
      return;
    }

    // In a real app, send data including generalInfo and items to backend
    toast.success("Purchase Order issued successfully!");
    setTimeout(() => router.back(), 1000);
  };

  // --- Calculations ---
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Determine if the item row came from a selected PR (name/sku should be view-only)
  const isPrItem = (item: ItemType) =>
    selectedPRId &&
    approvedPRs.some((pr) =>
      pr.items.some(
        (prItem) => prItem.name === item.name && prItem.sku === item.sku
      )
    );

  return (
    <MainLayout>
      <div className="space-y-6 p-1 pb-20">
        {/* --- Header Section --- */}
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

        {/* --- Top Section: General Info (2/3) & Summary (1/3) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: General Information (2/3) */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Purchase Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Reference PR Section (Dropdown to load items) */}
                <div className="space-y-2 pb-3 border-b border-slate-100">
                  <Label
                    htmlFor="pr-selection"
                    className="flex items-center gap-1 font-semibold text-blue-600"
                  >
                    <ListOrdered className="h-4 w-4" /> Load from Approved PR
                  </Label>
                  <Select
                    onValueChange={handlePrSelect}
                    value={selectedPRId || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an Approved PR No. to load items" />
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
                    />
                  </div>
                </div>

                {/* Supplier / Payment Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">
                      Supplier <span className="text-red-500">*</span>
                    </Label>
                    {/* Supplier Select is controlled by generalInfo.supplier state */}
                    <Select
                      onValueChange={(val) =>
                        setGeneralInfo({ ...generalInfo, supplier: val })
                      }
                      value={generalInfo.supplier}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tech World Co.">
                          Tech World Co.
                        </SelectItem>
                        <SelectItem value="Office Pro Supply">
                          Office Pro Supply
                        </SelectItem>
                        <SelectItem value="ABC Stationery Co.">
                          ABC Stationery Co.
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select
                      onValueChange={(val) =>
                        setGeneralInfo({ ...generalInfo, paymentTerms: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COD">Cash on Delivery</SelectItem>
                        <SelectItem value="NET30">Net 30 Days</SelectItem>
                        <SelectItem value="NET60">Net 60 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Requested By / Required Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pr-ref">Reference PR No.</Label>
                    <Input
                      id="pr-ref"
                      placeholder="Linked PR automatically fills this field"
                      disabled // Disable manual input as it's controlled by the PR selection above
                      value={generalInfo.prRef}
                      className="bg-slate-50 text-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="required-date">Delivery Date</Label>
                    <Input id="required-date" type="date" />
                  </div>
                </div>

                {/* Notes consolidated inside this card */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / Delivery Instructions</Label>
                  <Textarea
                    id="notes"
                    placeholder="Specific delivery time or receiving instructions..."
                    rows={3}
                    className="resize-none min-h-[80px]"
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

        {/* --- Bottom Section: Ordered Items Table (FULL WIDTH) --- */}
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
                disabled={!!selectedPRId} // Disable manual add if items are loaded from PR
              >
                <Plus className="h-4 w-4 mr-2" />
                {selectedPRId ? "Items Loaded" : "Add Item"}
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
                      <TableHead className="min-w-[200px]">Item Name</TableHead>
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
                          <Input
                            placeholder="Product Name / Description"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(item.id, "name", e.target.value)
                            }
                            className={`h-9 ${
                              isPrItem(item)
                                ? "bg-slate-100 text-slate-600"
                                : "border-slate-200 focus:border-blue-500"
                            }`}
                            disabled={isPrItem(item)} // Disable editing if loaded from PR
                          />
                        </TableCell>
                        <TableCell className="py-3">
                          <Input
                            placeholder="SKU"
                            value={item.sku}
                            onChange={(e) =>
                              updateItem(item.id, "sku", e.target.value)
                            }
                            className={`h-9 ${
                              isPrItem(item)
                                ? "bg-slate-100 text-slate-600"
                                : "border-slate-200 focus:border-blue-500"
                            }`}
                            disabled={isPrItem(item)} // Disable editing if loaded from PR
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
