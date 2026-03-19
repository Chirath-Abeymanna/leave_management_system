export type UserRole = "Admin" | "Manager" | "Employee";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  manager_id?: string;
  annual_leave_balance: number;
  sick_leave_balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  role?: UserRole;
}

export interface AssignLeaveBalanceRequest {
  annual_leave_balance: number;
  sick_leave_balance: number;
}

export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  manager_note?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateLeaveRequest {
  leave_type: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_days: number;
  reason: string;
}

export interface UpdateLeaveRequest {
  status?: LeaveStatus;
  manager_note?: string;
}
