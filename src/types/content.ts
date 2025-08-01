export interface IContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categoryId: string;
  status: 'draft' | 'published' | 'archived';
  publishStartDate?: string;
  publishEndDate?: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  translations?: IContentTranslation[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface IContentTranslation {
  id: string;
  languageCode: string;
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface CreateContentDto {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categoryId: string;
  status?: 'draft' | 'published' | 'archived';
  publishStartDate?: string;
  publishEndDate?: string;
  isVisible?: boolean;
}

export interface UpdateContentDto extends Partial<CreateContentDto> {}

export interface CreateContentTranslationDto {
  languageCode: string;
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}
