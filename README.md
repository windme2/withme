# 📦 Withme Inventory Management System

A modern inventory management system built with Next.js 15, TypeScript, and Tailwind CSS — designed for streamlined stock control, purchasing, sales orders, and real-time tracking.

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

### 👥 User & Access Control

- **User Management**: Create and manage user accounts
- **Role-Based Access**: Admin, Purchasing, Inventory, Sales, User roles
- **Permission Control**: Granular access control per module
- **Activity Logging**: Track all user actions system-wide

## 🛠️ Technology Stack

### Core Framework

- **Next.js 15.2.4** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4.17** - Utility-first CSS framework

### UI Components & Libraries

- **shadcn/ui** - Re-usable component library based on Radix UI
- **Radix UI Primitives** - Unstyled, accessible components
- **Lucide React 0.553+** - Modern icon library
- **Recharts 3.4+** - Charting library for data visualization
- **Sonner** - Toast notification system

### Development Tools

- **ESLint** - Code linting
- **PostCSS & Autoprefixer** - CSS processing
- **Turbopack** - Fast development server

## 📁 Project Structure

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** or higher
- **npm**, **yarn**, **pnpm**, or **bun** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd withme
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
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

1. User creates **Purchase Requisition (PR)**
2. PR enters **approval workflow** (status tracking)
3. Manager **approves PR**
4. Approved PR converts to **Purchase Order (PO)**
5. PO sent to supplier
6. Goods received via **Goods Receipt Note (GRN)**
7. Stock levels automatically updated

### Sales Order Processing

1. Create **Sales Order** for customer
2. Order status: Draft → Confirmed → Shipped → Completed
3. Create **Shipment** record with tracking
4. Update inventory on shipment
5. Handle **Returns** if needed

## 📊 Mock Data

The application includes comprehensive mock data for development and demonstration:

- **Products**: 100+ items across multiple categories
- **Users**: 20 user accounts with various roles
- **Transactions**: 30+ movement records
- **Customers**: 20 customer profiles
- **Suppliers**: 20 supplier profiles
- **Orders**: Sales and purchase orders with various statuses

## 🌐 API Integration

This project is currently frontend-only with mock data. For backend integration:

1. Replace mock data imports with API calls
2. Implement authentication (NextAuth.js recommended)
3. Add data fetching with SWR or TanStack Query
4. Set up environment variables for API endpoints
5. Implement server actions for mutations

See `API_INTEGRATION_GUIDE.md` for detailed integration instructions.

## 🎯 Future Enhancements

- [ ] Real-time notifications with WebSocket
- [ ] Advanced reporting and analytics
- [ ] Export functionality (PDF, Excel)
- [ ] Barcode scanning integration
- [ ] Multi-warehouse support
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Document attachment support

## 🐛 Troubleshooting

### Common Issues

**Port already in use**

```bash
# Kill process on port 3000
npx kill-port 3000
```

**Module not found errors**

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**TypeScript errors**

```bash
# Run type check
npm run type-check
```

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- **Intouch Charoenphon** - Front-end Development
- **Thinnakrit Chankate** - Back-end Development
