"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Users, CheckCircle2, Briefcase, TrendingUp, Mail, Phone, MapPin, CreditCard, Calendar, Building2, Save, Edit } from "lucide-react";
import { toast } from "sonner";
import { customersApi } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState<{
    id: string | null;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    creditLimit: string;
    paymentTerms: string;
  } | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customersApi.getAll(searchTerm);
      setCustomers(data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const handleAddClick = () => {
    setFormData({
      id: null,
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      taxId: "",
      creditLimit: "",
      paymentTerms: "",
    });
    setIsNew(true);
    setIsEditing(true);
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formData || !formData.name || !formData.contactPerson) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        taxId: formData.taxId || null,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
        paymentTerms: formData.paymentTerms ? parseInt(formData.paymentTerms) : null,
      };

      if (isNew) {
        await customersApi.create(payload);
        toast.success("Customer created successfully!");
      } else {
        await customersApi.update(formData.id!, payload);
        toast.success("Customer updated successfully!");
      }
      
      setIsSheetOpen(false);
      setIsEditing(false);
      setFormData(null);
      fetchCustomers();
    } catch (error) {
      toast.error(isNew ? "Failed to create customer" : "Failed to update customer");
    }
  };

  const activeCustomers = customers.filter(c => c.isActive).length;

  const handleRowClick = async (customer: any) => {
    try {
      const details = await customersApi.getOne(customer.id);
      setFormData({
        id: details.id,
        name: details.name || "",
        contactPerson: details.contactPerson || "",
        phone: details.phone || "",
        email: details.email || "",
        address: details.address || "",
        taxId: details.taxId || "",
        creditLimit: details.creditLimit?.toString() || "",
        paymentTerms: details.paymentTerms?.toString() || "",
      });
      setIsNew(false);
      setIsEditing(false);
      setIsSheetOpen(true);
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
      toast.error("Failed to load customer details");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
            <p className="text-slate-500 mt-1">จัดการข้อมูลลูกค้า</p>
          </div>
          {userRole === "admin" && (
            <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Customers" value={customers.length} icon={Users} color="text-blue-600" bg="bg-blue-50" />
          <StatCard title="Active" value={activeCustomers} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard title="Inactive" value={customers.length - activeCustomers} icon={Briefcase} color="text-amber-600" bg="bg-amber-50" />
          <StatCard title="New This Month" value={0} icon={TrendingUp} color="text-purple-600" bg="bg-purple-50" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search customers..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Customer Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow 
                        key={customer.id} 
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(customer)}
                      >
                        <TableCell className="font-medium text-blue-600">{customer.customerCode}</TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.contactPerson || '-'}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{customer.phone || '-'}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${customer.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-50 text-slate-700'
                            }`}>
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Detail/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) {
          setIsEditing(false);
          setFormData(null);
        }
      }}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {formData && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  {isNew ? "Add New Customer" : "Customer Details"}
                </SheetTitle>
                <SheetDescription>
                  Review Details for {formData.name}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5">
                {/* Basic Information */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50" : ""}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Tax ID</Label>
                    <Input
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credit Limit</Label>
                    <Input
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Terms (days)</Label>
                    <Input
                      type="number"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-slate-50" : ""}
                    />
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6 border-t pt-4">
                {isEditing ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (isNew) {
                          setIsSheetOpen(false);
                          setFormData(null);
                        }
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isNew ? "Create" : "Save"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Customer
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
