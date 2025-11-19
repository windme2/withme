"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Plus,
  FileText,
  Truck,
  RotateCcw,
  Calendar,
  ArrowRight,
} from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();

  // --- Mock Data ---

  // Recent Transactions
  const recentTransactions = [
    {
      id: "GRN-2025-015",
      type: "receipt",
      description: "รับสินค้าจาก Tech World Co.",
      amount: "฿45,000",
      date: "2 ชั่วโมงที่แล้ว",
      status: "completed",
    },
    {
      id: "SO-2025-030",
      type: "shipment",
      description: "จัดส่งสินค้าให้ Global Retail",
      amount: "฿55,000",
      date: "3 ชั่วโมงที่แล้ว",
      status: "shipped",
    },
    {
      id: "ADJ-2025-015",
      type: "adjustment",
      description: "ปรับยอดสินค้า (Internal Use)",
      amount: "-2 ชิ้น",
      date: "5 ชั่วโมงที่แล้ว",
      status: "completed",
    },
    {
      id: "RT-2025-005",
      type: "return",
      description: "รับคืนสินค้าจาก Local Tech Shop",
      amount: "฿5,000",
      date: "1 วันที่แล้ว",
      status: "received",
    },
    {
      id: "PR-2025-016",
      type: "requisition",
      description: "คำขอซื้อรอการอนุมัติ",
      amount: "฿32,000",
      date: "1 วันที่แล้ว",
      status: "pending",
    },
  ];

  const stats = [
    {
      title: "มูลค่าสินค้าคงคลัง",
      value: "฿1,240,500",
      icon: DollarSign,
      description: "มูลค่ารวมทั้งหมด",
      color: "bg-blue-500",
      change: "+12%",
      isPositive: true,
    },
    {
      title: "สินค้าทั้งหมด",
      value: "1,247",
      icon: Package,
      description: "รายการ (SKU)",
      color: "bg-indigo-500",
      change: "+8 Items",
      isPositive: true,
    },
    {
      title: "คำสั่งซื้อรออนุมัติ",
      value: "12",
      icon: ShoppingCart,
      description: "Pending Orders",
      color: "bg-amber-500",
      change: "รอจัดการ",
      isPositive: null,
    },
    {
      title: "สินค้าต้องเติม (Low Stock)",
      value: "5",
      icon: AlertTriangle,
      description: "ต่ำกว่าเกณฑ์",
      color: "bg-red-500",
      change: "-2 Items",
      isPositive: false,
    },
  ];

  // Data 1: Stock Movement (Area Chart)
  const stockMovementData = [
    { name: "Mon", inbound: 40, outbound: 24 },
    { name: "Tue", inbound: 30, outbound: 13 },
    { name: "Wed", inbound: 20, outbound: 58 },
    { name: "Thu", inbound: 27, outbound: 39 },
    { name: "Fri", inbound: 18, outbound: 48 },
    { name: "Sat", inbound: 23, outbound: 38 },
    { name: "Sun", inbound: 34, outbound: 43 },
  ];

  // Data 2: Revenue (Bar Chart)
  const salesData = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 2000 },
    { month: "Apr", sales: 2780 },
    { month: "May", sales: 1890 },
    { month: "Jun", sales: 2390 },
    { month: "Jul", sales: 3490 },
  ];

  // Data 3: Pending Approvals (Pie Chart) - เปลี่ยนใหม่ตามสั่ง
  const approvalStatusData = [
    { name: "รออนุมัติ (Pending)", value: 12, color: "#f59e0b" }, // Amber-500
    { name: "อนุมัติแล้ว (Approved)", value: 45, color: "#10b981" }, // Emerald-500
    { name: "ไม่อนุมัติ (Rejected)", value: 3, color: "#ef4444" }, // Red-500
  ];

  // Low Stock Items (เพิ่มเป็น 8 รายการ)
  const lowStockItems = [
    {
      name: "Notebook A4",
      sku: "PEN-001",
      quantity: 5,
      minLevel: 10,
      supplier: "ABC Corp",
    },
    {
      name: "HB Pencil #2",
      sku: "PEN-002",
      quantity: 3,
      minLevel: 20,
      supplier: "Write Co",
    },
    {
      name: "Stapler HD",
      sku: "OFF-001",
      quantity: 2,
      minLevel: 5,
      supplier: "Office Pro",
    },
    {
      name: "Glue Stick",
      sku: "GLU-001",
      quantity: 0,
      minLevel: 15,
      supplier: "Stick It",
    },
    {
      name: "Blue Ink Pen",
      sku: "PEN-005",
      quantity: 8,
      minLevel: 50,
      supplier: "Ink Master",
    },
    {
      name: "Correction Tape",
      sku: "OFF-015",
      quantity: 4,
      minLevel: 25,
      supplier: "Office Pro",
    },
    {
      name: "Whiteboard Marker",
      sku: "MRK-003",
      quantity: 6,
      minLevel: 30,
      supplier: "Marker Plus",
    },
    {
      name: "Paper Clips (Box)",
      sku: "CLP-001",
      quantity: 1,
      minLevel: 10,
      supplier: "Office Supplies",
    },
  ];

  const topProducts = [
    { name: "A4 Paper 80gsm", sales: 450, revenue: "฿12,500", trend: "up" },
    { name: "Blue Ink Pen", sales: 320, revenue: "฿8,900", trend: "up" },
    { name: "Office Chair", sales: 15, revenue: "฿45,000", trend: "down" },
    { name: "Whiteboard Marker", sales: 120, revenue: "฿3,600", trend: "up" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            ภาพรวมสถานะคลังสินค้าและยอดขายประจำวัน
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20`}
                  >
                    <stat.icon
                      className={`h-6 w-6 ${stat.color.replace(
                        "bg-",
                        "text-"
                      )}`}
                    />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-xs">
                  <span
                    className={`flex items-center font-medium ${
                      stat.isPositive === true
                        ? "text-emerald-600"
                        : stat.isPositive === false
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {stat.isPositive === true && (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.isPositive === false && (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-slate-400 ml-2">
                    {stat.isPositive === null
                      ? "สถานะปัจจุบัน"
                      : "เทียบกับเดือนก่อน"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Main Chart (Stock Movement) */}
          <Card className="lg:col-span-4 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Stock Movement
              </CardTitle>
              <CardDescription>
                เปรียบเทียบสินค้านำเข้า (Inbound) และส่งออก (Outbound)
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={stockMovementData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ color: "#1e293b" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIn)"
                    name="สินค้าเข้า"
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorOut)"
                    name="สินค้าออก"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Side Charts (Revenue & Approval Status) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sales Chart */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    ยอดขายรวม (Revenue)
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  ฿19,950{" "}
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full ml-2">
                    +15%
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={salesData}>
                    <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: "8px" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Approval Status (Pie Chart - Changed as requested) */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    สถานะรออนุมัติ (Approval)
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {/* Pie Chart */}
                  <div className="h-[100px] w-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={approvalStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {approvalStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 pl-4 space-y-2 text-xs text-slate-600">
                    {approvalStatusData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>ทำงานที่ใช้บ่อยได้อย่างรวดเร็ว</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => router.push("/purchasing/requisition/new")}
              >
                <Plus className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">New PR</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-300"
                onClick={() => router.push("/sales/orders/new")}
              >
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
                <span className="text-sm font-medium">New SO</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => router.push("/inventory/goods-received/new")}
              >
                <Truck className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium">Receive Goods</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-amber-50 hover:border-amber-300"
                onClick={() => router.push("/inventory/adjustments/new")}
              >
                <RotateCcw className="h-6 w-6 text-amber-600" />
                <span className="text-sm font-medium">Adjust Stock</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section: Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Transactions Widget */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>กิจกรรมล่าสุดในระบบ</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/transactions/movements")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (transaction.type === "receipt")
                        router.push("/inventory/goods-received");
                      else if (transaction.type === "shipment")
                        router.push("/sales/shipment");
                      else if (transaction.type === "adjustment")
                        router.push("/inventory/adjustments");
                      else if (transaction.type === "return")
                        router.push("/sales/returns");
                      else if (transaction.type === "requisition")
                        router.push("/purchasing/requisition");
                    }}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.type === "receipt"
                          ? "bg-blue-50"
                          : transaction.type === "shipment"
                          ? "bg-purple-50"
                          : transaction.type === "adjustment"
                          ? "bg-amber-50"
                          : transaction.type === "return"
                          ? "bg-red-50"
                          : "bg-slate-50"
                      }`}
                    >
                      {transaction.type === "receipt" ? (
                        <Package className="h-4 w-4 text-blue-600" />
                      ) : transaction.type === "shipment" ? (
                        <Truck className="h-4 w-4 text-purple-600" />
                      ) : transaction.type === "adjustment" ? (
                        <RotateCcw className="h-4 w-4 text-amber-600" />
                      ) : transaction.type === "return" ? (
                        <RotateCcw className="h-4 w-4 text-red-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {transaction.id}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            transaction.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : transaction.status === "shipped"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : transaction.status === "received"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {transaction.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          {transaction.date}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {transaction.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Table (Clickable) */}
          <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>
                  สินค้าที่จำนวนคงเหลือต่ำกว่าเกณฑ์ขั้นต่ำ
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/inventory/items")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">สินค้า</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3 text-center">คงเหลือ</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                        onClick={() => router.push("/inventory/items")}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-xs text-slate-500 font-normal">
                            {item.supplier}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{item.sku}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-600">
                          {item.quantity} / {item.minLevel}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.quantity === 0
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.quantity === 0 ? "Out of Stock" : "Low Stock"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-slate-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/purchasing/requisition/new");
                            }}
                          >
                            Re-order
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
