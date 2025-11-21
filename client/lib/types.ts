// Core Types for Withme Inventory System
import type React from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "manager";
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  reorderLevel: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  supplier?: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  type:
    | "Goods Received"
    | "Sales Shipment"
    | "Adjustment"
    | "Purchase Requisition"
    | "Transfer";
  item: string;
  itemId?: string;
  quantity: string;
  date: string;
  reference: string;
  user: string;
  userId?: string;
  status: "Completed" | "Pending" | "Cancelled";
  value: string;
  notes?: string;
}

export interface DashboardStats {
  totalItems: number;
  activeUsers: number;
  totalRevenue: number;
  totalOrders: number;
  change?: {
    items: string;
    users: string;
    revenue: string;
    orders: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface InventoryFormData {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  reorderLevel: number;
  supplier?: string;
}

// Filter types
export interface TransactionFilters {
  search?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  status?: string;
  supplier?: string;
}

// --- Status Badge Types ---
export type InventoryStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type PurchaseRequestStatus =
  | "Approved"
  | "Pending"
  | "Ordered"
  | "Rejected";
export type GoodsReceivedStatus = "Completed" | "Pending";
export type PurchaseOrderStatus =
  | "Draft"
  | "Sent"
  | "Partially Received"
  | "Completed"
  | "Cancelled";
export type SalesOrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";
export type ShipmentStatus =
  | "Preparing"
  | "In Transit"
  | "Delivered"
  | "Returned";
export type ReturnStatus = "Requested" | "Approved" | "Rejected" | "Completed";
export type UserStatus = "Active" | "Inactive";

export type StatusType =
  | InventoryStatus
  | PurchaseRequestStatus
  | GoodsReceivedStatus
  | PurchaseOrderStatus
  | SalesOrderStatus
  | ShipmentStatus
  | ReturnStatus
  | UserStatus;

export interface StatusBadgeProps {
  status: string;
}

export type StatusStyleMap = Record<string, string>;

// --- Component Props Types ---
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  bg?: string;
  iconColor?: string;
  bgIcon?: string;
}

// --- Purchasing Types ---
export interface PurchaseRequisitionItem {
  id: string | number;
  name: string;
  quantity: number;
  qty?: number;
  unit: string;
  sku?: string;
  price?: number;
  estimatedPrice?: number;
  purpose?: string;
}

export interface PurchaseRequisition {
  id: string | number;
  prNo?: string;
  requestDate: string;
  requiredDate?: string;
  date?: string;
  department?: string;
  requestedBy?: string;
  requester?: string;
  items?: PurchaseRequisitionItem[];
  itemsList?: PurchaseRequisitionItem[];
  details?: PurchaseRequisitionItem[];
  status: "pending" | "approved" | "rejected" | "converted" | "Pending" | "Approved" | "Rejected";
  priority?: "low" | "medium" | "high";
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  total?: number;
  [key: string]: unknown; // Allow additional dynamic fields
}
