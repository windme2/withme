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
import { ArrowLeft, Save, RotateCcw, Package } from "lucide-react";
import { toast } from "sonner";
import { salesOrdersApi, returnsApi } from "@/lib/api";

export default function NewReturnPage() {
  const router = useRouter();
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedSoId, setSelectedSoId] = useState("");
  const [soDetails, setSoDetails] = useState<any>(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [returnItems, setReturnItems] = useState<{ productId: string; quantity: number; maxQty: number; productName: string; sku: string; unitPrice: number; condition: string }[]>([]);

  // Fetch Sales Orders on mount (Completed or Shipped)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // Ideally filter by status 'shipped' or 'completed'
        // For now fetching all and user can select
        const data = await salesOrdersApi.getAll();
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
      setReturnItems([]);
      return;
    }

    const fetchSoDetails = async () => {
      try {
        const data = await salesOrdersApi.getOne(selectedSoId);
        setSoDetails(data);

        // Initialize return items with 0 quantity (user selects what to return)
        if (data.salesOrderItems) {
          const items = data.salesOrderItems.map((item: any) => ({
            productId: item.productId,
            quantity: 0,
            maxQty: item.quantity,
            productName: item.products?.name || "Unknown Product",
            sku: item.products?.sku || "N/A",
            unitPrice: item.unitPrice,
            condition: "Good"
          }));
          setReturnItems(items);
        }
      } catch (error) {
        toast.error("Failed to load order details");
      }
    };
    fetchSoDetails();
  }, [selectedSoId]);

  const handleQuantityChange = (index: number, value: string) => {
    const qty = parseInt(value) || 0;
    const updatedItems = [...returnItems];

    // Validate against max quantity
    if (qty > updatedItems[index].maxQty) {
      toast.error(`Cannot return more than ordered quantity (${updatedItems[index].maxQty})`);
      updatedItems[index].quantity = updatedItems[index].maxQty;
    } else {
      updatedItems[index].quantity = qty;
    }

    setReturnItems(updatedItems);
  };

  const handleConditionChange = (index: number, value: string) => {
    const updatedItems = [...returnItems];
    updatedItems[index].condition = value;
    setReturnItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSoId) {
      toast.error("Please select a Sales Order");
      return;
    }

    if (!reason) {
      toast.error("Please provide a reason for return");
      return;
    }

    // Filter out items with 0 quantity
    const itemsToReturn = returnItems.filter(item => item.quantity > 0);

    if (itemsToReturn.length === 0) {
      toast.error("Please specify at least one item to return");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        soNumber: soDetails.soNumber,
        customerName: soDetails.customerName,
        returnDate,
        reason,
        items: itemsToReturn.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          condition: item.condition
        }))
      };

      await returnsApi.create(payload);
      toast.success("Return created successfully!");
      router.push("/sales/returns");
    } catch (error) {
      toast.error("Failed to create return");
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Return</h1>
            <p className="text-slate-500 mt-1">Process a customer return</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Return Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-blue-600" />
                    Return Details
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
                      <Label>Return Date *</Label>
                      <Input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason *</Label>
                      <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Defective">Defective Product</SelectItem>
                          <SelectItem value="Wrong Item">Wrong Item Sent</SelectItem>
                          <SelectItem value="Damaged">Damaged in Shipping</SelectItem>
                          <SelectItem value="No Longer Needed">No Longer Needed</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              {soDetails && (
                <Card>
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Items to Return
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Ordered</TableHead>
                          <TableHead className="text-right w-[120px]">Return Qty</TableHead>
                          <TableHead className="w-[150px]">Condition</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returnItems.map((item, index) => (
                          <TableRow key={item.productId}>
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
                            <TableCell>
                              <Select
                                value={item.condition}
                                onValueChange={(val) => handleConditionChange(index, val)}
                                disabled={item.quantity === 0}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Good">Good</SelectItem>
                                  <SelectItem value="Damaged">Damaged</SelectItem>
                                  <SelectItem value="Opened">Opened</SelectItem>
                                </SelectContent>
                              </Select>
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
                    {isSubmitting ? "Creating..." : "Create Return"}
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
