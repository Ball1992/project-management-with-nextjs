import axios, { endpoints } from 'src/lib/axios';
import { apiCall, handleApiResponse, type ApiResponse } from 'src/utils/api-response-handler';

// ----------------------------------------------------------------------

export interface UserRole {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  updatedBy: string;
  updatedByName: string;
  updatedDate: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string;
  lastLoginDate: string;
  loginMethod: string;
  azureId: string;
  roleId: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  updatedBy: string;
  updatedByName: string;
  updatedDate: string;
  role: UserRole;
  note?: string; // Add note field
  // Legacy fields for backward compatibility
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  company?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
  phoneNumber?: string;
  avatarUrl?: string;
  note?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  company?: string;
}

export interface UpdateUserData {
  username?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
  phoneNumber?: string;
  avatarUrl?: string;
  note?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  company?: string;
}

export interface UserListResponse {
  responseStatus: number;
  responseMessage: string;
  data: {
    data: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserResponse {
  responseStatus: number;
  responseMessage: string;
  data: User;
}

// ----------------------------------------------------------------------

export class UserService {
  // Get all users with pagination and search
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<UserListResponse> {
    const response = await axios.get(endpoints.user.list, { params });
    return response.data;
  }

  // Get user by ID
  static async getUser(id: string): Promise<UserResponse> {
    const response = await axios.get(endpoints.user.detail(id));
    return response.data;
  }

  // Create new user
  static async createUser(data: CreateUserData): Promise<User> {
    return apiCall(
      axios.post(endpoints.user.create, data),
      { successMessage: 'สร้างผู้ใช้สำเร็จ' }
    );
  }

  // Update user (PATCH)
  static async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return apiCall(
      axios.patch(endpoints.user.update(id), data),
      { successMessage: 'อัปเดตผู้ใช้สำเร็จ' }
    );
  }

  // Update profile (PUT)
  static async updateProfile(data: UpdateUserData): Promise<User> {
    return apiCall(
      axios.put(endpoints.account.updateProfile, data),
      { successMessage: 'อัปเดตโปรไฟล์สำเร็จ' }
    );
  }

  // Delete user
  static async deleteUser(id: string): Promise<any> {
    return apiCall(
      axios.delete(endpoints.user.delete(id)),
      { successMessage: 'ลบผู้ใช้สำเร็จ' }
    );
  }

  // Export users to Excel
  static async exportUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(endpoints.user.export, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

// Export default instance
export default UserService;
