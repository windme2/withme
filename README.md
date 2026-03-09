# 📦 Inventory Management System

A full-stack inventory management system built with Next.js 15, NestJS, TypeScript, and PostgreSQL — designed for streamlined stock control, purchasing, sales orders, and real-time tracking.


## 🌟 Features

### 📊 Dashboard & Analytics

- Real-time inventory overview with key metrics
- Sales and purchase statistics
- Low stock alerts with automated re-order suggestions
- Recent activity tracking
- Visual data representation with interactive charts

### 📦 Inventory Management

- **Item Management**: Comprehensive product catalog with SKU tracking
- **Goods Receipt**: Record and validate incoming stock
- **Stock Adjustments**: Handle variance, damage, and stock corrections
- Real-time stock level monitoring
- Multi-category product organization

### 🛒 Purchasing Workflow

- **Purchase Requisitions (PR)**: Create and track purchase requests
- **PR Approval System**: Multi-level approval workflow with status tracking
- **Purchase Orders (PO)**: Convert approved PRs to formal purchase orders
- **Supplier Management**: Maintain supplier database with contact information
- Automated PR-to-PO conversion

### 💼 Sales Management

- **Sales Orders**: Create and manage customer orders
- **Order Tracking**: Monitor order status from draft to completion
- **Shipment Management**: Track outbound deliveries
- **Returns Processing**: Handle customer returns efficiently
- **Customer Database**: Comprehensive customer information management

### 📈 Transaction History

- Complete audit trail of all inventory movements
- Filter by transaction type (Goods Receipt, Adjustment, Sales, Returns)
- Reference linking to source documents
- Date and user tracking for all transactions
- **Export to Excel/PDF** - Download reports in multiple formats

### 🎯 Advanced Features

- **Sequential Document Numbering**: Auto-generated numbers (PR-2025-0001, PO-2025-0001, GRN-2026-0001)
- **Real-time Notifications**: In-app alerts for important events
- **Responsive Design**: Mobile-friendly with hamburger menu
- **Export Functionality**: Transaction history to Excel/PDF
- **Audit Trail**: Complete activity logging for all user actions
- **Role-Based Access Control**: Granular permissions per module

### 👥 User & Access Control

- **User Management**: Create and manage user accounts
- **Role-Based Access**: Admin, Purchasing, Inventory, Sales, User roles
- **Permission Control**: Granular access control per module
- **Activity Logging**: Track all user actions system-wide

## 🛠️ Technology Stack

### Frontend

- **Next.js 15.2.4** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library based on Radix UI
- **Radix UI Primitives** - Unstyled, accessible components
- **Lucide React** - Modern icon library
- **Recharts** - Charting library for data visualization
- **XLSX + jsPDF** - Export functionality (Excel & PDF)

### Backend

- **NestJS 10+** - Progressive Node.js framework
- **Prisma ORM 6+** - Next-generation ORM for TypeScript
- **PostgreSQL** - Relational database
- **Passport JWT** - Authentication strategy
- **bcrypt** - Password hashing
- **class-validator** - DTO validation

### DevOps & Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Turbopack** - Fast development server

### Database Schema

The system uses **29 tables** organized into 5 categories:

- **Core Tables** (5): users, organizations, branches, roles, permissions
- **Inventory Tables** (4): inventory_items, inventory_levels, categories, units_of_measure
- **Purchasing Tables** (6): purchase_requisitions, purchase_orders, suppliers, etc.
- **Sales Tables** (6): sales_orders, shipments, returns, customers, etc.
- **System Tables** (3): notifications, activity_logs, transaction_history

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** or higher
- **PostgreSQL 14+** installed and running
- **npm** or **yarn** package manager

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/windme2/final-project
cd final-project
```

**2. Setup Backend (Server)**

```bash
cd server
npm install
```

**3. Configure Environment Variables**

Create `.env` file in `/server` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/inventory_db"

# JWT Authentication
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"
```

**4. Setup Database**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database with sample data
npm run seed
```

**5. Start Backend Server**

```bash
npm run start:dev
# Server runs on http://localhost:3001
```

**6. Setup Frontend (Client)**

Open a new terminal:

```bash
cd client
npm install
```

Create `.env.local` file in `/client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**7. Start Frontend Server**

```bash
npm run dev
# Client runs on http://localhost:3000
```

**8. Access the Application**

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Prisma Studio**: Run `npm run studio` in `/server` folder

### Default Login Credentials

```
Email: admin@example.com
Password: password123
```

### Available Scripts

**Backend (server/)**

```bash
npm run start:dev    # Start development server with hot-reload
npm run start:prod   # Start production server
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run studio       # Open Prisma Studio (Database GUI)
npm run seed         # Seed database with sample data
```

**Frontend (client/)**

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 📄 Key Pages & Routes

| Route                       | Description                   |
| --------------------------- | ----------------------------- |
| `/dashboard`                | Main dashboard with analytics |
| `/inventory/items`          | Product catalog               |
| `/inventory/goods-received` | Goods receipt notes           |
| `/inventory/adjustments`    | Stock adjustments             |
| `/purchasing/requisition`   | Purchase requisitions         |
| `/purchasing/status`        | PR approval tracking          |
| `/purchasing/orders`        | Purchase orders               |
| `/purchasing/suppliers`     | Supplier management           |
| `/sales/orders`             | Sales orders                  |
| `/sales/shipment`           | Shipment tracking             |
| `/sales/returns`            | Returns management            |
| `/sales/customers`          | Customer database             |
| `/transactions/movements`   | Transaction history           |
| `/admin/user-management`    | User accounts                 |
| `/admin/activity-log`       | System activity log           |

## 🎨 UI Components

Built with **shadcn/ui** - a collection of re-usable components:

- **Forms**: Input, Select, Textarea, Label, Checkbox, Switch
- **Data Display**: Table, Card, Badge, Avatar
- **Feedback**: Alert Dialog, Toast (Sonner), Loading states
- **Navigation**: Dropdown Menu, Sheet, Popover
- **Layout**: Separator, Dialog

## 🔐 User Roles & Permissions

| Role      | Description        | Access Level                                  |
| --------- | ------------------ | --------------------------------------------- |
| **Admin** | Full system access | User management, system settings, all modules |
| **User**  | Standard user      | View-only access with limited editing         |

## 🔄 Workflow Examples

### Purchase Requisition to Purchase Order

1. User creates **Purchase Requisition (PR)** with auto-generated number (PR-2025-0001)
2. PR enters **approval workflow** (status tracking)
3. Manager **approves PR**
4. Approved PR converts to **Purchase Order (PO)** with sequential number (PO-2025-0001)
5. PO sent to supplier
6. Goods received via **Goods Receipt Note (GRN-2026-0001)**
7. Stock levels automatically updated in inventory_levels table

### Sales Order Processing

1. Create **Sales Order (SO-2025-0001)** for customer
2. Order status: Draft → Confirmed → Shipped → Completed
3. Create **Shipment (SH-2025-0001)** record with tracking
4. Update inventory on shipment confirmation
5. Handle **Returns (SR-2025-0001)** if needed with automatic stock adjustment

## 📊 Key Technologies & Patterns

- **Monorepo Structure**: Frontend (client) + Backend (server) in single repository
- **TypeScript First**: Full type safety across the stack
- **Prisma Transactions**: Atomic operations for data integrity
- **JWT Authentication**: Secure token-based auth with password hashing
- **RESTful API**: Consistent API design with proper HTTP methods
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Component Library**: Reusable shadcn/ui components

## 🐛 Troubleshooting

**Database connection error**

```bash
# Verify PostgreSQL is running
# Check DATABASE_URL in .env file
# Ensure database exists
```

**Port already in use**

```bash
# Frontend: Change port in package.json dev script
# Backend: Change PORT in .env file
```

**TypeScript errors**

```bash
# Regenerate Prisma Client
cd server
npx prisma generate

# Clear Next.js cache
cd client
rm -rf .next
npm run dev
```

## 📝 License

This project is developed for academic purposes at **Attawit Commercial Technology College**.

## 👥 Contributors

- **Intouch Charoenphon** - Full-Stack Development
- **Thinnakrit Chankate** - Full-Stack Development

