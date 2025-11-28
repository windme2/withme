"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, KeyRound } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; userId: string; username: string }>({
        open: false,
        userId: "",
        username: "",
    });
    const [newPassword, setNewPassword] = useState("");
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await usersApi.getAll();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error: any) {
            toast.error("Failed to fetch users");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (userId: string, username: string) => {
        if (!confirm(`Are you sure you want to deactivate user "${username}"?`)) {
            return;
        }

        try {
            await usersApi.deactivate(userId);
            toast.success("User deactivated successfully");
            fetchUsers();
        } catch (error: any) {
            toast.error("Failed to deactivate user");
            console.error(error);
        }
    };

    const openResetPasswordDialog = (userId: string, username: string) => {
        setResetPasswordDialog({ open: true, userId, username });
        setNewPassword("");
    };

    const closeResetPasswordDialog = () => {
        setResetPasswordDialog({ open: false, userId: "", username: "" });
        setNewPassword("");
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setResetting(true);
            await usersApi.resetPassword(resetPasswordDialog.userId, newPassword);
            toast.success("Password reset successfully");
            closeResetPasswordDialog();
        } catch (error: any) {
            toast.error("Failed to reset password");
            console.error(error);
        } finally {
            setResetting(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const variants: any = {
            admin: "destructive",
            manager: "default",
            staff: "secondary",
        };
        return <Badge variant={variants[role] || "secondary"}>{role}</Badge>;
    };

    return (
        <MainLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground">Manage system users and permissions</p>
                    </div>
                    <Button onClick={() => router.push("/admin/users/new")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by username, email, or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No users found
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>{user.department || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.is_active ? "default" : "secondary"}>
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/admin/users/${user.id}`)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openResetPasswordDialog(user.id, user.username)}
                                                    >
                                                        <KeyRound className="h-4 w-4" />
                                                    </Button>
                                                    {user.is_active && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeactivate(user.id, user.username)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Reset Password Dialog */}
            <Dialog open={resetPasswordDialog.open} onOpenChange={(open) => !open && closeResetPasswordDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Enter a new password for user "{resetPasswordDialog.username}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="Enter new password (min 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleResetPassword();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeResetPasswordDialog} disabled={resetting}>
                            Cancel
                        </Button>
                        <Button onClick={handleResetPassword} disabled={resetting}>
                            {resetting ? "Resetting..." : "Reset Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
