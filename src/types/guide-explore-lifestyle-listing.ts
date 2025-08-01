// Guide Explore Lifestyle Listing Types

export interface ILifestyleListingTranslation {
  languageCode: string;
  name: string;
  shortDescription?: string;
  subject?: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
}

export interface IGuideExploreLifestyleListing {
  id: number;
  urlAlias: string;
  name: string;
  shortDescription?: string;
  categoryId: number;
  categoryName?: string;
  subject?: string;
  content?: string;
  thumbnail?: string;
  cover?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  ogImage?: string;
  status: 'draft' | 'published' | 'closed';
  sortOrder: number;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  translations?: ILifestyleListingTranslation[];
}

// DTO Interfaces
export interface CreateLifestyleListingTranslationDto {
  languageCode: string;
  name: string;
  shortDescription?: string;
  subject?: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
}

export interface CreateLifestyleListingDto {
  urlAlias: string;
  name: string;
  shortDescription?: string;
  categoryId: number;
  subject?: string;
  content?: string;
  thumbnail?: string;
  cover?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  ogImage?: string;
  status?: 'draft' | 'published' | 'closed';
  sortOrder?: number;
  translations?: CreateLifestyleListingTranslationDto[];
}

export interface UpdateLifestyleListingDto {
  urlAlias?: string;
  name?: string;
  shortDescription?: string;
  categoryId?: number;
  subject?: string;
  content?: string;
  thumbnail?: string;
  cover?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  ogImage?: string;
  status?: 'draft' | 'published' | 'closed';
  sortOrder?: number;
  translations?: CreateLifestyleListingTranslationDto[];
}

export interface LifestyleListingResponse {
  id: number;
  urlAlias: string;
  name: string;
  shortDescription?: string;
  categoryId: number;
  categoryName?: string;
  subject?: string;
  content?: string;
  thumbnail?: string;
  cover?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  ogImage?: string;
  status: 'draft' | 'published' | 'closed';
  sortOrder: number;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
}