import axios, { endpoints } from 'src/lib/axios';
import { apiCall, type ApiResponse } from 'src/utils/api-response-handler';

// ----------------------------------------------------------------------

export interface AccountProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  company?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAccountProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  company?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AccountProfileResponse {
  success: boolean;
  data: AccountProfile;
  message: string;
}

export interface UploadAvatarResponse {
  success: boolean;
  data: {
    avatarUrl: string;
  };
  message: string;
}

// ----------------------------------------------------------------------

export class AccountService {
  // Get account profile
  static async getProfile(): Promise<AccountProfileResponse> {
    const response = await axios.get(endpoints.account.profile);
    return response.data;
  }

  // Update account profile (PUT)
  static async updateProfile(data: UpdateAccountProfileData): Promise<AccountProfile> {
    return apiCall(
      axios.put(endpoints.account.updateProfile, data),
      { successMessage: 'อัปเดตโปรไฟล์สำเร็จ' }
    );
  }

  // Change password
  static async changePassword(data: ChangePasswordData): Promise<any> {
    return apiCall(
      axios.post(endpoints.account.changePassword, data),
      { successMessage: 'เปลี่ยนรหัสผ่านสำเร็จ' }
    );
  }

  // Upload avatar
  static async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiCall(
      axios.post(endpoints.account.uploadAvatar, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      { successMessage: 'อัปโหลดรูปโปรไฟล์สำเร็จ' }
    );
  }

  // Delete avatar
  static async deleteAvatar(): Promise<any> {
    return apiCall(
      axios.delete(endpoints.account.deleteAvatar),
      { successMessage: 'ลบรูปโปรไฟล์สำเร็จ' }
    );
  }
}

// Export default instance
export default AccountService;
