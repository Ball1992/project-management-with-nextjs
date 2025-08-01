import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export interface DashboardOverview {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalAuditLogs: number;
  recentActivity: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
  }[];
  usersByRole: {
    role: string;
    count: number;
  }[];
}

export interface DashboardAnalytics {
  userGrowth: {
    date: string;
    count: number;
  }[];
  activityByDay: {
    date: string;
    count: number;
  }[];
  topActions: {
    action: string;
    count: number;
  }[];
}

export interface DashboardOverviewResponse {
  success: boolean;
  data: DashboardOverview;
  message: string;
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  data: DashboardAnalytics;
  message: string;
}

// ----------------------------------------------------------------------

export class DashboardService {
  // Get dashboard overview data
  static async getOverview(): Promise<DashboardOverviewResponse> {
    const response = await axios.get(endpoints.dashboard.overview);
    return response.data;
  }

  // Get dashboard analytics data
  static async getAnalytics(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardAnalyticsResponse> {
    const response = await axios.get(endpoints.dashboard.analytics, { params });
    return response.data;
  }
}

// Export default instance
export default DashboardService;
