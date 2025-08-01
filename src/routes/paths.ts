const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  CORE: '/core',
  MENU: '/menu',
};

// ----------------------------------------------------------------------

export const paths = {
  auth: {
    signIn: `${ROOTS.AUTH}/sign-in`,
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    azureLogin: {
      signIn: `${ROOTS.AUTH}/azure-login/sign-in`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
    analytics: `${ROOTS.DASHBOARD}/analytics`,
    app: `${ROOTS.DASHBOARD}/app`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
    user: {
      root: `${ROOTS.CORE}/user/list`,
      new: `${ROOTS.CORE}/user/new`,
      list: `${ROOTS.CORE}/user/list`,
      edit: (id: string) => `${ROOTS.CORE}/user/${id}/edit`,
      detail: (id: string) => `${ROOTS.CORE}/user/${id}/detail`,
      account: `${ROOTS.CORE}/user/account`,
    },
    contact: {
      root: `${ROOTS.MENU}/contact`,
      detail: (id: string) => `${ROOTS.MENU}/contact/${id}`,
    },
    permis: {
      root: `${ROOTS.CORE}/permis/list`,
      new: `${ROOTS.CORE}/permis/new`,
      list: `${ROOTS.CORE}/permis/list`,
      edit: (id: string) => `${ROOTS.CORE}/permis/${id}/edit`,
      addSub: (id: string) => `${ROOTS.CORE}/permis/${id}/new`,
      detail: (id: string) => `${ROOTS.CORE}/permis/${id}/detail`
    },
    menu: {
      root: `${ROOTS.CORE}/menu/list`,
      new: `${ROOTS.CORE}/menu/new`,
      list: `${ROOTS.CORE}/menu/list`,
      edit: (id: string) => `${ROOTS.CORE}/menu/${id}/edit`,
      detail: (id: string) => `${ROOTS.CORE}/menu/${id}/detail`
    },
    setting: {
      root: `${ROOTS.CORE}/setting/edit`,
    },
    roles: {
      root: `${ROOTS.CORE}/roles/list`,
      new: `${ROOTS.CORE}/roles/new`,
      list: `${ROOTS.CORE}/roles/list`,
      edit: (id: string) => `${ROOTS.CORE}/roles/${id}/edit`,
      detail: (id: string) => `${ROOTS.CORE}/roles/${id}/detail`,
    },
    auditLogs: {
      root: `${ROOTS.CORE}/audit-logs/list`,
      list: `${ROOTS.CORE}/audit-logs/list`,
      activity: `${ROOTS.CORE}/audit-logs/activity`,
      detail: (id: string) => `${ROOTS.CORE}/audit-logs/${id}/detail`,
    },
    globalSettings: {
      overview: `${ROOTS.CORE}/global-settings/overview`,
      advanced: `${ROOTS.CORE}/global-settings/advanced`,
    },
    internationalization: {
      root: `${ROOTS.CORE}/internationalization/list`,
      new: `${ROOTS.CORE}/internationalization/new`,
      list: `${ROOTS.CORE}/internationalization/list`,
      edit: (id: string) => `${ROOTS.CORE}/internationalization/${id}/edit`,
      detail: (id: string) => `${ROOTS.CORE}/internationalization/${id}/detail`,
    },
    languageVariables: {
      root: `${ROOTS.CORE}/language-variables/list`,
      new: `${ROOTS.CORE}/language-variables/new`,
      list: `${ROOTS.CORE}/language-variables/list`,
      edit: (id: string) => `${ROOTS.CORE}/language-variables/${id}/edit`,
      detail: (id: string) => `${ROOTS.CORE}/language-variables/${id}/detail`,
    },
    offerType: {
      root: `${ROOTS.MENU}/our-penthouses/offer-type`,
      new: `${ROOTS.MENU}/our-penthouses/offer-type/new`,
      list: `${ROOTS.MENU}/our-penthouses/offer-type`,
      edit: (id: string) => `${ROOTS.MENU}/our-penthouses/offer-type/${id}`,
    },
    listings: {
      root: `${ROOTS.MENU}/our-penthouses/listings`,
      new: `${ROOTS.MENU}/our-penthouses/listings/new`,
      list: `${ROOTS.MENU}/our-penthouses/listings`,
      edit: (id: string) => `${ROOTS.MENU}/our-penthouses/listings/${id}`,
    },
    roleTest: `${ROOTS.DASHBOARD}/role-test`,
  },
  // MENU
  menu: {
    home: {
      about: `${ROOTS.MENU}/home/about`,
    },
  },
};
