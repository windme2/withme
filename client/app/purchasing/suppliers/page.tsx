"use client";

import { useState } from "react";
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
  Package,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

// --- Mock Data ---
const initialSuppliers = [
  {
    id: 1,
    name: "ABC Stationery Co.",
    contact: "John Doe",
    products: "Pens, Notebooks",
    phone: "02-123-4567",
    email: "sales@abc.com",
    address: "Bangkok",
  },
  {
    id: 2,
    name: "Paper Plus Ltd.",
    contact: "Jane Smith",
    products: "A4 Paper, Envelopes",
    phone: "02-987-6543",
    email: "contact@paperplus.com",
    address: "Nonthaburi",
  },
  {
    id: 3,
    name: "Tech Solutions Hub",
    contact: "Mike Tech",
    products: "Laptops, Peripherals",
    phone: "02-555-0199",
    email: "support@techhub.co.th",
    address: "Pathum Thani",
  },
  {
    id: 4,
    name: "Office Comfort Furniture",
    contact: "Sarah Seat",
    products: "Chairs, Desks",
    phone: "02-444-3322",
    email: "sales@officecomfort.com",
    address: "Samut Prakan",
  },
  {
    id: 5,
    name: "Clean Master Supplies",
    contact: "Tom Cleaner",
    products: "Cleaning Kits, Tissue",
    phone: "02-888-7777",
    email: "info@cleanmaster.com",
    address: "Bangkok",
  },
  {
    id: 6,
    name: "Digital World Co.",
    contact: "Robert Chen",
    products: "USB Drives, Cables",
    phone: "02-333-4444",
    email: "sales@digitalworld.co.th",
    address: "Bangkok",
  },
  {
    id: 7,
    name: "Premium Office Supplies",
    contact: "Lisa Taylor",
    products: "Files, Binders, Labels",
    phone: "02-555-6666",
    email: "info@premiumoffice.com",
    address: "Nonthaburi",
  },
  {
    id: 8,
    name: "Smart Tech Industries",
    contact: "Tom Anderson",
    products: "Printers, Scanners",
    phone: "02-777-8888",
    email: "support@smarttech.th",
    address: "Samut Prakan",
  },
  {
    id: 9,
    name: "Global Paper Trading",
    contact: "Nancy Brown",
    products: "Printing Paper, Cardboard",
    phone: "02-222-3333",
    email: "orders@globalpaper.net",
    address: "Pathum Thani",
  },
  {
    id: 10,
    name: "Express Delivery Supplies",
    contact: "Kevin White",
    products: "Packaging Materials",
    phone: "02-999-0000",
    email: "contact@expressdelivery.co.th",
    address: "Bangkok",
  },
  {
    id: 11,
    name: "Modern Workspace Solutions",
    contact: "Amy Garcia",
    products: "Ergonomic Chairs, Desks",
    phone: "02-111-2222",
    email: "sales@modernworkspace.com",
    address: "Bangkok",
  },
  {
    id: 12,
    name: "Quality Print Co.",
    contact: "Chris Moore",
    products: "Ink Cartridges, Toner",
    phone: "02-444-5555",
    email: "info@qualityprint.th",
    address: "Nonthaburi",
  },
  {
    id: 13,
    name: "Professional Office Equipment",
    contact: "Patricia Lewis",
    products: "Shredders, Laminators",
    phone: "02-666-7777",
    email: "sales@proequipment.net",
    address: "Samut Prakan",
  },
  {
    id: 14,
    name: "Elite Stationery Mart",
    contact: "Daniel Hall",
    products: "Writing Tools, Erasers",
    phone: "02-888-9999",
    email: "orders@elitestationary.com",
    address: "Bangkok",
  },
  {
    id: 15,
    name: "Tech World Distributors",
    contact: "Jennifer King",
    products: "Monitors, Keyboards",
    phone: "02-000-1111",
    email: "support@techworld.co.th",
    address: "Pathum Thani",
  },
  {
    id: 16,
    name: "Supreme Office Supply",
    contact: "Mark Allen",
    products: "Staplers, Punches",
    phone: "02-333-2222",
    email: "info@supremeoffice.th",
    address: "Nonthaburi",
  },
  {
    id: 17,
    name: "Advanced Tech Solutions",
    contact: "Linda Young",
    products: "Network Equipment",
    phone: "02-555-4444",
    email: "sales@advancedtech.net",
    address: "Bangkok",
  },
  {
    id: 18,
    name: "Fresh Print Materials",
    contact: "Steven Scott",
    products: "Photo Paper, Canvas",
    phone: "02-777-6666",
    email: "orders@freshprint.com",
    address: "Samut Prakan",
  },
  {
    id: 19,
    name: "Mega Storage Solutions",
    contact: "Michelle Wright",
    products: "Filing Cabinets, Shelves",
    phone: "02-999-8888",
    email: "contact@megastorage.co.th",
    address: "Pathum Thani",
  },
  {
    id: 20,
    name: "Prime Electronics Co.",
    contact: "Paul Martinez",
    products: "Batteries, Power Banks",
    phone: "02-111-0000",
    email: "sales@primeelectronics.th",
    address: "Bangkok",
  },
];

export default function SuppliersPage() {
  // Data State
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState("");

  // Sheet & Edit State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // --- Handlers ---

  // 1. Open Sheet for New Supplier
  const handleAddClick = () => {
    setFormData({
      id: null,
      name: "",
      contact: "",
      products: "",
      phone: "",
      email: "",
      address: "",
    });
    setIsNew(true);
    setIsEditing(true);
    setIsSheetOpen(true);
  };

  // 2. Open Sheet for Viewing (Row Click)
  const handleRowClick = (supplier: any) => {
    setFormData({ ...supplier });
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
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 5. Save Data
  const handleSave = () => {
    if (!formData.name || !formData.contact) {
      toast.error("Please fill in required fields (Name, Contact).");
      return;
    }

    if (isNew) {
      const newId =
        suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1;
      const newSupplier = { ...formData, id: newId };
      setSuppliers([newSupplier, ...suppliers]);
      toast.success("New supplier added successfully.");
    } else {
      setSuppliers(suppliers.map((s) => (s.id === formData.id ? formData : s)));
      toast.success("Supplier details updated.");
    }

    setIsSheetOpen(false);
    setIsEditing(false);
  };

  // 6. Cancel Edit
  const handleCancel = () => {
    if (isNew) {
      setIsSheetOpen(false);
    } else {
      const originalData = suppliers.find((s) => s.id === formData.id);
      setFormData(originalData);
      setIsEditing(false);
    }
  };

  // --- Filter Logic ---
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.products.toLowerCase().includes(searchTerm.toLowerCase())
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

        {/* Content */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* Toolbar */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search supplier or products..."
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
                    <TableHead className="pl-6 h-12 font-semibold text-slate-700 w-[200px]">
                      Supplier Name
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-700">
                      Contact Person
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-700">
                      Products
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-700">
                      Phone
                    </TableHead>
                    <TableHead className="h-12 font-semibold text-slate-700">
                      Email
                    </TableHead>
                    {/* Adjusted Address Header: Added pr-6 */}
                    <TableHead className="h-12 font-semibold text-slate-700 pr-6">
                      Address
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((s) => (
                    <TableRow
                      key={s.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(s)}
                    >
                      <TableCell className="font-medium text-blue-600 pl-6 py-4">
                        {s.name}
                      </TableCell>
                      <TableCell className="text-slate-900 py-4">
                        {s.contact}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          {s.products}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-slate-400" /> {s.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-slate-400" /> {s.email}
                        </div>
                      </TableCell>
                      {/* Adjusted Address Cell: Added pr-6 */}
                      <TableCell className="text-slate-600 py-4 truncate max-w-[200px] pr-6">
                        {s.address}
                      </TableCell>
                    </TableRow>
                  ))}
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
                    : "View or edit supplier information."}
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
                        value={formData.contact}
                        onChange={(e) =>
                          handleInputChange("contact", e.target.value)
                        }
                        placeholder="Name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-900">
                        <User className="h-4 w-4 text-slate-400" />{" "}
                        {formData.contact}
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
                        {formData.phone}
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
                      {formData.email}
                    </div>
                  )}
                </div>

                {/* Products */}
                <div className="space-y-2">
                  <Label className="text-slate-500 text-xs uppercase font-semibold">
                    Products / Services
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.products}
                      onChange={(e) =>
                        handleInputChange("products", e.target.value)
                      }
                      placeholder="e.g. Pens, Paper, Laptops"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-900">
                      <Package className="h-4 w-4 text-slate-400" />{" "}
                      {formData.products}
                    </div>
                  )}
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
                        {formData.address}
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
                  <Button
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit Supplier
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