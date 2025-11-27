"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Truck, Package, MapPin, CheckCircle, XCircle } from "lucide-react";
import { shipmentsApi } from "@/lib/api";
import { toast } from "sonner";

export default function ShipmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [shipment, setShipment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchShipment = async () => {
        try {
            setIsLoading(true);
            const data = await shipmentsApi.getOne(id);
            setShipment(data);
        } catch (error) {
            toast.error("Failed to load shipment details");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchShipment();
        }
    }, [id]);

    const handleStatusUpdate = async (status: string) => {
        try {
            setIsUpdating(true);
            await shipmentsApi.updateStatus(id, status);
            toast.success(`Shipment marked as ${status}`);
            fetchShipment();
        } catch (error) {
            toast.error(`Failed to update status`);
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "delivered":
                return "bg-emerald-100 text-emerald-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "pending":
                return "bg-amber-100 text-amber-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-slate-100 text-slate-800";
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-slate-500">Loading shipment details...</div>
                </div>
            </MainLayout>
        );
    }

    if (!shipment) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <div className="text-slate-500">Shipment not found</div>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6 p-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{shipment.shipmentNumber}</h1>
                                <Badge variant="secondary" className={getStatusColor(shipment.status)}>
                                    {shipment.status}
                                </Badge>
                            </div>
                            <p className="text-slate-500 mt-1">
                                Shipped on {shipment.shipmentDate ? new Date(shipment.shipmentDate).toLocaleDateString() : '-'} • Tracking: {shipment.trackingNumber || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    {shipment.status === "Shipped" && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => handleStatusUpdate("cancelled")}
                                disabled={isUpdating}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Shipment
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleStatusUpdate("delivered")}
                                disabled={isUpdating}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Delivered
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Shipment Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shipment.items?.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name || item.productName || item.products?.name}</TableCell>
                                                <TableCell>{item.sku || item.products?.sku}</TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {shipment.notes && (
                            <Card>
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                        Delivery Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <p className="text-slate-600 whitespace-pre-wrap">{shipment.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    Shipping Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Customer</p>
                                    <p className="font-medium text-slate-900 mt-1">{shipment.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Shipping Address</p>
                                    <p className="font-medium text-slate-900 mt-1 whitespace-pre-wrap">{shipment.shippingAddress}</p>
                                </div>
                                {shipment.trackingNumber && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Tracking Number</p>
                                        <p className="font-medium text-slate-900 mt-1 font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                                            {shipment.trackingNumber}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
