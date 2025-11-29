"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// --- Types ---
type UserType = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
};

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Filter Logic ---
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const status = user.is_active ? "Active" : "Inactive";
    const matchesStatus =
      filterStatus === "all" || status === filterStatus;
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

  const handleRowClick = (user: UserType) => {
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
            value={users.length}
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Active Accounts"
            value={users.filter((u) => u.is_active).length}
            icon={UserCheck}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Admins"
            value={users.filter((u) => u.role === "admin").length}
            icon={Key}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard
            title="Inactive Accounts"
            value={users.filter((u) => !u.is_active).length}
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
                      Email
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <p className="text-slate-500">Loading users...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <p className="text-slate-500">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(user)}
                    >
                      {/* Name */}
                      <TableCell className="pl-6 py-4">
                        <span className="font-medium text-slate-900 group-hover:underline underline-offset-4">
                          {user.first_name} {user.last_name}
                        </span>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="text-slate-600 py-4">
                        {user.email}
                      </TableCell>

                      {/* Role */}
                      <TableCell className="text-slate-700 py-4">
                        <RoleBadge role={user.role} />
                      </TableCell>

                      {/* Last Login */}
                      <TableCell className="text-slate-500 text-sm py-4">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : "Never"}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center pr-6 py-4">
                        <StatusBadge status={user.is_active ? "Active" : "Inactive"} />
                      </TableCell>
                    </TableRow>
                    ))
                  )}
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
function UserDetailSheet({ user }: { user: UserType }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await usersApi.update(editedUser.id, {
        first_name: editedUser.first_name,
        last_name: editedUser.last_name,
        email: editedUser.email,
        role: editedUser.role,
      });
      toast.success('User updated successfully');
      setIsEditing(false);
      window.location.reload(); // Refresh to show updated data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleDeactivate = async () => {
    if (!confirm(`Are you sure you want to deactivate ${user.first_name} ${user.last_name}?`)) {
      return;
    }
    try {
      setLoading(true);
      await usersApi.update(user.id, { is_active: false });
      toast.success('User deactivated successfully');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SheetHeader className="mb-6 border-b pb-4">
        <SheetTitle className="text-2xl font-bold flex items-center gap-2 mb-2">
          <User className="h-6 w-6 text-blue-600" />
          User Management
        </SheetTitle>
        <div className="flex items-center justify-between">
          <SheetDescription>
           Review Details for {user.first_name} {user.last_name}
          </SheetDescription>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </SheetHeader>

      <div className="space-y-6">
        {isEditing ? (
          /* Edit Form */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editedUser.first_name}
                  onChange={(e) => setEditedUser({ ...editedUser, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editedUser.last_name}
                  onChange={(e) => setEditedUser({ ...editedUser, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editedUser.role}
                onValueChange={(value) => setEditedUser({ ...editedUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* Info Block */
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
            <InfoRow label="Username" value={user.username} icon={User} />
            <InfoRow label="Email" value={user.email} icon={User} />
            <InfoRow
              label="Access Role"
              value={<RoleBadge role={user.role} />}
              icon={Key}
            />
            <InfoRow
              label="Account Status"
              value={<StatusBadge status={user.is_active ? "Active" : "Inactive"} />}
              icon={user.is_active ? UserCheck : UserX}
            />
            <InfoRow 
              label="Last Login" 
              value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"} 
              icon={Clock} 
            />
          </div>
        )}
      </div>

      {!isEditing && (
        <SheetFooter className="mt-8 border-t pt-4">
          <Button
            onClick={handleDeactivate}
            disabled={!user.is_active || loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Processing...' : 'Deactivate User'}
          </Button>
        </SheetFooter>
      )}
    </>
  );
}

// --- Sub-Components ---

function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
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
    admin: "bg-amber-50 text-amber-700 border-amber-200",
    user: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const currentStyle =
    roleStyles[role.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStyle} capitalize`}
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
