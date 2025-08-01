// Currency type
export interface ICurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_base_currency: boolean;
  is_active: boolean;
  sort_order: number;
  created_date: string;
  updated_date: string;
}

// Location Translation
export interface IPenthouseLocationTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

// Location
export interface IPenthouseLocation {
  id: string;
  code?: string;
  name?: string;
  translations?: IPenthouseLocationTranslation[];
}

// Property Type Translation
export interface IPenthousePropertyTypeTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

// Property Type
export interface IPenthousePropertyType {
  id: string;
  code?: string;
  name?: string;
  translations?: IPenthousePropertyTypeTranslation[];
}

// Office Type
export interface IPenthouseOfficeType {
  id: string;
  name: string;
}

// Offer Type Translation
export interface IPenthouseOfferTypeTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

// Offer Type
export interface IPenthouseOfferType {
  id: string;
  code: string;
  name?: string;
  translations?: IPenthouseOfferTypeTranslation[];
}

// Penthouse Translation
export interface IPenthouseTranslation {
  id: number;
  languageCode: string;
  title: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

// Penthouse Price
export interface IPenthousePrice {
  currencyCode: string;
  price: string;
  priceType: 'sale' | 'rent_monthly' | 'rent_daily';
  isPrimary?: boolean;
}

// Project Info Translation
export interface IProjectInfoTranslation {
  languageCode: string;
  title?: string;
  titleDescription?: string;
  unitSpec?: string;
  unitInformation?: string;
  unitHighlight?: string;
  detail?: string;
  facilitiesSubject?: string;
  floorNumber?: string;
  propertyTypeDetail?: string;
  unitNumber?: string;
  rentalCurrency?: string;
  rentalPeriod?: string;
  projectSize?: number;
  layoutDetail?: string;
  facilitiesDesc?: string;
}

// Project Info Plans Gallery Item
export interface IProjectInfoPlansGalleryItem {
  imageUrl: string;
  imageAlt?: string;
  imageCaption?: string;
  imageType?: string;
  sortOrder?: number;
}

// Project Information Section
export interface IPenthouseProjectInfo {
  bannerImage?: string;
  sortOrder?: number;
  translations?: IProjectInfoTranslation[];
  plansGallery?: IProjectInfoPlansGalleryItem[];
}

// Neighborhood Translation
export interface INeighborhoodTranslation {
  languageCode: string;
  title: string;
  titleDescription?: string;
  titleHighlight?: string;
  contentEditor?: string;
  locationDescription?: string;
}

// Neighborhood Gallery
export interface INeighborhoodGallery {
  imageUrl: string;
  imageAlt?: string;
  imageCaption?: string;
  sortOrder?: number;
}

// Neighborhood Section
export interface IPenthouseNeighborhood {
  locationUrl?: string;
  sortOrder?: number;
  translations?: INeighborhoodTranslation[];
  gallery?: INeighborhoodGallery[];
}

// Gallery Tour Translation
export interface IGalleryTourTranslation {
  languageCode: string;
  title: string;
  titleDescription?: string;
}

// Gallery Tour Gallery
export interface IGalleryTourGallery {
  imageUrl: string;
  imageAlt?: string;
  imageCaption?: string;
  imageType: 'photo' | 'video' | 'virtual_tour';
  sortOrder?: number;
}

// Gallery & Tour Section
export interface IPenthouseGalleryTour {
  sortOrder?: number;
  translations?: IGalleryTourTranslation[];
  gallery?: IGalleryTourGallery[];
}

// Zone Translation
export interface IPenthouseZoneTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

// Zone
export interface IPenthouseZone {
  id: string;
  code?: string;
  name?: string;
  translations?: IPenthouseZoneTranslation[];
}

// Penthouse Zone Association
export interface IPenthouseZoneAssociation {
  zoneId: number;
  sortOrder: number;
}

// Main Penthouse Interface
export interface IPenthouse {
  id: number;
  slug?: string;
  coverImage?: string;
  logoImage?: string;
  thumbnailImage?: string;
  ogImage?: string;
  locationId?: string;
  propertyTypeId?: string;
  officeTypeId?: string;
  offerTypeId?: string;
  zoneId?: string;
  status: 'draft' | 'published' | 'closed';
  publishStartDate?: string;
  publishEndDate?: string;
  isFeatured: boolean;
  isPinned: boolean;
  sortOrder: number;
  urlAlias?: string;
  listingCode?: string;
  title?: string;
  unitSize?: number;
  rentalPrice?: number;
  // New fields
  bedroom?: number;
  bathroom?: number;
  usableAreaSqm?: number;
  plotSizeSqw?: number;
  viewCount: number;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  
  // Relations
  location?: IPenthouseLocation;
  propertyType?: IPenthousePropertyType;
  officeType?: IPenthouseOfficeType;
  offerType?: IPenthouseOfferType;
  zone?: IPenthouseZone;
  zones?: IPenthouseZoneAssociation[];
  translations?: IPenthouseTranslation[];
  prices?: IPenthousePrice[];
  projectInfo?: IPenthouseProjectInfo[];
  neighborhood?: IPenthouseNeighborhood[];
  galleryTour?: IPenthouseGalleryTour[];
}

// DTO Translation interfaces (for API requests - no id required)
export interface CreatePenthouseTranslationDto {
  languageCode: string;
  title: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface CreatePenthousePriceDto {
  currencyCode: string;
  price: string;
  priceType: 'sale' | 'rent_monthly' | 'rent_daily';
  isPrimary?: boolean;
}

export interface CreateProjectInfoTranslationDto {
  languageCode: string;
  title?: string;
  titleDescription?: string;
  unitSpec?: string;
  unitInformation?: string;
  unitHighlight?: string;
  detail?: string;
  facilitiesSubject?: string;
  floorNumber?: string;
  propertyTypeDetail?: string;
  unitNumber?: string;
  rentalCurrency?: string;
  rentalPeriod?: string;
  projectSize?: number;
  layoutDetail?: string;
  facilitiesDesc?: string;
}

export interface CreatePenthouseProjectInfoDto {
  bannerImage?: string;
  sortOrder?: number;
  translations?: CreateProjectInfoTranslationDto[];
}

export interface CreateNeighborhoodTranslationDto {
  languageCode: string;
  title: string;
  titleDescription?: string;
  titleHighlight?: string;
  contentEditor?: string;
  locationDescription?: string;
}

export interface CreatePenthouseNeighborhoodDto {
  locationUrl?: string;
  sortOrder?: number;
  translations?: CreateNeighborhoodTranslationDto[];
}

export interface CreateGalleryTourTranslationDto {
  languageCode: string;
  title: string;
  titleDescription?: string;
}

export interface CreatePenthouseGalleryTourDto {
  sortOrder?: number;
  translations?: CreateGalleryTourTranslationDto[];
}

// DTOs
export interface CreatePenthouseDto {
  slug?: string;
  coverImage?: string;
  logoImage?: string;
  thumbnailImage?: string;
  ogImage?: string;
  locationId?: string;
  propertyTypeId?: string;
  officeTypeId?: string;
  offerTypeId?: string;
  zoneId?: string;
  status?: 'draft' | 'published' | 'closed';
  publishStartDate?: string;
  publishEndDate?: string;
  isFeatured?: boolean;
  isPinned?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  urlAlias?: string;
  listingCode?: string;
  unitSize?: number;
  rentalPrice?: number;
  // New fields
  bedroom?: number;
  bathroom?: number;
  usableAreaSqm?: number;
  plotSizeSqw?: number;
  translations?: CreatePenthouseTranslationDto[];
  prices?: CreatePenthousePriceDto[];
  projectInfo?: CreatePenthouseProjectInfoDto[];
  neighborhood?: CreatePenthouseNeighborhoodDto[];
  galleryTour?: CreatePenthouseGalleryTourDto[];
}

export interface UpdatePenthouseDto extends Partial<CreatePenthouseDto> {}

export interface PenthouseStatistics {
  total: number;
  draft: number;
  published: number;
  closed: number;
  featured: number;
}
