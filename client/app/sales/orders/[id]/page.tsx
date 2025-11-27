"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, Truck, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { salesOrdersApi } from "@/lib/api";

export default function SalesOrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchOrder = async () => {
        try {
            setIsLoading(true);
            const data = await salesOrdersApi.getOne(id);
            setOrder(data);
        } catch (error) {
            toast.error("Failed to load order details");
            router.push("/sales/orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            setIsUpdating(true);
            await salesOrdersApi.updateStatus(id, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrder(); // Refresh data
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <p className="text-slate-500">Loading order details...</p>
                </div>
            </MainLayout>
        );
    }

    if (!order) return null;

    return (
        <MainLayout>
            <div className="space-y-6 p-1">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                Order {order.soNumber}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'Draft' ? 'bg-slate-100 text-slate-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {order.status.toUpperCase()}
                                </span>
                                <span className="text-slate-500 text-sm">
                                    Created on {new Date(order.orderDate).toISOString().split('T')[0]}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {order.status === 'Draft' && (
                            <Button
                                onClick={() => handleStatusUpdate('confirmed')}
                                disabled={isUpdating}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Order
                            </Button>
                        )}
                        {order.status === 'Confirmed' && (
                            <Button
                                onClick={() => router.push('/sales/shipments/new')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Truck className="h-4 w-4 mr-2" />
                                Create Shipment
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Order Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-center">Quantity</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.salesOrderItems?.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium">{item.products?.name}</div>
                                                    <div className="text-xs text-slate-500">{item.products?.sku}</div>
                                                </TableCell>
                                                <TableCell className="text-right">฿{Number(item.unitPrice).toLocaleString()}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right font-medium">฿{Number(item.totalPrice).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-slate-50 font-medium">
                                            <TableCell colSpan={3} className="text-right">Total Amount</TableCell>
                                            <TableCell className="text-right text-blue-600">฿{Number(order.totalAmount).toLocaleString()}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Customer & Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-lg">Customer Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500">Customer Name</p>
                                    <p className="font-medium text-lg">{order.customerName}</p>
                                </div>
                                {order.contactPerson && (
                                    <div>
                                        <p className="text-xs text-slate-500">Contact Person</p>
                                        <p className="font-medium">{order.contactPerson}</p>
                                    </div>
                                )}
                                {order.customerEmail && (
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="font-medium">{order.customerEmail}</p>
                                    </div>
                                )}
                                {order.customerPhone && (
                                    <div>
                                        <p className="text-xs text-slate-500">Phone</p>
                                        <p className="font-medium">{order.customerPhone}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-lg">Order Info</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500">Order Date</p>
                                    <p className="font-medium">{new Date(order.orderDate).toISOString().split('T')[0]}</p>
                                </div>
                                {order.dueDate && (
                                    <div>
                                        <p className="text-xs text-slate-500">Due Date</p>
                                        <p className="font-medium">{new Date(order.dueDate).toISOString().split('T')[0]}</p>
                                    </div>
                                )}
                                {order.notes && (
                                    <div>
                                        <p className="text-xs text-slate-500">Notes</p>
                                        <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border">{order.notes}</p>
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
