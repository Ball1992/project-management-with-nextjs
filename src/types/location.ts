export interface ILocationTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

export interface ILocation {
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
  translations?: ILocationTranslation[];
}

export interface CreateLocationDto {
  code: string;
  sortOrder?: number;
  translations: ILocationTranslation[];
}

export interface UpdateLocationDto {
  code?: string;
  sortOrder?: number;
  translations?: ILocationTranslation[];
}
