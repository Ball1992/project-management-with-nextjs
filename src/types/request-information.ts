export interface IRequestInformation {
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

export interface CreateRequestInformationDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message: string;
}

export interface UpdateRequestInformationDto extends Partial<CreateRequestInformationDto> {
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
}

export interface RequestInformationStatistics {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  closed: number;
}
