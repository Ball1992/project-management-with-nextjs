export interface IContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
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
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
}

export interface ContactStatistics {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export type IContactTableFilters = {
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};
