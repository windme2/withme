"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Truck, Package } from "lucide-react";
import { toast } from "sonner";
import { salesOrdersApi, shipmentsApi } from "@/lib/api";

export default function NewShipmentPage() {
  const router = useRouter();
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedSoId, setSelectedSoId] = useState("");
  const [soDetails, setSoDetails] = useState<any>(null);
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [shipmentItems, setShipmentItems] = useState<{ salesOrderItemId: string; quantity: number; maxQty: number; productName: string; sku: string }[]>([]);

  // Fetch Sales Orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // Ideally filter by status 'confirmed' or 'partially_shipped'
        const data = await salesOrdersApi.getAll("confirmed");
        setSalesOrders(data);
      } catch (error) {
        toast.error("Failed to load sales orders");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch SO Details when selected
  useEffect(() => {
    if (!selectedSoId) {
      setSoDetails(null);
      setShipmentItems([]);
      return;
    }

    const fetchSoDetails = async () => {
      try {
        const data = await salesOrdersApi.getOne(selectedSoId);
        setSoDetails(data);

        // Initialize shipment items with max quantity (ordered quantity)
        // In a real app, we should subtract already shipped quantity
        if (data.salesOrderItems) {
          const items = data.salesOrderItems.map((item: any) => ({
            salesOrderItemId: item.id,
            quantity: item.quantity, // Default to full remaining quantity
            maxQty: item.quantity,
            productName: item.products?.name || "Unknown Product",
            sku: item.products?.sku || "N/A"
          }));
          setShipmentItems(items);
        }
      } catch (error) {
        toast.error("Failed to load order details");
      }
    };
    fetchSoDetails();
  }, [selectedSoId]);

  const handleQuantityChange = (index: number, value: string) => {
    const qty = parseInt(value) || 0;
    const updatedItems = [...shipmentItems];

    // Validate against max quantity
    if (qty > updatedItems[index].maxQty) {
      toast.error(`Cannot ship more than ordered quantity (${updatedItems[index].maxQty})`);
      updatedItems[index].quantity = updatedItems[index].maxQty;
    } else {
      updatedItems[index].quantity = qty;
    }

    setShipmentItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSoId) {
      toast.error("Please select a Sales Order");
      return;
    }

    if (!shipmentDate) {
      toast.error("Please select a shipment date");
      return;
    }

    // Filter out items with 0 quantity
    const itemsToShip = shipmentItems.filter(item => item.quantity > 0);

    if (itemsToShip.length === 0) {
      toast.error("Please specify at least one item to ship");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        salesOrderId: selectedSoId,
        trackingNumber,
        shipmentDate,
        notes,
        items: itemsToShip.map(item => ({
          salesOrderItemId: item.salesOrderItemId,
          quantity: item.quantity
        }))
      };

      await shipmentsApi.create(payload);
      toast.success("Shipment created successfully!");
      router.push("/sales/shipments");
    } catch (error) {
      toast.error("Failed to create shipment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Shipment</h1>
            <p className="text-slate-500 mt-1">Create a shipment for a sales order</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Shipment Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Shipment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Sales Order *</Label>
                    <Select value={selectedSoId} onValueChange={setSelectedSoId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sales Order" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesOrders.map((so) => (
                          <SelectItem key={so.id} value={so.id}>
                            {so.id} - {so.customer} ({new Date(so.date).toISOString().split('T')[0]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shipment Date *</Label>
                      <Input
                        type="date"
                        value={shipmentDate}
                        onChange={(e) => setShipmentDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tracking Number</Label>
                      <Input
                        placeholder="e.g. KERRY123456"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              {soDetails && (
                <Card>
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Items to Ship
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Ordered</TableHead>
                          <TableHead className="text-right w-[150px]">Ship Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shipmentItems.map((item, index) => (
                          <TableRow key={item.salesOrderItemId}>
                            <TableCell className="font-medium">{item.sku}</TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-center">{item.maxQty}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="0"
                                max={item.maxQty}
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                className="text-right"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Summary */}
            <div className="space-y-6">
              {soDetails && (
                <Card>
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg">Customer Info</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">Customer Name</p>
                      <p className="font-medium">{soDetails.customerName}</p>
                    </div>
                    {soDetails.contactPerson && (
                      <div>
                        <p className="text-xs text-slate-500">Contact Person</p>
                        <p className="font-medium">{soDetails.contactPerson}</p>
                      </div>
                    )}
                    {soDetails.customerPhone && (
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium">{soDetails.customerPhone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500">Order Date</p>
                      <p className="font-medium">{new Date(soDetails.orderDate).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || !selectedSoId}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Creating..." : "Create Shipment"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
