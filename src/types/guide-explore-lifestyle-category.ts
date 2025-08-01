// Guide Explore Lifestyle Category Types

export interface ILifestyleCategoryTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

export interface IGuideExploreLifestyleCategory {
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
  translations?: ILifestyleCategoryTranslation[];
}

// DTO Interfaces
export interface CreateLifestyleCategoryTranslationDto {
  languageCode: string;
  name: string;
  description?: string;
}

export interface CreateLifestyleCategoryDto {
  code: string;
  name: string;
  sortOrder?: number;
  translations?: CreateLifestyleCategoryTranslationDto[];
}

export interface UpdateLifestyleCategoryDto {
  code?: string;
  name?: string;
  sortOrder?: number;
  translations?: CreateLifestyleCategoryTranslationDto[];
}

export interface LifestyleCategoryResponse {
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
}