import { create } from 'domain';
import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const USER_STATUS_OPTIONS = [
  { value: 'enable', label: 'Enable' },
  { value: 'disable', label: 'Disable' },
  // { value: 'active', label: 'Enable' },
  // { value: 'pending', label: 'Pending' },
  // { value: 'banned', label: 'Banned' },
  // { value: 'rejected', label: 'Rejected' },
];

export const _userAbout = {
  id: _mock.id(1),
  role: _mock.role(1),
  email: _mock.email(1),
  school: _mock.companyNames(2),
  company: _mock.companyNames(1),
  country: _mock.countryNames(2),
  coverUrl: _mock.image.cover(3),
  totalFollowers: _mock.number.nativeL(1),
  totalFollowing: _mock.number.nativeL(2),
  quote:
    'Tart I love sugar plum I love oat cake. Sweet roll caramels I love jujubes. Topping cake wafer..',
  socialLinks: {
    facebook: `https://www.facebook.com/caitlyn.kerluke`,
    instagram: `https://www.instagram.com/caitlyn.kerluke`,
    linkedin: `https://www.linkedin.com/in/caitlyn.kerluke`,
    twitter: `https://www.twitter.com/caitlyn.kerluke`,
  },
};

export const _userFollowers = Array.from({ length: 18 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  country: _mock.countryNames(index),
  avatarUrl: _mock.image.avatar(index),
}));

export const _userFriends = Array.from({ length: 18 }, (_, index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
}));

export const _userGallery = Array.from({ length: 12 }, (_, index) => ({
  id: _mock.id(index),
  postedAt: _mock.time(index),
  title: _mock.postTitle(index),
  imageUrl: _mock.image.cover(index),
}));

export const _userFeeds = Array.from({ length: 3 }, (_, index) => ({
  id: _mock.id(index),
  createdAt: _mock.time(index),
  media: _mock.image.travel(index + 1),
  message: _mock.sentence(index),
  personLikes: Array.from({ length: 20 }, (__, personIndex) => ({
    name: _mock.fullName(personIndex),
    avatarUrl: _mock.image.avatar(personIndex + 2),
  })),
  comments: (index === 2 && []) || [
    {
      id: _mock.id(7),
      author: {
        id: _mock.id(8),
        avatarUrl: _mock.image.avatar(index + 5),
        name: _mock.fullName(index + 5),
      },
      createdAt: _mock.time(2),
      message: 'Praesent venenatis metus at',
    },
    {
      id: _mock.id(9),
      author: {
        id: _mock.id(10),
        avatarUrl: _mock.image.avatar(index + 6),
        name: _mock.fullName(index + 6),
      },
      createdAt: _mock.time(3),
      message:
        'Etiam rhoncus. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed lectus.',
    },
  ],
}));

export const _userCards = Array.from({ length: 21 }, (_, index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  coverUrl: _mock.image.cover(index),
  avatarUrl: _mock.image.avatar(index),
  totalFollowers: _mock.number.nativeL(index),
  totalPosts: _mock.number.nativeL(index + 2),
  totalFollowing: _mock.number.nativeL(index + 1),
}));

export const _userPayment = Array.from({ length: 3 }, (_, index) => ({
  id: _mock.id(index),
  cardNumber: ['**** **** **** 1234', '**** **** **** 5678', '**** **** **** 7878'][index],
  cardType: ['mastercard', 'visa', 'visa'][index],
  primary: index === 1,
}));

export const _userAddressBook = Array.from({ length: 4 }, (_, index) => ({
  id: _mock.id(index),
  primary: index === 0,
  name: _mock.fullName(index),
  phoneNumber: _mock.phoneNumber(index),
  fullAddress: _mock.fullAddress(index),
  addressType: (index === 0 && 'Home') || 'Office',
}));

export const _userInvoices = Array.from({ length: 10 }, (_, index) => ({
  id: _mock.id(index),
  invoiceNumber: `INV-199${index}`,
  createdAt: _mock.time(index),
  price: _mock.number.price(index),
}));

export const _userPlans = [
  { subscription: 'basic', price: 0, primary: false },
  { subscription: 'starter', price: 4.99, primary: true },
  { subscription: 'premium', price: 9.99, primary: false },
];

export const _userList = Array.from({ length: 20 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  city: 'Rancho Cordova',
  role: _mock.role(index),
  email: _mock.email(index),
  state: 'Virginia',
  status:(index % 2 && 'enable') || (index % 3 && 'disable') || (index % 4 && 'enable') || 'disable',
  address: '908 Jack Locks',
  country: _mock.countryNames(index),
  zipCode: '85807',
  company: _mock.companyNames(index),
  avatarUrl: _mock.image.avatar(index),
  phoneNumber: _mock.phoneNumber(index),
  isVerified: _mock.boolean(index),
  updatedDate: _mock.time(index),
  gender: [1],
}));

export const _permisList = Array.from({ length: 3 }, (_, index) => ({
  id: _mock.id(index),
  roles: _mock.roleName(index),
  name: _mock.role(index),
  updatedDate: _mock.time(index),
  permis: [],
  status:
    (index % 2 && 'enable') || (index % 3 && 'disable') || (index % 4 && 'enable') || 'disable',
}));

export const _blogList = Array.from({ length: 4 }, (_, index) => ({
  id: _mock.id(index),
  viewAmt: _mock.number.age(index),
  name: _mock.blogNames(index),
  updatedDate: _mock.time(index),
  groupName: _mock.blogGroups(index),
  status:
    (index % 2 && 'enable') || (index % 3 && 'disable') || (index % 4 && 'enable') || 'disable',
}));

export const _blogGroupList = Array.from({ length: 3 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.blogGroups(index),
  updatedDate: _mock.time(index),
  status:
    (index % 2 && 'enable') || (index % 3 && 'disable') || (index % 4 && 'enable') || 'disable',
}));


export const _permisMenuList = Array.from({ length: 20 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.menu(index),
  updatedDate: _mock.time(index),
  view: _mock.boolean(index),
  create: _mock.boolean(index),
  update: _mock.boolean(index),
  delete: _mock.boolean(index),
}));

export const _menuList = Array.from({ length: 20 }, (_, index) => ({
  id: _mock.id(index),
  zipCode: '85807',
  state: 'Virginia',
  city: 'Rancho Cordova',
  role: _mock.role(index),
  email: _mock.email(index),
  address: '908 Jack Locks',
  name: _mock.menu(index),
  show: 'Show',
  menuType: 'Module',
  updatedDate: _mock.time(index),
  status:
    (index % 2 && 'enable') || (index % 3 && 'disable') || (index % 4 && 'enable') || 'disable',
  items: [{
    name: _mock.menu(index),
    menuType: 'Module',
    show: 'Show',
    status:
    (index % 2 && 'enable') || (index % 3 && 'disable') || (index % 4 && 'enable') || 'disable',
    updatedDate: _mock.time(index),
  }]

}));

