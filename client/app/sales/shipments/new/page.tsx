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
  Truck,
  Package,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { inventoryApi, shipmentsApi, salesOrdersApi } from "@/lib/api";

export default function NewShipmentPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Form State ---
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [salesOrderId, setSalesOrderId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");

  const CARRIERS = [
    { id: "kerry", name: "Kerry Express" },
    { id: "flash", name: "Flash Express" },
    { id: "jnt", name: "J&T Express" },
    { id: "thailand_post", name: "Thailand Post" },
    { id: "ems", name: "EMS" },
    { id: "shopee", name: "Shopee Logistics" },
    { id: "other", name: "Other" },
  ];

  const generateTracking = (carrierId?: string) => {
    const prefix = carrierId ? carrierId.toUpperCase().slice(0, 3) : "TRK";
    const time = Date.now().toString().slice(-6);
    const rand = Math.floor(Math.random() * 900 + 100).toString();
    return `${prefix}-${time}-${rand}`;
  };

  const [items, setItems] = useState([
    { id: 1, productId: "", name: "", sku: "", quantity: 0, unit: "" },
  ]);

  // --- Fetch Products & Sales Orders ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ordersData] = await Promise.all([
          inventoryApi.getAll(),
          salesOrdersApi.getAll("confirmed"),
        ]);
        setProducts(productsData);
        // API already returns confirmed orders when requested, so use as-is
        setSalesOrders(ordersData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load data");
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
        unit: "",
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
              updated.unit = product.unit;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSalesOrderChange = async (orderId: string) => {
    if (!orderId || orderId === "none") {
      setSalesOrderId("");
      setCustomerName("");
      setItems([{ id: 1, productId: "", name: "", sku: "", quantity: 0, unit: "" }]);
      return;
    }

    setSalesOrderId(orderId);
    const order = salesOrders.find(o => o.id === orderId);
    if (order) {
      setCustomerName(order.customer || order.customerName || "");
      // Load order items
      try {
        const orderDetails = await salesOrdersApi.getOne(orderId);
        if (orderDetails.items && orderDetails.items.length > 0) {
          setItems(orderDetails.items.map((item: { productId?: string; name?: string; sku?: string; qty?: number; quantity?: number; unit?: string }, index: number) => ({
            id: Date.now() + index,
            productId: item.productId || "",
            name: item.name || "",
            sku: item.sku || "",
            quantity: item.qty || item.quantity || 0,
            unit: item.unit || "",
          })));
          toast.success(`Loaded ${orderDetails.items.length} items from ${orderDetails.soNumber || orderId}`);
        }
      } catch (error) {
        console.error("Failed to load order details:", error);
        toast.error("Failed to load SO details");
      }
    }
  };

  const handleSave = async () => {
    if (!customerName) {
      toast.error("Please enter customer name");
      return;
    }
    if (!shippingAddress) {
      toast.error("Please enter shipping address");
      return;
    }
    if (items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error("Please fill in all item details correctly");
      return;
    }

    setLoading(true);
    try {
      await shipmentsApi.create({
        salesOrderId: salesOrderId || null,
        customerName,
        shippingAddress,
        carrier: carrier || null,
        trackingNumber: trackingNumber || generateTracking(carrier),
        shippedDate: date,
        notes,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
        }))
      });
      toast.success("Shipment created successfully!");
      setTimeout(() => router.push("/sales/shipments"), 1000);
    } catch (error) {
      console.error("Failed to create shipment:", error);
      toast.error("Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  // --- Calculations ---
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MainLayout>
      <div className="space-y-6 p-1 pb-20">
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create New Shipment
            </h1>
            <p className="text-slate-500">สร้างใบจัดส่งสินค้าใหม่</p>
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
                  Shipment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Shipment Number and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="shipment-number">Shipment Number</Label>
                    <Input
                      id="shipment-number"
                      placeholder="Auto-generated"
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Shipment Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sales Order and Customer Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="sales-order">Reference SO</Label>
                    <Select value={salesOrderId} onValueChange={handleSalesOrderChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select confirmed SO (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesOrders.map(o => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.soNumber || o.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-2">
                  <Label htmlFor="shipping-address">Shipping Address</Label>
                  <Textarea
                    id="shipping-address"
                    placeholder="Enter complete shipping address..."
                    rows={3}
                    className="resize-none min-h-[80px]"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                </div>

                {/* Carrier and Tracking Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="carrier">Carrier</Label>
                    <Select value={carrier} onValueChange={(val) => {
                      setCarrier(val);
                      if (!trackingNumber) setTrackingNumber(generateTracking(val));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARRIERS.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tracking-number">Tracking Number</Label>
                    <Input
                      id="tracking-number"
                      placeholder="Auto-generated tracking number"
                      value={trackingNumber}
                      disabled
                      className="bg-slate-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Shipment notes or special instructions..."
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
                  Shipment Summary
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

                  {customerName && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Customer</p>
                      <p className="text-sm font-semibold text-slate-900">{customerName}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-auto">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md h-11 text-base transition-all hover:scale-[1.02]"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Creating..." : "Create Shipment"}
                  </Button>
                  <div className="flex items-start gap-2 text-xs text-slate-400 px-1">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Shipment will be created with pending status. 
                      Inventory will be updated upon confirmation.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Bottom Section: Shipment Items Table (FULL WIDTH) --- */}
        <div className="mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Shipment Items
                </CardTitle>
                <CardDescription>Add items to ship.</CardDescription>
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
                      <TableHead className="w-[100px]">Unit</TableHead>
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
                        <TableCell className="py-3 text-slate-600">
                          {item.unit || "-"}
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
