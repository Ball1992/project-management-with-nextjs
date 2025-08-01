import axios, { endpoints } from 'src/lib/axios';
import type {
  IAuditLog,
  CreateAuditLogData,
  AuditLogListResponse,
  AuditLogResponse,
} from 'src/types/audit-log';

// ----------------------------------------------------------------------

export class AuditLogService {
  // Get all audit logs with pagination and filters
  static async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLogListResponse> {
    const response = await axios.get(endpoints.auditLog.list, { params });
    return response.data;
  }

  // Get audit log by ID
  static async getAuditLog(id: string): Promise<AuditLogResponse> {
    const response = await axios.get(endpoints.auditLog.detail(id));
    return response.data;
  }

  // Create new audit log (internal use)
  static async createAuditLog(data: CreateAuditLogData): Promise<AuditLogResponse> {
    const response = await axios.post(endpoints.auditLog.create, data);
    return response.data;
  }

  // Delete audit log (admin only)
  static async deleteAuditLog(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(endpoints.auditLog.delete(id));
    return response.data;
  }

  // Get system activity logs
  static async getActivityLogs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      auditLogs: IAuditLog[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const response = await axios.get(endpoints.auditLog.activity, { params });
    const apiResponse = response.data;
    
    // Transform the API response to match frontend expectations
    return {
      success: apiResponse.responseStatus === 200,
      message: apiResponse.responseMessage,
      data: {
        auditLogs: apiResponse.data.data || [],
        pagination: apiResponse.data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: apiResponse.data.data?.length || 0,
          totalPages: Math.ceil((apiResponse.data.data?.length || 0) / (params?.limit || 10))
        }
      }
    };
  }

  // Export audit logs to Excel
  static async exportAuditLogs(params?: {
    search?: string;
    userId?: string;
    action?: string;
    module?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await axios.get(endpoints.auditLog.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }
}

// Export default instance
export default AuditLogService;
