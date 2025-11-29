"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Phone,
  Mail,
  Edit,
  Save,
  User,
  MapPin,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { suppliersApi } from "@/lib/api";

export default function SuppliersPage() {
  // Data State
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.is_active).length;
  const inactiveSuppliers = suppliers.filter((s) => !s.is_active).length;

  // Sheet & Edit State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState<{
    id: string | null;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    taxId: string;
    paymentTerms: string;
  } | null>(null);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await suppliersApi.getAll();
      setSuppliers(data);
    } catch (error) {
      toast.error("Failed to fetch suppliers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // --- Handlers ---

  // 1. Open Sheet for New Supplier
  const handleAddClick = () => {
    setFormData({
      id: null,
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      taxId: "",
      paymentTerms: "",
    });
    setIsNew(true);
    setIsEditing(true);
    setIsSheetOpen(true);
  };

  // 2. Open Sheet for Viewing (Row Click)
  const handleRowClick = (supplier: any) => {
    setFormData({
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      taxId: supplier.tax_id || "",
      paymentTerms: supplier.payment_terms ? String(supplier.payment_terms) : "",
    });
    setIsNew(false);
    setIsEditing(false);
    setIsSheetOpen(true);
  };

  // 3. Toggle Edit Mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // 4. Handle Input Changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // 5. Save Data
  const handleSave = async () => {
    if (!formData?.name) {
      toast.error("Please fill in required fields (Name).");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        taxId: formData.taxId,
        paymentTerms: formData.paymentTerms ? parseInt(formData.paymentTerms) : null,
      };

      if (isNew) {
        await suppliersApi.create(payload);
        toast.success("New supplier added successfully.");
      } else if (formData.id) {
        await suppliersApi.update(formData.id, payload);
        toast.success("Supplier details updated.");
      }
      fetchSuppliers();
      setIsSheetOpen(false);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save supplier");
      console.error(error);
    }
  };

  // 6. Cancel Edit
  const handleCancel = () => {
    if (isNew) {
      setIsSheetOpen(false);
    } else {
      const originalData = suppliers.find((s) => s.id === formData?.id);
      if (originalData) {
        setFormData({
          id: originalData.id,
          name: originalData.name,
          contactPerson: originalData.contact_person || "",
          phone: originalData.phone || "",
          email: originalData.email || "",
          address: originalData.address || "",
          taxId: originalData.tax_id || "",
          paymentTerms: originalData.payment_terms ? String(originalData.payment_terms) : "",
        });
      }
      setIsEditing(false);
    }
  };

  // 7. Delete Supplier
  const handleDelete = async () => {
    if (!formData?.id) return;
    if (!confirm("Are you sure you want to delete this supplier?")) return;

    try {
      await suppliersApi.delete(formData.id);
      toast.success("Supplier deleted successfully");
      fetchSuppliers();
      setIsSheetOpen(false);
    } catch (error) {
      toast.error("Failed to delete supplier. Ensure no related transactions exist.");
    }
  };

  // --- Filter Logic ---
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Suppliers
            </h1>
            <p className="text-slate-500 mt-1">
              จัดการรายชื่อและข้อมูลติดต่อ
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={handleAddClick}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Supplier
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Suppliers"
            value={totalSuppliers}
            icon={Building2}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            title="Active"
            value={activeSuppliers}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            title="Inactive"
            value={inactiveSuppliers}
            icon={XCircle}
            color="text-slate-600"
            bg="bg-slate-50"
          />
        </div>

        {/* Content */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* Toolbar */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search supplier or contact..."
                  className="pl-10 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="pl-6 h-12 font-semibold text-slate-700 w-[250px]">
                      Supplier Name
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-700">
                      Contact Person
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-700">
                      Phone
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-700">
                      Email
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-700 pr-6">
                      Address
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        Loading suppliers...
                      </TableCell>
                    </TableRow>
                  ) : filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No suppliers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((s) => (
                      <TableRow
                        key={s.id}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(s)}
                      >
                        <TableCell className="font-medium text-blue-600 pl-6 py-4">
                          {s.name}
                        </TableCell>
                        <TableCell className="text-slate-900 py-4">
                          {s.contact_person || "-"}
                        </TableCell>
                        <TableCell className="text-slate-600 py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-slate-400" /> {s.phone || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-slate-400" /> {s.email || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 py-4 truncate max-w-[200px] pr-6">
                          {s.address || "-"}
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

      {/* --- Supplier Detail Sheet --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {formData && (
            <>
              <SheetHeader className="mb-6 border-b pb-4">
                <SheetTitle className="text-xl flex items-center gap-2">
                  {isNew ? (
                    <>
                      <Plus className="h-5 w-5 text-blue-600" />
                      New Supplier
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 text-blue-600" />
                      Supplier Details
                    </>
                  )}
                </SheetTitle>
                <SheetDescription>
                  {isNew
                    ? "Add a new vendor to your list."
                    : "View or edit supplier information"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-slate-500 text-xs uppercase font-semibold">
                    Company Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="e.g. ABC Stationery Co."
                    />
                  ) : (
                    <div className="font-medium text-lg text-slate-900">
                      {formData.name}
                    </div>
                  )}
                </div>

                {/* Contact Person & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-500 text-xs uppercase font-semibold">
                      Contact Person
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.contactPerson}
                        onChange={(e) =>
                          handleInputChange("contactPerson", e.target.value)
                        }
                        placeholder="Name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-900">
                        <User className="h-4 w-4 text-slate-400" />{" "}
                        {formData.contactPerson || "-"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-500 text-xs uppercase font-semibold">
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="02-xxx-xxxx"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-900">
                        <Phone className="h-4 w-4 text-slate-400" />{" "}
                        {formData.phone || "-"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-slate-500 text-xs uppercase font-semibold">
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="email@company.com"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-900">
                      <Mail className="h-4 w-4 text-slate-400" />{" "}
                      {formData.email || "-"}
                    </div>
                  )}
                </div>

                {/* Tax ID & Payment Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-500 text-xs uppercase font-semibold">
                      Tax ID
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.taxId}
                        onChange={(e) =>
                          handleInputChange("taxId", e.target.value)
                        }
                        placeholder="Tax ID"
                      />
                    ) : (
                      <div className="text-slate-900">
                        {formData.taxId || "-"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-500 text-xs uppercase font-semibold">
                      Payment Terms (Days)
                    </Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.paymentTerms}
                        onChange={(e) =>
                          handleInputChange("paymentTerms", e.target.value)
                        }
                        placeholder="e.g. 30"
                      />
                    ) : (
                      <div className="text-slate-900">
                        {formData.paymentTerms ? `${formData.paymentTerms} Days` : "-"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="text-slate-500 text-xs uppercase font-semibold">
                    Address
                  </Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Full address..."
                      className="resize-none"
                      rows={3}
                    />
                  ) : (
                    <div className="flex items-start gap-2 text-slate-900">
                      <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                      <span className="leading-relaxed">
                        {formData.address || "-"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <SheetFooter className="mt-8 border-t pt-4">
                {isEditing ? (
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleSave}
                    >
                      <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={handleEditClick}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit Supplier
                    </Button>
                  </div>
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