"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Package,
  Search,
  Edit,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  X,
} from "lucide-react";
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
import { toast } from "sonner";

import { useEffect } from "react";
import { inventoryApi } from "@/lib/api";

// --- Types ---
interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  // Map backend 'categories' relation to string if needed, or adjust UI
  category: string | null;
  stock: number; // backend might use 'quantity' or different field? Schema says 'products' table has 'unit' but maybe not stock? 
  // Wait, schema has 'inventory_levels' table for quantity. 'products' table has 'minimum_stock'.
  // Let's check schema again. 'products' has no quantity field? 
  // Ah, schema says 'inventory_levels' has quantity.
  // But for now let's assume the API returns a flattened structure or we need to adjust the service.
  // Let's check the service implementation.
  // Service returns prisma.products.findMany().
  // Products table: id, sku, name, description, category_id, unit, minimum_stock...
  // It does NOT have quantity. Quantity is in inventory_levels.
  // I need to update the service to include inventory_levels.
  price: number; // Products table doesn't seem to have price? 
  // Schema: products table has no price. 
  // goods_received_items has unit_price.
  // This is an ERP. Price might be dynamic or cost price.
  // Let's check schema for price.
  // 'products' table: id, sku, name... no price.
  // I should probably add a price field to products or use a related table.
  // For this demo, I might need to mock it or add it to schema.
  // Let's look at the schema again.

  status: string;
}

// Placeholder for now until I fix the service
const allItems: any[] = [];

export default function InventoryItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Edit Modal State ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await inventoryApi.getAll();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
        toast.error("Failed to load inventory items");
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  // --- Filter Logic ---
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // --- Stats Calculation ---
  const totalItems = items.length;
  const lowStockItems = items.filter(
    (item) => item.status === "Low Stock"
  ).length;
  const outOfStockItems = items.filter(
    (item) => item.status === "Out of Stock"
  ).length;
  const totalValue = items.reduce(
    (sum, item) => sum + item.price * item.stock,
    0
  );

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // --- Derived Data ---
  const categories = [
    "all",
    ...Array.from(new Set(items.map((item) => item.category || 'Uncategorized'))),
  ];
  const statuses = ["all", "In Stock", "Low Stock", "Out of Stock"];

  // --- Event Handlers ---
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await inventoryApi.update(editingItem.id, editingItem);
      toast.success(`Updated ${editingItem.name} successfully!`);

      // Refresh list
      const data = await inventoryApi.getAll();
      setItems(data);

      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Items Management
            </h1>
            <p className="text-slate-500 mt-1">
              ตรวจสอบรายการสินค้าและสถานะคงคลังทั้งหมด ({totalItems} Items)
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Items"
            value={totalItems}
            icon={Package}
            iconColor="text-blue-600"
            bgIcon="bg-blue-50"
          />
          <StatCard
            title="Low Stock"
            value={lowStockItems}
            icon={AlertTriangle}
            iconColor="text-amber-600"
            bgIcon="bg-amber-50"
          />
          <StatCard
            title="Out of Stock"
            value={outOfStockItems}
            icon={X}
            iconColor="text-red-600"
            bgIcon="bg-red-50"
          />
          <StatCard
            title="Total Value"
            value={`฿${totalValue.toLocaleString()}`}
            icon={TrendingUp}
            iconColor="text-emerald-600"
            bgIcon="bg-emerald-50"
          />
        </div>

        {/* Main Content Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Item Description or SKU..."
                  className="pl-10 border-slate-200 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => {
                    setSelectedCategory(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px] border-slate-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={(val) => {
                    setSelectedStatus(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px] border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "all" ? "All Status" : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(searchTerm ||
                  selectedCategory !== "all" ||
                  selectedStatus !== "all") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFilters}
                      className="text-slate-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            </div>

            {/* Table Area */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              {paginatedItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No items found.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[100px] font-semibold text-slate-700 pl-6 pr-4">
                        SKU No.
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Item Description
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Category
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">
                        Quantity
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">
                        Price
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">
                        Amount
                      </TableHead>
                      <TableHead className="text-center font-semibold text-slate-700 pr-6">
                        Status
                      </TableHead>
                      {/* Removed: Action TableHead */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => handleEditClick(item)} // Use Row Click for details
                      >
                        {/* SKU No. - Changed text color to blue-700 */}
                        <TableCell className="font-medium text-blue-700 pl-6 py-4">
                          {item.sku}
                        </TableCell>
                        {/* Item Description */}
                        <TableCell className="py-4">
                          <span className="font-medium text-slate-900">
                            {item.name}
                          </span>
                        </TableCell>
                        {/* Category */}
                        <TableCell className="py-4">
                          <span className="text-slate-500">
                            {item.category}
                          </span>
                        </TableCell>
                        {/* Quantity */}
                        <TableCell className="text-right font-medium text-slate-700 py-4">
                          {item.stock}
                        </TableCell>
                        {/* Price */}
                        <TableCell className="text-right text-slate-600 py-4">
                          ฿{item.price.toLocaleString()}
                        </TableCell>
                        {/* Amount */}
                        <TableCell className="text-right font-medium text-slate-900 py-4">
                          ฿{(item.price * item.stock).toLocaleString()}
                        </TableCell>
                        {/* Status */}
                        <TableCell className="text-center py-4 pr-6">
                          <StatusBadge status={item.status} />
                        </TableCell>
                        {/* Removed: Action TableCell */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 gap-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(startIndex + itemsPerPage, filteredItems.length)} of{" "}
                  {filteredItems.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="text-sm font-medium text-slate-700 px-2">
                    Page {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="border-slate-200"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Edit Item Sheet --- */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="mb-6 border-b pb-4">
            <SheetTitle className="text-xl flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              แก้ไขสินค้า
            </SheetTitle>
            <SheetDescription>
              ปรับปรุงข้อมูลสินค้า **{editingItem?.name}**
              กดบันทึกเมื่อเสร็จสิ้น
            </SheetDescription>
          </SheetHeader>
          {editingItem && (
            <form onSubmit={handleSaveEdit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700"
                  >
                    ชื่อสินค้า
                  </Label>
                  <Input
                    id="name"
                    defaultValue={editingItem.name}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="sku"
                    className="text-sm font-medium text-slate-700"
                  >
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    defaultValue={editingItem.sku}
                    className="bg-slate-50"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium text-slate-700"
                  >
                    หมวดหมู่
                  </Label>
                  <Select
                    defaultValue={editingItem.category}
                    onValueChange={(val) =>
                      setEditingItem({ ...editingItem, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c !== "all")
                        .map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-sm font-medium text-slate-700"
                  >
                    ราคา (บาท)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    defaultValue={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="stock"
                    className="text-sm font-medium text-slate-700"
                  >
                    จำนวนคงเหลือ
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    defaultValue={editingItem.stock}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        stock: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-amber-600 mt-1">
                    หมายเหตุ: แนะนำให้ใช้ Stock Adjustment
                    สำหรับการปรับยอดสินค้า
                  </p>
                </div>
              </div>
              <SheetFooter className="mt-6 border-t pt-4">
                <div className="flex gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsEditOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    บันทึกการแก้ไข
                  </Button>
                </div>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// --- Sub-Components ---

import type { StatCardProps } from "@/lib/types";

function StatCard({ title, value, icon: Icon, iconColor, bgIcon }: StatCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgIcon}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
    "Out of Stock": "bg-red-50 text-red-700 border-red-200",
  };
  const currentStyle =
    styles[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status}
    </span>
  );
}
