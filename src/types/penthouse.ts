export interface IPenthouse {
  id: string;
  title: string;
  coverImage?: string;
  locationId?: string;
  propertyTypeId?: string;
  officeTypeId?: string;
  propertyPrice?: string;
  status: 'draft' | 'published' | 'archived';
  publishStartDate?: string;
  publishEndDate?: string;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  location?: {
    id: string;
    name: string;
  };
  propertyType?: {
    id: string;
    name: string;
  };
  officeType?: {
    id: string;
    name: string;
  };
}

export interface CreatePenthouseDto {
  title: string;
  coverImage?: string;
  locationId?: string;
  propertyTypeId?: string;
  officeTypeId?: string;
  propertyPrice?: string;
  status?: 'draft' | 'published' | 'archived';
  publishStartDate?: string;
  publishEndDate?: string;
}

export interface UpdatePenthouseDto extends Partial<CreatePenthouseDto> {}

export interface PenthouseStatistics {
  total: number;
  draft: number;
  published: number;
  archived: number;
}
