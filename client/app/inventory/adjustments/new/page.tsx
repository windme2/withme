"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Plus, Trash2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [items, setItems] = useState([
    { id: 1, product: "", sku: "", status: "Add", quantity: 0, remark: "" },
  ]);

  // --- Mock Products for Dropdown ---
  const productsList = [
    { name: "A4 Paper 80gsm", sku: "SKU001" },
    { name: "Blue Ink Pen", sku: "SKU002" },
    { name: "Notebook A4", sku: "SKU003" },
    { name: "HB Pencil #2", sku: "SKU004" },
  ];

  // Function to add new row
  const addNewRow = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        product: "",
        sku: "",
        status: "Add",
        quantity: 0,
        remark: "",
      },
    ]);
  };

  // Function to remove row
  const removeRow = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  // Function to update row
  const updateRow = (id: number, field: string, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Auto-fill SKU if product changes
          if (field === "product") {
            const selectedProd = productsList.find((p) => p.name === value);
            updated.sku = selectedProd ? selectedProd.sku : "";
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    toast.success("Adjustment saved successfully!");
    setTimeout(() => router.push("/inventory/adjustments"), 1000);
  };

  // Calculations
  const totalQuantity = items.reduce(
    (sum, item) =>
      sum + (item.status === "Add" ? item.quantity : -item.quantity),
    0
  );
  const addedItems = items.filter((i) => i.status === "Add").length;
  const removedItems = items.filter((i) => i.status === "Remove").length;

  return (
    <MainLayout>
      <div className="space-y-6 p-1 pb-20">
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              New Adjustment
            </h1>
            <p className="text-slate-500">
              Create a new manual stock adjustment record.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {/* --- Top Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left: General Info */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Adjustment ID
                    </span>
                    <Input
                      value="ADJ-2025-001"
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Date
                    </span>
                    <Input
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Reference Note (Optional)
                  </span>
                  <Textarea
                    placeholder="e.g. Year-end audit..."
                    className="resize-none min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
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
                    <span className="text-slate-500">Total Lines</span>
                    <span className="font-medium text-slate-900">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Items to Add</span>
                    <span className="font-medium text-emerald-600">
                      +{addedItems}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Items to Remove</span>
                    <span className="font-medium text-red-600">
                      -{removedItems}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 my-2"></div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                      Net Quantity Change
                    </span>
                    <span
                      className={`font-bold ${
                        totalQuantity > 0
                          ? "text-emerald-600"
                          : totalQuantity < 0
                          ? "text-red-600"
                          : "text-slate-900"
                      }`}
                    >
                      {totalQuantity > 0 ? `+${totalQuantity}` : totalQuantity}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  {/* Save Button - Green Theme */}
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-11 text-base"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" /> Save ADJ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Bottom Section: Items Table --- */}
        <div className="mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">
                  Adjustment Items
                </CardTitle>
                <CardDescription>List of items to be adjusted.</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={addNewRow}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
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
                      <TableHead className="w-[150px]">SKU</TableHead>{" "}
                      {/* SKU มาก่อน */}
                      <TableHead className="min-w-[250px]">
                        Product Description
                      </TableHead>
                      <TableHead className="w-[160px]">Status</TableHead>
                      <TableHead className="w-[120px] text-right">
                        Quantity
                      </TableHead>
                      <TableHead className="min-w-[200px]">Remark</TableHead>
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

                        {/* SKU Column (Auto-filled / Read Only) */}
                        <TableCell className="py-3">
                          <Input
                            value={item.sku}
                            readOnly
                            className="bg-slate-50 text-slate-500 border-slate-200 h-9 font-mono"
                            placeholder="Auto"
                          />
                        </TableCell>

                        {/* Product Column (Select) */}
                        <TableCell className="py-3">
                          <Select
                            value={item.product}
                            onValueChange={(val) =>
                              updateRow(item.id, "product", val)
                            }
                          >
                            <SelectTrigger className="border-slate-200 focus:border-blue-500 h-9">
                              <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productsList.map((p) => (
                                <SelectItem key={p.sku} value={p.name}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Status Column (Type) */}
                        <TableCell className="py-3">
                          <Select
                            value={item.status}
                            onValueChange={(val) =>
                              updateRow(item.id, "status", val)
                            }
                          >
                            <SelectTrigger
                              className={`h-9 border-slate-200 ${
                                item.status === "Add"
                                  ? "text-emerald-600 font-medium"
                                  : "text-red-600 font-medium"
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="Add"
                                className="text-emerald-600"
                              >
                                Add Stock (+)
                              </SelectItem>
                              <SelectItem
                                value="Remove"
                                className="text-red-600"
                              >
                                Remove Stock (-)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Quantity Column */}
                        <TableCell className="py-3">
                          <Input
                            type="number"
                            placeholder="0"
                            className="text-right border-slate-200 focus:border-blue-500 h-9"
                            value={item.quantity}
                            onChange={(e) =>
                              updateRow(
                                item.id,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                          />
                        </TableCell>

                        {/* Remark Column */}
                        <TableCell className="py-3">
                          <Input
                            placeholder="Reason..."
                            className="border-slate-200 focus:border-blue-500 h-9"
                            value={item.remark}
                            onChange={(e) =>
                              updateRow(item.id, "remark", e.target.value)
                            }
                          />
                        </TableCell>

                        <TableCell className="pr-6 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-600 h-8 w-8"
                            onClick={() => removeRow(item.id)}
                            disabled={items.length === 1}
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
