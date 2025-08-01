export interface ICurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
}

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface UpdateCurrencyDto extends Partial<CreateCurrencyDto> {}
