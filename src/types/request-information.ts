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
  penthouses?: {
    id: number;
    coverImage: string;
    status: string;
  };
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
