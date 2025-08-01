export interface IOfficeType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
}

export interface CreateOfficeTypeDto {
  name: string;
  description?: string;
}

export interface UpdateOfficeTypeDto extends Partial<CreateOfficeTypeDto> {}

export interface OfficeTypeStatistics {
  total: number;
  active: number;
  inactive: number;
}
