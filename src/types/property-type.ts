export interface IPropertyTypeTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

export interface IPropertyType {
  id: string;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  translations?: IPropertyTypeTranslation[];
}

export interface CreatePropertyTypeDto {
  code: string;
  sortOrder?: number;
  translations: IPropertyTypeTranslation[];
}

export interface UpdatePropertyTypeDto {
  code?: string;
  sortOrder?: number;
  translations?: IPropertyTypeTranslation[];
}
