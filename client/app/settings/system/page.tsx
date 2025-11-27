"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Bell, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notificationsApi } from "@/lib/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SystemSettingsPage() {
    const router = useRouter();

    return (
        <MainLayout>
            <div className="space-y-6 p-1 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
                        <p className="text-slate-500 mt-1">Configure general system preferences</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-slate-600" />
                            General Configuration
                        </CardTitle>
                        <CardDescription>Manage system-wide settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input defaultValue="WithMe Inventory Co." disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>System Currency</Label>
                                <Input defaultValue="THB (฿)" disabled />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Dark Mode</Label>
                                <p className="text-sm text-slate-500">Enable dark mode for the application</p>
                            </div>
                            <Switch disabled />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Maintenance Mode</Label>
                                <p className="text-sm text-slate-500">Prevent users from accessing the system</p>
                            </div>
                            <Switch disabled />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
