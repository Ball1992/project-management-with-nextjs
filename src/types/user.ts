import type { IDateValue, ISocialLink } from './common';

// ----------------------------------------------------------------------

export type IUserRole = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  updatedBy: string;
  updatedByName: string;
  updatedDate: string;
};

export type IUser = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string;
  lastLoginDate: string;
  loginMethod: string;
  azureId: string;
  roleId: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  updatedBy: string;
  updatedByName: string;
  updatedDate: string;
  role: IUserRole;
  note?: string; // Add note field
};

// ----------------------------------------------------------------------

export type IUserTableFilters = {
  name: string;
  roles: string[];
  status?: string;
  experience?: string;
  benefits?: string[];
  locations?: string[];
  employmentTypes?: string[];
  statusTypes?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
};

export type IUserFilters = {
  roles: string[];
  experience: string;
  benefits: string[];
  locations: string[];
  employmentTypes: string[];
};

export type IUserProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type IUserProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: ISocialLink;
};

export type IUserProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IUserProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: IDateValue;
};

export type IUserProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IUserProfilePost = {
  id: string;
  media: string;
  message: string;
  createdAt: IDateValue;
  personLikes: { name: string; avatarUrl: string }[];
  comments: {
    id: string;
    message: string;
    createdAt: IDateValue;
    author: { id: string; name: string; avatarUrl: string };
  }[];
};

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUserItem = {
  id: string;
  name: string;
  city: string;
  role: string;
  email: string;
  state: string;
  status: string;
  address: string;
  country: string;
  zipCode: string;
  company: string;
  avatarUrl: string;
  phoneNumber: string;
  isVerified: boolean;
  updatedDate: IDateValue;
  gender: [];
};

export type IUserPermisItem = {
  id: string;
  name: string;
  role?: string;
  status?: string;
  updatedDate?: IDateValue;
  view?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
};

export type IBlogListItem = {
  id: string;
  name: string;
  viewAmt: number;
  status: string;
  updatedDate: IDateValue;
};

export type IBlogItem = {
  id: string;
  name: string;
  viewAmt: number;
  groupName: string;
  status: string;
  updatedDate: IDateValue;
};



export type IUserAccountBillingHistory = {
  id: string;
  price: number;
  invoiceNumber: string;
  createdAt: IDateValue;
};
