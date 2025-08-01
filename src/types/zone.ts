export interface IZoneTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

export interface IZone {
  id: number;
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
  translations?: IZoneTranslation[];
}

export interface CreateZoneDto {
  code: string;
  sortOrder?: number;
  translations: IZoneTranslation[];
}

export interface UpdateZoneDto {
  code?: string;
  sortOrder?: number;
  translations?: IZoneTranslation[];
}
