// Guide Explore Future Project Types

export interface IFutureProjectTranslation {
  languageCode: string;
  title: string;
  description?: string;
  contentDetail?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
}

export interface IFutureProjectZone {
  zoneId: number;
  sortOrder: number;
}

export interface IFutureProjectPrice {
  currencyCode: string;
  price: string;
  priceType: 'for_sale' | 'for_rent';
  isPrimary?: boolean;
}

export interface IGuideExploreFutureProject {
  id: number;
  coverImage?: string;
  thumbnailImage?: string;
  ogImage?: string;
  locationId?: string;
  locationName?: string;
  propertyTypeId?: string;
  propertyTypeName?: string;
  offerTypeId?: string;
  offerTypeName?: string;
  status: 'draft' | 'published' | 'closed';
  publishStartDate?: string;
  publishEndDate?: string;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  isActive: boolean;
  isPinned: boolean;
  urlAlias?: string;
  listingCode?: string;
  title?: string;
  description?: string;
  contentDetail?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  translations?: IFutureProjectTranslation[];
  zones?: IFutureProjectZone[];
  prices?: IFutureProjectPrice[];
}

// DTO Interfaces
export interface CreateFutureProjectTranslationDto {
  languageCode: string;
  title: string;
  description?: string;
  contentDetail?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
}

export interface CreateFutureProjectZoneDto {
  zoneId: number;
  sortOrder?: number;
}

export interface CreateFutureProjectPriceDto {
  currencyCode: string;
  price: string;
  priceType: 'for_sale' | 'for_rent';
  isPrimary?: boolean;
}

export interface CreateFutureProjectDto {
  coverImage?: string;
  thumbnailImage?: string;
  ogImage?: string;
  locationId?: string;
  propertyTypeId?: string;
  offerTypeId?: string;
  status?: 'draft' | 'published' | 'closed';
  publishStartDate?: string;
  publishEndDate?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  isPinned?: boolean;
  urlAlias?: string;
  listingCode?: string;
  translations?: CreateFutureProjectTranslationDto[];
  zones?: CreateFutureProjectZoneDto[];
  prices?: CreateFutureProjectPriceDto[];
}

export interface UpdateFutureProjectDto {
  coverImage?: string;
  thumbnailImage?: string;
  ogImage?: string;
  locationId?: string;
  propertyTypeId?: string;
  offerTypeId?: string;
  status?: 'draft' | 'published' | 'closed';
  publishStartDate?: string;
  publishEndDate?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  isPinned?: boolean;
  urlAlias?: string;
  listingCode?: string;
  translations?: CreateFutureProjectTranslationDto[];
  zones?: CreateFutureProjectZoneDto[];
  prices?: CreateFutureProjectPriceDto[];
}

export interface FutureProjectResponse {
  id: number;
  coverImage?: string;
  thumbnailImage?: string;
  ogImage?: string;
  locationId?: string;
  locationName?: string;
  propertyTypeId?: string;
  propertyTypeName?: string;
  offerTypeId?: string;
  offerTypeName?: string;
  status: 'draft' | 'published' | 'closed';
  publishStartDate?: string;
  publishEndDate?: string;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  isActive: boolean;
  isPinned: boolean;
  urlAlias?: string;
  listingCode?: string;
  title?: string;
  description?: string;
  contentDetail?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
}