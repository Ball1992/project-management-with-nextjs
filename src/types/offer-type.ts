export interface IOfferType {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  status?: 'active' | 'inactive';
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  translations?: IOfferTypeTranslation[];
}

export interface IOfferTypeTranslation {
  id: string;
  offerTypeId: string;
  languageId: string;
  languageCode?: string;
  name: string;
}

export interface CreateOfferTypeDto {
  name: string;
  code: string;
  translations?: Array<{
    languageId: string;
    name: string;
  }>;
}

export interface UpdateOfferTypeDto extends Partial<CreateOfferTypeDto> {}
