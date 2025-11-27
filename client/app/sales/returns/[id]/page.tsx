"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Package, User, FileText } from "lucide-react";
import { returnsApi } from "@/lib/api";
import { toast } from "sonner";

export default function ReturnDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [returnDetails, setReturnDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchReturnDetails = async () => {
        try {
            setIsLoading(true);
            const data = await returnsApi.getOne(id);
            setReturnDetails(data);
        } catch (error) {
            toast.error("Failed to load return details");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchReturnDetails();
        }
    }, [id]);

    const handleStatusUpdate = async (status: string) => {
        try {
            setIsUpdating(true);
            await returnsApi.updateStatus(id, status);
            toast.success(`Return ${status} successfully`);
            fetchReturnDetails(); // Refresh details
        } catch (error) {
            toast.error(`Failed to update status to ${status}`);
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "approved":
            case "completed":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-slate-100 text-slate-800";
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-slate-500">Loading return details...</div>
                </div>
            </MainLayout>
        );
    }

    if (!returnDetails) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <div className="text-slate-500">Return not found</div>
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
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{returnDetails.returnNumber}</h1>
                                <Badge variant="secondary" className={getStatusColor(returnDetails.status)}>
                                    {returnDetails.status}
                                </Badge>
                            </div>
                            <p className="text-slate-500 mt-1">
                                Created on {returnDetails.returnDate} • SO: {returnDetails.soNumber}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    {returnDetails.status === "Pending" && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => handleStatusUpdate("rejected")}
                                disabled={isUpdating}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleStatusUpdate("approved")}
                                disabled={isUpdating}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Return
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
                                    Returned Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Condition</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {returnDetails.items.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.sku}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{item.condition}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.quantity} {item.unit}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-slate-50 font-medium">
                                            <TableCell colSpan={5} className="text-right">Total Refund Amount:</TableCell>
                                            <TableCell className="text-right text-lg">
                                                ${returnDetails.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {returnDetails.notes && (
                            <Card>
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <p className="text-slate-600 whitespace-pre-wrap">{returnDetails.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Customer Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Customer Name</p>
                                    <p className="font-medium text-slate-900 mt-1">{returnDetails.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Reason for Return</p>
                                    <p className="font-medium text-slate-900 mt-1">{returnDetails.reason}</p>
                                </div>
                                {returnDetails.refundMethod && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Refund Method</p>
                                        <p className="font-medium text-slate-900 mt-1">{returnDetails.refundMethod}</p>
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
