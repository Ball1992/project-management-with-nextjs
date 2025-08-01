// Exclusive Neighborhoods Listings Types

export interface INeighborhoodListingTranslation {
  languageCode: string;
  name: string;
  shortDescription?: string;
  subject?: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
}

export interface IExclusiveNeighborhoodListing {
  id: number;
  urlAlias: string;
  name: string;
  shortDescription?: string;
  locationId: number;
  locationName?: string;
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
  translations?: INeighborhoodListingTranslation[];
}

// DTO Interfaces
export interface CreateNeighborhoodListingTranslationDto {
  languageCode: string;
  name: string;
  shortDescription?: string;
  subject?: string;
  content?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
}

export interface CreateNeighborhoodListingDto {
  urlAlias: string;
  name: string;
  shortDescription?: string;
  locationId: number;
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
  translations?: CreateNeighborhoodListingTranslationDto[];
}

export interface UpdateNeighborhoodListingDto {
  urlAlias?: string;
  name?: string;
  shortDescription?: string;
  locationId?: number;
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
  translations?: CreateNeighborhoodListingTranslationDto[];
}

export interface NeighborhoodListingResponse {
  id: number;
  urlAlias: string;
  name: string;
  shortDescription?: string;
  locationId: number;
  locationName?: string;
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