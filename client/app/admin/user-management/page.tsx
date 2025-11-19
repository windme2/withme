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
  User,
  Users,
  UserCheck,
  UserX,
  Key,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  X,
  Edit,
  Clock,
} from "lucide-react";

// --- Mock Data ---
// Note: 'email' field is used as 'username' in the application logic
const mockUsers = [
  {
    id: 1,
    name: "Intouch C. ",
    username: "wind",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-11-18 10:00",
  },
  {
    id: 2,
    name: "Thinnakrit C.",
    username: "Jame",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-11-17 14:30",
  },
  {
    id: 3,
    name: "User Test",
    username: "user3",
    role: "User",
    status: "Active",
    lastLogin: "2025-11-18 09:00",
  },
];

export default function UserManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Filter Logic ---
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const roles = ["all", "Admin", "User"];
  const statuses = ["all", "Active", "Inactive"];

  const clearFilters = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const handleRowClick = (user: any) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* --- Header & Primary Action --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              User Management
            </h1>
            <p className="text-slate-500 mt-1">
              เพิ่ม กำหนดสิทธิ์ และจัดการสถานะบัญชีผู้ใช้
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => router.push("/admin/user-management/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New User
          </Button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={mockUsers.length}
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Active Accounts"
            value={mockUsers.filter((u) => u.status === "Active").length}
            icon={UserCheck}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Admins"
            value={mockUsers.filter((u) => u.role === "Admin").length}
            icon={Key}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard
            title="Inactive Accounts"
            value={mockUsers.filter((u) => u.status === "Inactive").length}
            icon={UserX}
            color="text-red-600"
            bg="bg-red-50"
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
                  placeholder="Search by Name or Username..."
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
                  value={filterRole}
                  onValueChange={(val) => {
                    setFilterRole(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px] border-slate-200">
                    <SelectValue placeholder="Filter Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role === "all" ? "All Roles" : role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterStatus}
                  onValueChange={(val) => {
                    setFilterStatus(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px] border-slate-200">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "all" ? "All Status" : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(searchTerm ||
                  filterRole !== "all" ||
                  filterStatus !== "all") && (
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
                    <TableHead className="w-[180px] font-semibold text-slate-700 pl-6 h-12">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 h-12">
                      Username
                    </TableHead>
                    <TableHead className="w-[140px] font-semibold text-slate-700 h-12">
                      Role
                    </TableHead>
                    <TableHead className="w-[140px] font-semibold text-slate-700 h-12">
                      Last Login
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 pr-6 h-12">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(user)}
                    >
                      {/* Name */}
                      <TableCell className="pl-6 py-4">
                        <span className="font-medium text-slate-900 group-hover:underline underline-offset-4">
                          {user.name}
                        </span>
                      </TableCell>

                      {/* Username (using email field) */}
                      <TableCell className="text-slate-600 py-4">
                        {user.username}
                      </TableCell>

                      {/* Role */}
                      <TableCell className="text-slate-700 py-4">
                        <RoleBadge role={user.role} />
                      </TableCell>

                      {/* Last Login */}
                      <TableCell className="text-slate-500 text-sm py-4">
                        {user.lastLogin.split(" ")[0]}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center pr-6 py-4">
                        <StatusBadge status={user.status} />
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
                  {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
                  {filteredUsers.length} entries
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

      {/* --- Detail/Edit Sheet (User) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedUser && <UserDetailSheet user={selectedUser} />}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

// --- Detail/Edit Sheet Component (Simplified) ---
function UserDetailSheet({ user }: { user: any }) {
  // Mock function to simulate editing
  const handleEdit = () => {
    alert(`Simulating edit fields for user: ${user.name}`);
    // In a real app, this would enable input fields or open an edit modal
  };

  return (
    <>
      <SheetHeader className="mb-6 border-b pb-4">
        <SheetTitle className="text-2xl font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            {user.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            title="Edit User"
          >
            <Edit className="h-5 w-5 text-slate-500 hover:text-blue-600" />
          </Button>
        </SheetTitle>
        <SheetDescription>
          {/* Username in Description */}
          Username: {user.email}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6">
        {/* Info Block */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
          {/* Added Username Row */}
          <InfoRow label="Username" value={user.email} icon={User} />
          <InfoRow
            label="Access Role"
            value={<RoleBadge role={user.role} />}
            icon={Key}
          />
          <InfoRow
            label="Account Status"
            value={<StatusBadge status={user.status} />}
            icon={user.status === "Active" ? UserCheck : UserX}
          />
          <InfoRow label="Last Login" value={user.lastLogin} icon={Clock} />
        </div>
      </div>

      <SheetFooter className="mt-8 border-t pt-4">
        <Button
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={user.status === "Inactive"}
        >
          Deactivate User
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
    Inactive: "bg-red-50 text-red-700 border-red-200",
  };
  const currentStyle =
    styles[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status === "Active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === "Inactive" && <XCircle className="w-3 h-3 mr-1" />}
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const roleStyles: Record<string, string> = {
    Admin: "bg-amber-50 text-amber-700 border-amber-200",
    User: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const currentStyle =
    roleStyles[role] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStyle}`}
    >
      {role}
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
