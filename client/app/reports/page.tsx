"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Database,
  Package,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { api } from "@/lib/api";

type ReportType = 'inventory' | 'sales' | 'purchasing' | 'transactions';

interface ReportCard {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const reportCards: ReportCard[] = [
  {
    id: 'inventory',
    title: 'รายงานสินค้าคงคลัง',
    description: 'ส่งออกข้อมูลสินค้าคงคลัง รายการทั้งหมด',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'sales',
    title: 'รายงานการขาย',
    description: 'ส่งออกข้อมูลการขาย ออเดอร์ และการจัดส่ง',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'purchasing',
    title: 'รายงานการซื้อ',
    description: 'ส่งออกข้อมูลการซื้อ ใบสั่งซื้อ และรับเข้าสินค้า',
    icon: ShoppingCart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'transactions',
    title: 'รายงานการเคลื่อนไหว',
    description: 'ส่งออกประวัติการเคลื่อนไหวของสินค้าทั้งหมด',
    icon: Database,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingType, setExportingType] = useState<ReportType | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchReportData = async (type: ReportType): Promise<any[]> => {
    try {
      let endpoint = '';
      switch (type) {
        case 'inventory':
          endpoint = '/inventory';
          break;
        case 'sales':
          endpoint = '/sales/orders';
          break;
        case 'purchasing':
          endpoint = '/purchasing/orders';
          break;
        case 'transactions':
          endpoint = '/transactions';
          break;
      }

      const response = await api.get(endpoint);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error) {
      console.error(`Failed to fetch ${type} data:`, error);
      throw error;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDataForExport = (data: any[], type: ReportType) => {
    if (!data || data.length === 0) return [];

    switch (type) {
      case 'inventory':
        return data.map(item => ({
          'SKU': item.sku || '-',
          'Product Name': item.name || '-',
          'Category': item.category || '-',
          'Stock': item.stock || item.quantity || 0,
          'Unit': item.unit || 'PCS',
          'Unit Price': item.unitPrice || item.price || 0,
          'Total Value': item.amount || (item.stock * item.unitPrice) || 0,
          'Min Stock': item.minStock || item.reorderLevel || 0,
          'Status': item.status || '-'
        }));

      case 'sales':
        return data.map(item => ({
          'Order No.': item.orderNumber || item.id || '-',
          'Date': item.date || item.createdAt || '-',
          'Customer': item.customerName || item.customer?.name || '-',
          'Items': item.itemName || item.items?.length || '-',
          'Quantity': item.quantity || item.totalQuantity || 0,
          'Total': item.total || item.totalAmount || 0,
          'Status': item.status || '-'
        }));

      case 'purchasing':
        return data.map(item => ({
          'PO No.': item.poNumber || item.id || '-',
          'Date': item.date || item.createdAt || '-',
          'Supplier': item.supplierName || item.supplier?.name || '-',
          'Items': item.itemName || item.items?.length || '-',
          'Quantity': item.quantity || item.totalQuantity || 0,
          'Total': item.total || item.totalAmount || 0,
          'Status': item.status || '-'
        }));

      case 'transactions':
        return data.map(item => ({
          'Date Time': item.date ? format(new Date(item.date), 'yyyy-MM-dd HH:mm') : '-',
          'Type': item.type || '-',
          'Reference': item.reference || '-',
          'Product': item.itemName || '-',
          'Quantity': item.quantity || 0,
          'User': item.user?.name || '-',
          'Status': item.status || '-'
        }));

      default:
        return data;
    }
  };

  const handleExportExcel = async (type: ReportType) => {
    setIsExporting(true);
    setExportingType(type);

    try {
      const data = await fetchReportData(type);
      
      if (data.length === 0) {
        toast.warning("ไม่มีข้อมูลสำหรับส่งออก");
        return;
      }

      const formattedData = formatDataForExport(data, type);
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      
      // Set column widths
      const maxWidth = 30;
      const wscols = Object.keys(formattedData[0] || {}).map(() => ({ wch: maxWidth }));
      ws['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      
      const fileName = `${type}-report-${format(new Date(), 'yyyyMMdd-HHmm')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success("ส่งออกไฟล์ Excel สำเร็จ");
    } catch (error) {
      console.error("Export Excel failed:", error);
      toast.error("ไม่สามารถส่งออกไฟล์ Excel ได้");
    } finally {
      setIsExporting(false);
      setExportingType(null);
    }
  };

  const handleExportPDF = async (type: ReportType) => {
    setIsExporting(true);
    setExportingType(type);

    try {
      const data = await fetchReportData(type);
      
      if (data.length === 0) {
        toast.warning("ไม่มีข้อมูลสำหรับส่งออก");
        return;
      }

      const formattedData = formatDataForExport(data, type);
      const doc = new jsPDF({ orientation: 'landscape' });
      
      // Title
      doc.setFontSize(16);
      const reportTitle = reportCards.find(r => r.id === type)?.title || 'Report';
      const englishTitle = {
        'รายงานสินค้าคงคลัง': 'Inventory Report',
        'รายงานการขาย': 'Sales Report',
        'รายงานการซื้อ': 'Purchasing Report',
        'รายงานการเคลื่อนไหว': 'Transaction Report'
      }[reportTitle] || reportTitle;
      
      doc.text(englishTitle, 14, 15);
      
      // Date
      doc.setFontSize(10);
      doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 22);
      
      // Table
      const headers = [Object.keys(formattedData[0] || {})];
      const rows = formattedData.map(item => Object.values(item));
      
      autoTable(doc, {
        startY: 28,
        head: headers,
        body: rows,
        styles: { 
          fontSize: 8,
          font: 'helvetica'
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 28, left: 10, right: 10 }
      });
      
      const fileName = `${type}-report-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`;
      doc.save(fileName);
      
      toast.success("ส่งออกไฟล์ PDF สำเร็จ");
    } catch (error) {
      console.error("Export PDF failed:", error);
      toast.error("ไม่สามารถส่งออกไฟล์ PDF ได้");
    } finally {
      setIsExporting(false);
      setExportingType(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            รายงานและส่งออกข้อมูล
          </h1>
          <p className="text-slate-500 mt-1">
            ส่งออกรายงานในรูปแบบ Excel และ PDF
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  ส่งออกข้อมูลรายงาน
                </h3>
                <p className="text-sm text-blue-700">
                  เลือกประเภทรายงานที่ต้องการส่งออก ข้อมูลจะถูกดึงแบบ Real-time จากระบบ
                  และสามารถเลือกรูปแบบ Excel (.xlsx) หรือ PDF ได้
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((report) => {
            const Icon = report.icon;
            const isCurrentlyExporting = isExporting && exportingType === report.id;

            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 ${report.bgColor} rounded-lg`}>
                        <Icon className={`h-6 w-6 ${report.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleExportExcel(report.id)}
                      disabled={isExporting}
                    >
                      {isCurrentlyExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      )}
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleExportPDF(report.id)}
                      disabled={isExporting}
                    >
                      {isCurrentlyExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 text-red-600" />
                      )}
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statistics Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-slate-600">ประเภทรายงาน</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm text-slate-600">รูปแบบไฟล์</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  <Download className="h-6 w-6 mx-auto" />
                </div>
                <div className="text-sm text-slate-600">ดาวน์โหลดทันที</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  <Database className="h-6 w-6 mx-auto" />
                </div>
                <div className="text-sm text-slate-600">ข้อมูล Real-time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
