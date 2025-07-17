export interface IPermission {
  id: string;
  name: string;
  slug: string;
  url: string;
  icon: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface IPermissionTableFilters {
  name: string;
  parentId: string;
  isActive: boolean;
}

export interface CreatePermissionData {
  name: string;
  slug: string;
  url: string;
  icon: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdatePermissionData {
  name?: string;
  slug?: string;
  url?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface PermissionListResponse {
  responseStatus: number;
  responseMessage: string;
  data: {
    data: IPermission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PermissionResponse {
  responseStatus: number;
  responseMessage: string;
  data: IPermission;
}

// Helper interface for hierarchical permission structure
export interface IPermissionTree extends IPermission {
  children?: IPermissionTree[];
}
