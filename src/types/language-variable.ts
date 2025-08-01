// ----------------------------------------------------------------------

export type ILanguageVariable = {
  id: string;
  key: string;
  defaultValue: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
  translations?: ILanguageVariableTranslation[];
};

export type ILanguageVariableTranslation = {
  id: string;
  labelId: string;
  languageCode: string;
  value: string;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
};

export type ILanguageVariableFilters = {
  key?: string;
  isActive?: boolean;
};

export type ILanguageVariableTableFilters = {
  name: string;
  status: string;
};

export type ILanguageVariableTableFilterValue = string | string[];

// ----------------------------------------------------------------------

export type ILanguageVariableItem = {
  id: string;
  key: string;
  defaultValue: string;
  description?: string;
  isActive: boolean;
  translations?: ILanguageVariableTranslation[];
};
