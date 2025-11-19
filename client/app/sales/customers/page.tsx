"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  User, // Icon for Customers
  Users, // Icon for Total Customers
  TrendingUp, // Icon for Total Spent
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Briefcase, // Icon for Total Orders
  X,
  Mail, // Icon for Contact
} from "lucide-react";

// --- Mock Data ---
const mockCustomers = [
  {
    id: "C-2025-001",
    name: "Global Retail Co.",
    contactPerson: "Jane Smith",
    phone: "081-123-4567",
    totalOrders: 15,
    totalSpent: 850000,
    status: "Active",
    details: { email: "jane@globalretail.com", address: "123 Main St, City" },
  },
  {
    id: "C-2025-002",
    name: "Local Tech Shop",
    contactPerson: "Mike Johnson",
    phone: "090-987-6543",
    totalOrders: 5,
    totalSpent: 120000,
    status: "Active",
    details: { email: "mike@techshop.co.th", address: "45 Sukhumvit, Bangkok" },
  },
  {
    id: "C-2025-003",
    name: "ABC Trading Ltd.",
    contactPerson: "Sarah Wilson",
    phone: "066-555-1234",
    totalOrders: 12,
    totalSpent: 680000,
    status: "Active",
    details: { email: "sarah@abctrade.net", address: "78 Silom Rd, City" },
  },
  {
    id: "C-2025-004",
    name: "Quick Serve Services",
    contactPerson: "David Lee",
    phone: "02-111-2222",
    totalOrders: 8,
    totalSpent: 450000,
    status: "Active",
    details: { email: "david@quickserve.th", address: "99 Rama 9, City" },
  },
  {
    id: "C-2025-005",
    name: "Furniture Mart Inc.",
    contactPerson: "Emily Wong",
    phone: "089-000-1111",
    totalOrders: 2,
    totalSpent: 35000,
    status: "Inactive",
    details: { email: "emily@furnituremart.net", address: "10 Asoke, Bangkok" },
  },
  {
    id: "C-2025-006",
    name: "Tech Solutions Ltd.",
    contactPerson: "Robert Chen",
    phone: "092-345-6789",
    totalOrders: 18,
    totalSpent: 920000,
    status: "Active",
    details: { email: "robert@techsolutions.co", address: "156 Phahonyothin, Bangkok" },
  },
  {
    id: "C-2025-007",
    name: "Office Supplies Hub",
    contactPerson: "Lisa Taylor",
    phone: "081-789-0123",
    totalOrders: 22,
    totalSpent: 1150000,
    status: "Active",
    details: { email: "lisa@officesupplies.com", address: "88 Rama 4 Rd, City" },
  },
  {
    id: "C-2025-008",
    name: "Metro Business Center",
    contactPerson: "Tom Anderson",
    phone: "066-234-5678",
    totalOrders: 6,
    totalSpent: 240000,
    status: "Active",
    details: { email: "tom@metrobiz.th", address: "45 Wireless Rd, Bangkok" },
  },
  {
    id: "C-2025-009",
    name: "Smart Store Co.",
    contactPerson: "Nancy Brown",
    phone: "090-456-7890",
    totalOrders: 0,
    totalSpent: 0,
    status: "New",
    details: { email: "nancy@smartstore.net", address: "200 Ratchada, City" },
  },
  {
    id: "C-2025-010",
    name: "Digital World Inc.",
    contactPerson: "Kevin White",
    phone: "089-567-8901",
    totalOrders: 14,
    totalSpent: 780000,
    status: "Active",
    details: { email: "kevin@digitalworld.co.th", address: "77 Sathorn Rd, Bangkok" },
  },
  {
    id: "C-2025-011",
    name: "Mega Mall Trading",
    contactPerson: "Amy Garcia",
    phone: "081-678-9012",
    totalOrders: 9,
    totalSpent: 520000,
    status: "Active",
    details: { email: "amy@megamall.com", address: "321 Pradipat, City" },
  },
  {
    id: "C-2025-012",
    name: "Express Delivery Services",
    contactPerson: "Chris Moore",
    phone: "092-789-0123",
    totalOrders: 3,
    totalSpent: 85000,
    status: "Active",
    details: { email: "chris@expressdelivery.th", address: "55 Lat Phrao, Bangkok" },
  },
  {
    id: "C-2025-013",
    name: "Prime Retailers",
    contactPerson: "Patricia Lewis",
    phone: "066-890-1234",
    totalOrders: 1,
    totalSpent: 15000,
    status: "Inactive",
    details: { email: "patricia@primeretail.net", address: "99 Petchburi Rd, City" },
  },
  {
    id: "C-2025-014",
    name: "Super Mart Chain",
    contactPerson: "Daniel Hall",
    phone: "090-901-2345",
    totalOrders: 25,
    totalSpent: 1420000,
    status: "Active",
    details: { email: "daniel@supermart.co.th", address: "188 Bangna, Bangkok" },
  },
  {
    id: "C-2025-015",
    name: "Quality Products Co.",
    contactPerson: "Jennifer King",
    phone: "089-012-3456",
    totalOrders: 11,
    totalSpent: 630000,
    status: "Active",
    details: { email: "jennifer@qualityproducts.com", address: "42 Charoenkrung, City" },
  },
  {
    id: "C-2025-016",
    name: "Business Solutions Ltd.",
    contactPerson: "Mark Allen",
    phone: "081-123-4567",
    totalOrders: 7,
    totalSpent: 390000,
    status: "Active",
    details: { email: "mark@bizsolutions.th", address: "111 Vibhavadi, Bangkok" },
  },
  {
    id: "C-2025-017",
    name: "Top Value Market",
    contactPerson: "Linda Young",
    phone: "092-234-5678",
    totalOrders: 16,
    totalSpent: 890000,
    status: "Active",
    details: { email: "linda@topvalue.co", address: "250 Asoke, City" },
  },
  {
    id: "C-2025-018",
    name: "Elite Trading Group",
    contactPerson: "Steven Scott",
    phone: "066-345-6789",
    totalOrders: 4,
    totalSpent: 180000,
    status: "Active",
    details: { email: "steven@elitetrading.net", address: "66 Silom, Bangkok" },
  },
  {
    id: "C-2025-019",
    name: "Fresh Market Co.",
    contactPerson: "Michelle Wright",
    phone: "090-456-7890",
    totalOrders: 0,
    totalSpent: 0,
    status: "New",
    details: { email: "michelle@freshmarket.th", address: "300 Rama 3, City" },
  },
  {
    id: "C-2025-020",
    name: "Urban Supply Chain",
    contactPerson: "Paul Martinez",
    phone: "089-567-8901",
    totalOrders: 13,
    totalSpent: 740000,
    status: "Active",
    details: { email: "paul@urbansupply.com", address: "155 Phaya Thai, Bangkok" },
  },
];

export default function CustomerPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Data Processing ---
  const totalValueSum = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

  // --- Filter Logic ---
  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const handleRowClick = (customer: any) => {
    setSelectedCustomer(customer);
    setIsSheetOpen(true);
  };

  // Helper for formatting large currency values
  const formatCurrencyK = (value: number) => {
    if (value >= 1000000) return `฿${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `฿${(value / 1000).toFixed(1)}K`;
    return `฿${value}`;
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header & Primary Action --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              รายชื่อลูกค้า (Customers)
            </h1>
            <p className="text-slate-500 mt-1">
              จัดการฐานข้อมูลลูกค้าและข้อมูลการติดต่อ
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/sales/customers/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มลูกค้าใหม่
          </Button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Customers"
            value={mockCustomers.length}
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Active Accounts"
            value={mockCustomers.filter((c) => c.status === "Active").length}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Total Orders"
            value={mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0)}
            icon={Briefcase}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard
            title="Total Spent"
            value={formatCurrencyK(totalValueSum)}
            icon={TrendingUp}
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        {/* --- Main Content: Table --- */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* --- Toolbar: Filter --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search Name, Contact, or Phone..."
                  className="pl-10 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterStatus}
                  onValueChange={(val) => {
                    setFilterStatus(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px] border-slate-200">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || filterStatus !== "all") && (
                  <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="h-4 w-4 text-slate-500" />
                  </Button>
                )}
              </div>
            </div>

            {/* --- Data Table --- */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[140px] font-semibold text-slate-700 pl-6 h-12">
                      Customer ID
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12">
                      Customer Name
                    </TableHead>
                    <TableHead className="w-[150px] font-semibold text-slate-700 h-12">
                      Contact Person
                    </TableHead>
                    <TableHead className="w-[140px] font-semibold text-slate-700 h-12">
                      Phone
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 h-12">
                      Total Orders
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 h-12">
                      Total Spent
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 pr-6 h-12">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(customer)}
                    >
                      {/* Customer ID */}
                      <TableCell className="pl-6 py-4">
                        <span className="font-medium text-blue-600 group-hover:underline underline-offset-4">
                          {customer.id}
                        </span>
                      </TableCell>

                      {/* Customer Name */}
                      <TableCell className="font-medium text-slate-900 py-4">
                        {customer.name}
                      </TableCell>

                      {/* Contact Person */}
                      <TableCell className="text-slate-600 py-4">
                        {customer.contactPerson}
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="text-slate-600 py-4">
                        {customer.phone}
                      </TableCell>

                      {/* Total Orders */}
                      <TableCell className="text-center text-slate-700 py-4">
                        {customer.totalOrders}
                      </TableCell>

                      {/* Total Spent */}
                      <TableCell className="text-right font-bold text-slate-700 py-4">
                        {formatCurrencyK(customer.totalSpent)}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center pr-6 py-4">
                        <StatusBadge status={customer.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 gap-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredCustomers.length
                  )}{" "}
                  of {filteredCustomers.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="text-sm font-medium text-slate-700 px-2">
                    Page {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="border-slate-200"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Detail Sheet (Customer) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedCustomer && (
            <CustomerDetailSheet customer={selectedCustomer} />
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// --- Detail Sheet Component ---
function CustomerDetailSheet({ customer }: { customer: any }) {
  return (
    <>
      <SheetHeader className="mb-6 border-b pb-4">
        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          {customer.name}
        </SheetTitle>
        <SheetDescription>
          Customer ID: {customer.id} | Status:{" "}
          <StatusBadge status={customer.status} />
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6">
        {/* Contact Info Block */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
          <InfoRow
            label="Contact Person"
            value={customer.contactPerson}
            icon={Mail}
          />
          <InfoRow label="Email" value={customer.details.email} icon={Mail} />
          <InfoRow label="Phone" value={customer.phone} icon={Phone} />
          <InfoRow label="Address" value={customer.details.address} />
        </div>

        {/* Financial Summary */}
        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-slate-900 mb-2">Sales Summary</h4>
          <InfoRow label="Total Orders" value={customer.totalOrders} />
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-100">
            <span>Total Value Spent</span>
            <span className="text-blue-600">
              ฿{customer.totalSpent.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <SheetFooter className="mt-8 border-t pt-4">
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          View All Orders
        </Button>
      </SheetFooter>
    </>
  );
}

// --- Sub-Components ---

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Inactive: "bg-slate-50 text-slate-700 border-slate-200",
  };
  const currentStyle =
    styles[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status === "Active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === "New" && <Clock className="w-3 h-3 mr-1" />}
      {status}
    </span>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-500 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />} {label}
      </span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
