"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { LeaveRequest, User } from "@/lib/types";

import { BodyLayout } from "@/components/layout/Body";
import { EmployeeLeavesTable } from "@/components/leaves/employee-leaves-table";
import { TeamRequestsTable } from "@/components/leaves/team-requests-table";
import { RequestLeaveDialog } from "@/components/leaves/request-leave-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function LeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Everyone fetches their own leaves
      const myLeaves = await api.getMyLeaves();
      setLeaves(Array.isArray(myLeaves) ? myLeaves : []);

      // Managers and Admins fetch team leaves and users
      if (user.role !== "Employee") {
        const [allLeavesData, allUsersData] = await Promise.all([
          api.getAllLeaves(),
          api.getAllUsers(),
        ]);
        setTeamLeaves(Array.isArray(allLeavesData) ? allLeavesData : []);
        setUsers(allUsersData);
      }
    } catch (error) {
      console.error("Failed to fetch leaves data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user) return null;

  return (
    <BodyLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Leaves Management
            </h1>
            <p className="text-slate-500 mt-1">
              Request time off and view your balances.
            </p>
          </div>
          <RequestLeaveDialog onSuccess={fetchData} />
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : user.role === "Employee" ? (
          // Employee View: Just the table
          <EmployeeLeavesTable leaves={leaves} onCancelSuccess={fetchData} />
        ) : (
          // Manager/Admin View: Tabs
          <Tabs defaultValue="team" className="w-full ">
            <TabsList className="mb-4 p-5">
              <TabsTrigger className={`p-4`} value="team">
                Team Requests
              </TabsTrigger>
              <TabsTrigger className={`p-4`} value="personal">
                My Leaves
              </TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="mt-0">
              <TeamRequestsTable
                leaves={teamLeaves}
                users={users}
                onActionSuccess={fetchData}
              />
            </TabsContent>

            <TabsContent value="personal" className="mt-0">
              <EmployeeLeavesTable
                leaves={leaves}
                onCancelSuccess={fetchData}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </BodyLayout>
  );
}
