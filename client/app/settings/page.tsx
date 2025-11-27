"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Settings } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const settingsItems = [
    {
      title: "Profile Settings",
      description: "Manage your personal information and account details",
      icon: User,
      href: "/profile/edit",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "System Settings",
      description: "Configure general system preferences (Admin only)",
      icon: Settings,
      href: "/settings/system",
      color: "text-slate-600",
      bg: "bg-slate-50"
    },

  ];

  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account and system preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsItems.map((item) => (
            <Card
              key={item.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(item.href)}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-xl ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
