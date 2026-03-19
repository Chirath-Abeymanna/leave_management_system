"use client";

import { useAuth } from "@/lib/auth-context";
import { BodyLayout } from "@/components/layout/Body";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Lock, Shield, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <BodyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your account preferences and security.
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6 justify-start p-1 bg-slate-100/50">
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md  p-5"
            >
              <Lock className="h-4 w-4 mr-2 text-slate-500" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="security"
            className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">
                  Change Password
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Update your password to keep your account secure.
                </p>
              </div>
              <div className="p-6 space-y-5 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-4">
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 p-5">
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </BodyLayout>
  );
}
