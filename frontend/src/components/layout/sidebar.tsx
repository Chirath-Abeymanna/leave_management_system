"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  User as UserIcon,
  Settings,
  Building2,
  Menu,
  LogOut,
  HelpCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "../ui/avatar";

const menuRoutes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["admin", "manager", "employee"],
  },
  {
    label: "Employees",
    icon: Users,
    href: "/employees",
    roles: ["admin", "manager"],
  },
  {
    label: "Leaves",
    icon: CalendarDays,
    href: "/leaves",
    roles: ["admin", "manager", "employee"],
  },
  {
    label: "Profile",
    icon: UserIcon,
    href: "/profile",
    roles: ["admin", "manager", "employee"],
  },
];

const generalRoutes = [
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ["admin", "manager", "employee"],
  },
];

function SidebarContent({
  onNavigate,
  isDrawer = false,
}: {
  onNavigate?: () => void;
  isDrawer?: boolean;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const userRole = user?.role?.toLowerCase() ?? "employee";

  const visibleMenuRoutes = menuRoutes.filter((r) =>
    r.roles.includes(userRole),
  );
  const visibleGeneralRoutes = generalRoutes.filter((r) =>
    r.roles.includes(userRole),
  );

  const handleLogout = () => {
    localStorage.clear();
    onNavigate?.();
    logout();
  };

  return (
    <div
      className={cn(
        "relative flex flex-col h-full",
        isDrawer
          ? "bg-white pt-8 px-4 justify-between"
          : "items-center justify-start pt-10 bg-slate-50",
      )}
    >
      <div
        className={cn(
          "flex flex-col",
          isDrawer
            ? "w-full"
            : "bg-white items-center justify-start py-10 px-4 rounded-2xl border border-slate-200",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-start gap-3",
            isDrawer ? "pb-8 px-2" : "px-6 pb-10",
          )}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-blue-700" />
          </div>
          <span className="font-bold text-[1.05rem] tracking-tight text-gray-900">
            Work Ethics
          </span>
        </div>

        {/* Menu section */}
        <div className="px-2 flex-1 overflow-y-auto w-full">
          <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 px-2 mb-2">
            Menu
          </p>
          <nav className="space-y-3">
            {visibleMenuRoutes.map((route) => {
              const isActive = pathname.startsWith(route.href);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-medium transition-all duration-150",
                    isActive
                      ? "bg-blue-700 text-white shadow-sm shadow-blue-200"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
                  )}
                >
                  <route.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600",
                    )}
                  />
                  <span className="flex-1">{route.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* General section */}
          <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 px-2 mb-2 mt-7">
            General
          </p>
          <nav className="space-y-3">
            {visibleGeneralRoutes.map((route) => {
              const isActive = pathname.startsWith(route.href);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-medium transition-all duration-150",
                    isActive
                      ? "bg-blue-700 text-white shadow-sm shadow-blue-200"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
                  )}
                >
                  <route.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600",
                    )}
                  />
                  <span>{route.label}</span>
                </Link>
              );
            })}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-medium transition-all duration-150 text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0 transition-colors text-gray-400 group-hover:text-red-500" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
        <Avatar className="absolute bottom-0 left-0 lg:hidden h-10 w-10 border border-slate-200">
          <AvatarFallback className="bg-blue-50 text-blue-700">
            {getInitials(user?.full_name || "User")}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen shadow-[1px_0_16px_0_rgba(0,0,0,0.04)] bg-white shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger + drawer */}
      <div className="md:hidden lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 right-4 z-50 bg-white border border-gray-200 shadow-sm rounded-xl h-10 w-10"
              />
            }
          >
            <Menu className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-60 border-r border-gray-100"
          >
            <SidebarContent onNavigate={() => setOpen(false)} isDrawer={true} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
