"use client";

import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopNavbar() {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Manager":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }
  };

  return (
    <div className="hidden lg:flex h-16  bg-slate-50  items-center justify-between px-6  my-5">
      <div className="bg-white w-full flex items-center justify-between p-5 rounded-2xl border border-slate-200 ">
        <div className="flex items-center text-2xl font-bold tracking-wide text-gray-900">
          Welcome Back{" "}
          <span className="ml-1 font-medium">{user.full_name}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarFallback className="bg-blue-50 text-blue-700">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium leading-none">
                {user.full_name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>
            <Badge variant="secondary" className={getRoleColor(user.role)}>
              {user.role}
            </Badge>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>
        </div>
      </div>
    </div>
  );
}
