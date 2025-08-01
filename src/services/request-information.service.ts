import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export interface IRequestInformation {
  id: number;
  penthousesId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message?: string;
  tourType?: 'on_site' | 'virtual';
  firstAvailability?: string;
  hourPreference?: string;
  newsletterSignup: boolean;
  status: 'new' | 'read' | 'unread' | 'in_progress' | 'resolved' | 'closed';
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  penthouses?: any;
}

export interface CreateRequestInformationDto {
  penthousesId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message?: string;
  tourType?: 'on_site' | 'virtual';
  firstAvailability?: string;
  hourPreference?: string;
  newsletterSignup?: boolean;
}

export interface UpdateRequestInformationDto {
  penthousesId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  message?: string;
  tourType?: 'on_site' | 'virtual';
  firstAvailability?: string;
  hourPreference?: string;
  newsletterSignup?: boolean;
  status?: 'new' | 'read' | 'unread' | 'in_progress' | 'resolved' | 'closed';
}

export interface RequestInformationStatistics {
  total: number;
  new: number;
  read: number;
  unread: number;
}

export const requestInformationService = {
  // Get all request information
  getRequestInformation: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    penthousesId?: string;
  }): Promise<{ data: IRequestInformation[]; total: number; page: number; limit: number }> => {
    const response = await axiosInstance.get(endpoints.requestInformation.list, { params });
    return response.data?.data || response.data;
  },

  // Get request information by ID
  getRequestInformationById: async (id: string): Promise<IRequestInformation> => {
    const response = await axiosInstance.get(endpoints.requestInformation.detail(id));
    return response.data?.data || response.data;
  },

  // Get request information by penthouses ID
  getRequestInformationByPenthouses: async (penthousesId: string): Promise<IRequestInformation[]> => {
    const response = await axiosInstance.get(endpoints.requestInformation.byPenthouses(penthousesId));
    return response.data?.data || response.data;
  },

  // Create request information
  createRequestInformation: async (data: CreateRequestInformationDto): Promise<IRequestInformation> => {
    const response = await axiosInstance.post(endpoints.requestInformation.create, data);
    return response.data?.data || response.data;
  },

  // Update request information
  updateRequestInformation: async (id: string, data: UpdateRequestInformationDto): Promise<IRequestInformation> => {
    const response = await axiosInstance.patch(endpoints.requestInformation.update(id), data);
    return response.data?.data || response.data;
  },

  // Delete request information
  deleteRequestInformation: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.requestInformation.delete(id));
  },

  // Get request information statistics
  getStatistics: async (): Promise<RequestInformationStatistics> => {
    const response = await axiosInstance.get('penthouses-request-information/statistics');
    return response.data?.data || response.data;
  },
};
