"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Shield, Database, Bell, Save, Clock, Lock, Key, Download } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "Withme Corporation",
    currency: "thb",
    language: "th",
    timezone: "asia-bangkok",
    lowStockThreshold: 15,
    criticalStockThreshold: 5,
    emailNotifications: true,
    lowStockAlerts: true,
    orderUpdates: true,
    systemAlerts: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    autoBackup: "daily",
    lastBackup: "2025-11-16 14:30",
  })

  const saveSettings = () => {
    localStorage.setItem("systemSettings", JSON.stringify(settings))
    alert("บันทึกการตั้งค่าสำเร็จ")
  }

  const handleChangePassword = () => {
    alert("เปิดฟอร์มเปลี่ยนรหัสผ่าน")
  }

  const handleBackupNow = () => {
    alert("กำลังสำรองข้อมูล...")
    setTimeout(() => {
      setSettings((prev) => ({
        ...prev,
        lastBackup: new Date().toLocaleString("th-TH"),
      }))
      alert("สำรองข้อมูลสำเร็จ")
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ตั้งค่าระบบ</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">จัดการการตั้งค่าระบบและความปลอดภัย</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="dark:text-gray-100">ตั้งค่าทั่วไป</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-300">ข้อมูลพื้นฐานและการตั้งค่าระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="dark:text-gray-200">ชื่อบริษัท</Label>
              <Input id="company" value={settings.companyName} onChange={(e) => setSettings((prev) => ({ ...prev, companyName: e.target.value }))} className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="dark:text-gray-200">สกุลเงิน</Label>
                <Select value={settings.currency} onValueChange={(value) => setSettings((prev) => ({ ...prev, currency: value }))}>
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="thb">บาท (THB)</SelectItem>
                    <SelectItem value="usd">ดอลลาร์ (USD)</SelectItem>
                    <SelectItem value="eur">ยูโร (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language" className="dark:text-gray-200">ภาษา</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings((prev) => ({ ...prev, language: value }))}>
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="th">ไทย</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="dark:text-gray-200">เขตเวลา</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings((prev) => ({ ...prev, timezone: value }))}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"><SelectValue /></SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="asia-bangkok">Asia/Bangkok</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="america-new_york">America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lowStock" className="dark:text-gray-200">สต็อกต่ำ (Low Stock)</Label>
                <Input id="lowStock" type="number" value={settings.lowStockThreshold} onChange={(e) => setSettings((prev) => ({ ...prev, lowStockThreshold: Number.parseInt(e.target.value) || 15 }))} className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criticalStock" className="dark:text-gray-200">สต็อกวิกฤต (Critical)</Label>
                <Input id="criticalStock" type="number" value={settings.criticalStockThreshold} onChange={(e) => setSettings((prev) => ({ ...prev, criticalStockThreshold: Number.parseInt(e.target.value) || 5 }))} className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <CardTitle className="dark:text-gray-100">การแจ้งเตือน</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-300">จัดการการแจ้งเตือนและการอัพเดต</CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="dark:text-gray-200">การแจ้งเตือนทาง Email</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">รับการแจ้งเตือนผ่าน Email</p>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="dark:text-gray-200">แจ้งเตือนสต็อกต่ำ</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">แจ้งเตือนเมื่อสต็อกต่ำกว่าเกณฑ์</p>
              </div>
              <Switch checked={settings.lowStockAlerts} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, lowStockAlerts: checked }))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="dark:text-gray-200">แจ้งเตือนคำสั่งซื้อ</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">แจ้งเตือนสถานะคำสั่งซื้อ</p>
              </div>
              <Switch checked={settings.orderUpdates} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, orderUpdates: checked }))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="dark:text-gray-200">แจ้งเตือนระบบ</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">แจ้งเตือนการอัปเดตระบบ</p>
              </div>
              <Switch checked={settings.systemAlerts} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, systemAlerts: checked }))} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle className="dark:text-gray-100">ความปลอดภัย</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-300">จัดการความปลอดภัยของระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="dark:text-gray-200">การยืนยันตัวตนแบบ 2 ชั้น (2FA)</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">เพิ่มความปลอดภัยด้วย 2FA</p>
              </div>
              <Switch checked={settings.twoFactorAuth} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, twoFactorAuth: checked }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="dark:text-gray-200 flex items-center gap-2"><Clock className="h-4 w-4" />Session Timeout (นาที)</Label>
              <Input id="sessionTimeout" type="number" value={settings.sessionTimeout} onChange={(e) => setSettings((prev) => ({ ...prev, sessionTimeout: Number.parseInt(e.target.value) || 30 }))} className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
              <p className="text-sm text-gray-500 dark:text-gray-400">ระยะเวลาที่ไม่ใช้งานก่อนออกจากระบบ</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordExpiry" className="dark:text-gray-200 flex items-center gap-2"><Lock className="h-4 w-4" />Password Expiry (วัน)</Label>
              <Input id="passwordExpiry" type="number" value={settings.passwordExpiry} onChange={(e) => setSettings((prev) => ({ ...prev, passwordExpiry: Number.parseInt(e.target.value) || 90 }))} className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
              <p className="text-sm text-gray-500 dark:text-gray-400">จำนวนวันก่อนต้องเปลี่ยนรหัสผ่าน</p>
            </div>
            <Button onClick={handleChangePassword} variant="outline" className="w-full"><Key className="mr-2 h-4 w-4" />เปลี่ยนรหัสผ่าน</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="dark:text-gray-100">สำรองข้อมูล</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-300">จัดการการสำรองข้อมูล</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="autoBackup" className="dark:text-gray-200">สำรองข้อมูลอัตโนมัติ</Label>
              <Select value={settings.autoBackup} onValueChange={(value) => setSettings((prev) => ({ ...prev, autoBackup: value }))}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"><SelectValue /></SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="disabled">ปิดใช้งาน</SelectItem>
                  <SelectItem value="daily">ทุกวัน</SelectItem>
                  <SelectItem value="weekly">ทุกสัปดาห์</SelectItem>
                  <SelectItem value="monthly">ทุกเดือน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-200">สำรองข้อมูลล่าสุด</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{settings.lastBackup}</span>
              </div>
            </div>
            <Button onClick={handleBackupNow} className="w-full bg-purple-600 hover:bg-purple-700"><Download className="mr-2 h-4 w-4" />สำรองข้อมูลเดี๋ยวนี้</Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">ข้อมูลจะถูกสำรองในรูปแบบ JSON</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          บันทึกการตั้งค่า
        </Button>
      </div>
      </div>
    </MainLayout>
  )
}
