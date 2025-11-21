// Application Constants

export const APP_NAME = "Withme Inventory System";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "A comprehensive inventory management system";

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const AUTH_TOKEN_KEY = "auth_token";
export const AUTH_STORAGE_KEY = "isAuthenticated";
export const TOKEN_EXPIRY_HOURS = 24;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Status Options
export const INVENTORY_STATUS = {
  IN_STOCK: "in-stock",
  LOW_STOCK: "low-stock",
  OUT_OF_STOCK: "out-of-stock",
} as const;

export const TRANSACTION_STATUS = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
} as const;

export const TRANSACTION_TYPES = {
  GOODS_RECEIVED: "Goods Received",
  SALES_SHIPMENTS: "Sales Shipments",
  ADJUSTMENT: "Adjustment",
  PURCHASE_REQUISITION: "Purchase Requisition",
  TRANSFER: "Transfer",
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
} as const;

// Date Formats
export const DATE_FORMAT = "DD/MM/YYYY";
export const DATETIME_FORMAT = "DD/MM/YYYY HH:mm";
export const TIME_FORMAT = "HH:mm";

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  SKU_REGEX: /^[A-Z0-9-]+$/,
  QUANTITY_MIN: 0,
  PRICE_MIN: 0,
} as const;

// UI Constants
export const SIDEBAR_WIDTH = {
  EXPANDED: "16rem", // 256px
  COLLAPSED: "4rem", // 64px
} as const;

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
  AUTH_FAILED: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  UNAUTHORIZED: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้",
  SESSION_EXPIRED: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
  VALIDATION_ERROR: "กรุณาตรวจสอบข้อมูลที่กรอก",
  UNKNOWN_ERROR: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "เข้าสู่ระบบสำเร็จ",
  LOGOUT_SUCCESS: "ออกจากระบบสำเร็จ",
  CREATE_SUCCESS: "สร้างข้อมูลสำเร็จ",
  UPDATE_SUCCESS: "อัปเดตข้อมูลสำเร็จ",
  DELETE_SUCCESS: "ลบข้อมูลสำเร็จ",
} as const;

// Category Options (Mock - should come from API)
export const CATEGORIES = [
  "Office Supplies",
  "Electronics",
  "Furniture",
  "Stationery",
  "Cleaning Supplies",
  "Packaging Materials",
  "Tools & Equipment",
  "Other",
] as const;

// Unit Options
export const UNITS = [
  "Piece",
  "Box",
  "Pack",
  "Carton",
  "Set",
  "Unit",
  "Kg",
  "Liter",
  "Meter",
] as const;
