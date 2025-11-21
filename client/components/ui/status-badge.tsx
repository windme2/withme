import { Badge } from "@/components/ui/badge";
import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

// Default status styles mapping
const defaultStatusStyles: Record<string, string> = {
  // Inventory
  "In Stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
  "Out of Stock": "bg-red-50 text-red-700 border-red-200",
  
  // Purchase & Orders
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Draft: "bg-slate-50 text-slate-700 border-slate-200",
  Sent: "bg-blue-50 text-blue-700 border-blue-200",
  Ordered: "bg-purple-50 text-purple-700 border-purple-200",
  
  // Delivery & Shipment
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  "In Transit": "bg-blue-50 text-blue-700 border-blue-200",
  Preparing: "bg-amber-50 text-amber-700 border-amber-200",
  
  // Completion & Status
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  
  // User & Activity
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-50 text-slate-700 border-slate-200",
  
  // Returns
  Requested: "bg-amber-50 text-amber-700 border-amber-200",
  Returned: "bg-purple-50 text-purple-700 border-purple-200",
  
  // Receiving
  "Partially Received": "bg-amber-50 text-amber-700 border-amber-200",
};

export function StatusBadge({ status, className = "", showIcon = false, icon }: StatusBadgeProps) {
  const style = defaultStatusStyles[status] || "bg-slate-100 text-slate-700 border-slate-200";
  
  return (
    <Badge 
      variant="outline" 
      className={`${style} font-medium ${className}`}
    >
      {showIcon && icon && <span className="mr-1">{icon}</span>}
      {status}
    </Badge>
  );
}
