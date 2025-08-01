export interface IContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message: string;
  status: 'new' | 'read' | 'unread';
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {
  status?: 'new' | 'read' | 'unread';
}

export interface ContactStatistics {
  total: number;
  new: number;
  read: number;
  unread: number;
}

// Status mapping for display
export const CONTACT_STATUS_MAPPING = {
  new: 'New',
  read: 'Read', 
  unread: 'Unread'
} as const;

export type IContactTableFilters = {
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};
