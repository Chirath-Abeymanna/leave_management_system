"use client";

import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "./sidebar";
import { TopNavbar } from "./top-navbar";
import { Loader2 } from "lucide-react";

export function BodyLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The AuthProvider will redirect
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
