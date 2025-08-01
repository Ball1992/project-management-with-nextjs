// Buyers Guide Types

export interface IBuyersGuideTranslation {
  id: number;
  languageCode: string;
  name: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface IBuyersGuide {
  id: number;
  urlAlias: string;
  name: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  ogImage?: string;
  status: 'draft' | 'published' | 'archived';
  sortOrder: number;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  translations?: IBuyersGuideTranslation[];
}

// DTO Interfaces
export interface CreateBuyersGuideTranslationDto {
  languageCode: string;
  name: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
}

export interface CreateBuyersGuideDto {
  urlAlias: string;
  name: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  ogImage?: string;
  status?: 'draft' | 'published' | 'archived';
  sortOrder?: number;
  isActive?: boolean;
  translations?: CreateBuyersGuideTranslationDto[];
}

export interface UpdateBuyersGuideDto {
  urlAlias?: string;
  name?: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  ogImage?: string;
  status?: 'draft' | 'published' | 'archived';
  sortOrder?: number;
  isActive?: boolean;
  translations?: CreateBuyersGuideTranslationDto[];
}

export interface BuyersGuideResponse {
  id: number;
  urlAlias: string;
  name: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  ogImage?: string;
  status: 'draft' | 'published' | 'archived';
  sortOrder: number;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  translations?: IBuyersGuideTranslation[];
}

export interface BuyersGuideListResponse {
  data: BuyersGuideResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}