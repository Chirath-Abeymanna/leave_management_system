import {
  LoginResponse,
  User,
  LeaveRequest,
  CreateLeaveRequest,
  UpdateLeaveRequest,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "An error occurred";
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch (e) {
      // Ignore JSON parse error for error responses
    }
    throw new ApiError(response.status, errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY, // Login uses API key
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMsg = "Login failed";
      try {
        const data = await response.json();
        errorMsg = data.error || errorMsg;
      } catch (e) {}
      throw new ApiError(response.status, errorMsg);
    }

    const data = await response.json();
    return data;
  },

  // Users
  getAllUsers: async (): Promise<User[]> => {
    return fetchWithAuth("/users");
  },

  getUser: async (id: string): Promise<User> => {
    return fetchWithAuth(`/users/${id}`);
  },

  // Leaves
  createLeave: async (data: CreateLeaveRequest): Promise<LeaveRequest> => {
    return fetchWithAuth("/leaves", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyLeaves: async (): Promise<LeaveRequest[]> => {
    return fetchWithAuth("/leaves/my");
  },

  getAllLeaves: async (): Promise<LeaveRequest[]> => {
    return fetchWithAuth("/leaves"); // Manager/Admin only
  },

  updateLeave: async (
    id: string,
    data: UpdateLeaveRequest,
  ): Promise<LeaveRequest> => {
    return fetchWithAuth(`/leaves/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  cancelLeave: async (id: string): Promise<LeaveRequest> => {
    return fetchWithAuth(`/leaves/${id}/cancel`, {
      method: "PUT",
    });
  },
};
