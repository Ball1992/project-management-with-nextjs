export interface IAuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  targetId: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  updatedBy: string;
  updatedByName: string;
  updatedDate: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface IAuditLogTableFilters {
  search: string;
  userId: string;
  action: string;
  resource: string;
  startDate: string;
  endDate: string;
}

export interface CreateAuditLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: {
    before?: any;
    after?: any;
  };
  ipAddress: string;
  userAgent: string;
}

export interface AuditLogListResponse {
  responseStatus: number;
  responseMessage: string;
  data: {
    data: IAuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AuditLogResponse {
  responseStatus: number;
  responseMessage: string;
  data: IAuditLog;
}
