export interface IPropertyType {
  id: string;
  name: string;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
}

export interface CreatePropertyTypeDto {
  name: string;
}

export interface UpdatePropertyTypeDto extends Partial<CreatePropertyTypeDto> {}
