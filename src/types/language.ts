// ----------------------------------------------------------------------

export type ILanguage = {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flagIcon?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  // Legacy fields for backward compatibility
  native_name?: string;
  flag_icon?: string;
  is_default?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_by?: string;
  created_by_name?: string;
  created_date?: string;
  updated_by?: string;
  updated_by_name?: string;
  updated_date?: string;
};

export type ILanguageFilters = {
  name?: string;
  is_active?: boolean;
  is_default?: boolean;
};

export type ILanguageTableFilters = {
  name: string;
  status: string;
};

export type ILanguageTableFilterValue = string | string[];

// ----------------------------------------------------------------------

export type ILanguageItem = {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag_icon?: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
};
