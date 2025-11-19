"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "low-stock" | "approval" | "system" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "low-stock",
    title: "สินค้าใกล้หมด",
    message: "Blue Ink Pen (SKU002) เหลือเพียง 12 ชิ้น",
    time: "5 นาทีที่แล้ว",
    read: false,
    link: "/inventory/items",
  },
  {
    id: "2",
    type: "approval",
    title: "รออนุมัติ",
    message: "PR-2025-015 รอการอนุมัติจากคุณ",
    time: "10 นาทีที่แล้ว",
    read: false,
    link: "/purchasing/status",
  },
  {
    id: "3",
    type: "success",
    title: "ตรวจรับสินค้าสำเร็จ",
    message: "GRN-2025-010 บันทึกเรียบร้อยแล้ว",
    time: "1 ชั่วโมงที่แล้ว",
    read: false,
    link: "/inventory/goods-received",
  },
  {
    id: "4",
    type: "low-stock",
    title: "สินค้าใกล้หมด",
    message: "HB Pencil #2 (SKU004) หมดสต็อค",
    time: "2 ชั่วโมงที่แล้ว",
    read: true,
    link: "/inventory/items",
  },
  {
    id: "5",
    type: "system",
    title: "สำรองข้อมูล",
    message: "ระบบทำ Backup อัตโนมัติเรียบร้อย",
    time: "3 ชั่วโมงที่แล้ว",
    read: true,
    link: "/dashboard",
  },
  {
    id: "6",
    type: "approval",
    title: "อนุมัติแล้ว",
    message: "PR-2025-014 ได้รับการอนุมัติแล้ว",
    time: "4 ชั่วโมงที่แล้ว",
    read: true,
    link: "/purchasing/status",
  },
];

export function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      handleMarkAsRead(notification.id);
      router.push(notification.link);
      setOpen(false);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "low-stock":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "approval":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "system":
        return <Settings className="h-4 w-4 text-slate-600" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-600" />;
    }
  };

  const getIconBg = (type: Notification["type"]) => {
    switch (type) {
      case "low-stock":
        return "bg-amber-50";
      case "approval":
        return "bg-blue-50";
      case "system":
        return "bg-slate-50";
      case "success":
        return "bg-emerald-50";
      default:
        return "bg-slate-50";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-blue-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              variant="default"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-900">การแจ้งเตือน</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">
                คุณมี {unreadCount} การแจ้งเตือนใหม่
              </p>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  อ่านทั้งหมด
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Bell className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">ไม่มีการแจ้งเตือน</p>
              <p className="text-xs mt-1">คุณดูการแจ้งเตือนทั้งหมดแล้ว</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-slate-50/50 transition-colors cursor-pointer relative group",
                    !notification.read && "bg-blue-50/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg h-fit",
                        getIconBg(notification.type)
                      )}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            "text-sm font-medium text-slate-900",
                            !notification.read && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3 bg-slate-50/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full h-8 text-sm text-slate-600 hover:text-slate-900"
              >
                <X className="h-4 w-4 mr-2" />
                ล้างการแจ้งเตือนทั้งหมด
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
