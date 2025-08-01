
export interface IExclusiveNeighborhoodsLocationTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

export interface IExclusiveNeighborhoodsLocation {
  id: number;
  code?: string;
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
  translations?: IExclusiveNeighborhoodsLocationTranslation[];
}

export interface CreateExclusiveNeighborhoodsLocationDto {
  code?: string;
  name: string;
  sortOrder?: number;
  translations?: {
    languageCode: string;
    name: string;
    description?: string;
  }[];
}

export interface UpdateExclusiveNeighborhoodsLocationDto {
  code?: string;
  name?: string;
  sortOrder?: number;
  translations?: {
    languageCode: string;
    name: string;
    description?: string;
  }[];
}