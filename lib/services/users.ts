import api from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface UserUpdate {
  name?: string;
  password?: string;
}

export const usersService = {
  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  // Update current user profile
  async updateProfile(data: UserUpdate): Promise<User> {
    const response = await api.put<User>("/users/me", data);
    return response.data;
  },

  // Admin: Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/users/admin/all");
    return response.data;
  },

  // Admin: Delete user
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/admin/${userId}`);
  },
};

