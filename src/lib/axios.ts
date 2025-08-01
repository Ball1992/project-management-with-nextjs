import type { AxiosRequestConfig, AxiosError } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

// Request queue to prevent too many simultaneous requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestDelay = 100; // 100ms delay between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        await request();
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
      }
    }
    
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second

// Refresh token management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

const refreshToken = async (): Promise<string | null> => {
  try {
    // Create a new axios instance without interceptors to avoid infinite loops
    const refreshAxios = axios.create({
      baseURL: CONFIG.serverUrl,
      timeout: 30000,
      withCredentials: true, // Important for httpOnly cookies
    });

    const response = await refreshAxios.post('/auth/refresh');
    const { data } = response.data;
    
    if (data && data.accessToken) {
      // Update session storage with new access token (client-side only)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(JWT_STORAGE_KEY, data.accessToken);
      }
      return data.accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

const redirectToLogin = () => {
  // Clear session storage (client-side only)
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(JWT_STORAGE_KEY);
    // Redirect to login page
    window.location.href = paths.auth.signIn;
  }
};

const axiosInstance = axios.create({ 
  baseURL: CONFIG.serverUrl,
  timeout: 30000, // Increased timeout to 30 seconds
  withCredentials: true, // Enable cookies for refresh token
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if we're in browser environment before accessing sessionStorage
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem(JWT_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and implement retry logic
axiosInstance.interceptors.response.use(
  (response) => {
    // Keep the original API response format: {responseStatus, responseMessage, data}
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { 
      _retry?: number;
      _isRetryRequest?: boolean;
    };
    
    // Handle 429 Too Many Requests with retry logic
    if (error.response?.status === 429 && originalRequest) {
      originalRequest._retry = originalRequest._retry || 0;
      
      if (originalRequest._retry < MAX_RETRIES) {
        originalRequest._retry++;
        
        // Calculate delay with exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, originalRequest._retry - 1);
        
        console.warn(`Rate limited. Retrying request in ${delay}ms... (Attempt ${originalRequest._retry}/${MAX_RETRIES})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return axiosInstance(originalRequest);
      }
    }
    
    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && originalRequest && !originalRequest._isRetryRequest) {
      // Skip refresh for refresh endpoint to avoid infinite loop
      if (originalRequest.url?.includes('/auth/refresh')) {
        redirectToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._isRetryRequest = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        
        if (newToken) {
          // Process queued requests with new token
          processQueue(null, newToken);
          
          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          // Refresh failed, redirect to login
          processQueue(new Error('Token refresh failed'), null);
          redirectToLogin();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        processQueue(refreshError, null);
        redirectToLogin();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Return the error response as-is for handling by api-response-handler
    return Promise.reject(error);
  }
);

// Wrapper function to use request queue for all requests
const queuedRequest = async (config: AxiosRequestConfig) => {
  return requestQueue.add(() => axiosInstance(config));
};

// Override axios methods to use the queue
const queuedAxios = {
  get: (url: string, config?: AxiosRequestConfig) => 
    queuedRequest({ ...config, method: 'GET', url }),
  post: (url: string, data?: any, config?: AxiosRequestConfig) => 
    queuedRequest({ ...config, method: 'POST', url, data }),
  put: (url: string, data?: any, config?: AxiosRequestConfig) => 
    queuedRequest({ ...config, method: 'PUT', url, data }),
  delete: (url: string, config?: AxiosRequestConfig) => 
    queuedRequest({ ...config, method: 'DELETE', url }),
  patch: (url: string, data?: any, config?: AxiosRequestConfig) => 
    queuedRequest({ ...config, method: 'PATCH', url, data }),
};

// Export the queued axios instance
export default queuedAxios;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await queuedAxios.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/auth/profile',
    signIn: '/auth/login',
    signUp: '/auth/register',
    refresh: '/auth/refresh',
    azureLogin: '/auth/azure',
    azureCallback: '/auth/azure/callback',
  },
  user: {
    list: '/users',
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    detail: (id: string) => `/users/${id}`,
    uploadAvatar: '/users/upload-avatar',
    export: '/users/export',
  },
  role: {
    list: '/roles',
    create: '/roles',
    update: (id: string) => `/roles/${id}`,
    delete: (id: string) => `/roles/${id}`,
    detail: (id: string) => `/roles/${id}`,
    permissions: (id: string) => `/roles/${id}/permissions`,
    setPermissions: (id: string) => `/roles/${id}/permissions`,
    menusPermissions: '/roles/menus/permissions',
    updateMenusPermissions: '/roles/menus/permissions',
    export: '/roles/export',
  },
  permission: {
    list: '/permissions',
    create: '/permissions',
    update: (id: string) => `/permissions/${id}`,
    delete: (id: string) => `/permissions/${id}`,
    detail: (id: string) => `/permissions/${id}`,
  },
  menu: {
    list: '/menu',
    create: '/menu',
    update: (id: string) => `/menu/${id}`,
    delete: (id: string) => `/menu/${id}`,
    detail: (id: string) => `/menu/${id}`,
    tree: '/menu/tree',
    export: '/menu/export',
  },
  auditLog: {
    list: '/audit/activity',
    create: '/audit-logs',
    delete: (id: string) => `/audit-logs/${id}`,
    detail: (id: string) => `/audit-logs/${id}`,
    activity: '/audit/activity',
    export: '/audit/activity/export',
  },
  settings: {
    list: '/settings',
    detail: (key: string) => `/settings/${key}`,
    update: (key: string) => `/settings/${key}`,
    category: (category: string) => `/settings/category/${category}`,
    bulk: '/settings/bulk',
  },
  account: {
    profile: '/auth/profile',
    updateProfile: '/auth/profile',
    changePassword: '/account/change-password',
    uploadAvatar: '/account/avatar',
    deleteAvatar: '/account/avatar',
  },
  dashboard: {
    overview: '/dashboard/overview',
    analytics: '/dashboard/analytics',
  },
  language: {
    list: '/languages',
    create: '/languages',
    update: (id: string) => `/languages/${id}`,
    delete: (id: string) => `/languages/${id}`,
    details: (id: string) => `/languages/${id}`,
    default: '/languages/default',
    setDefault: '/languages/set-default',
    export: '/languages/export',
  },
  languageVariable: {
    list: '/labels',
    create: '/labels',
    update: (id: string) => `/labels/${id}`,
    delete: (id: string) => `/labels/${id}`,
    details: (id: string) => `/labels/${id}`,
    byLanguage: '/labels/by-language',
    translations: (id: string) => `/labels/${id}/translations`,
    addTranslation: (id: string) => `/labels/${id}/translations`,
    updateTranslation: (labelId: string, translationId: string) => `/labels/${labelId}/translations/${translationId}`,
    deleteTranslation: (labelId: string, translationId: string) => `/labels/${labelId}/translations/${translationId}`,
    export: '/labels/export',
  },
  files: {
    upload: '/files/upload',
    list: '/files',
    detail: (id: string) => `/files/${id}`,
    delete: (id: string) => `/files/${id}`,
  },
  content: {
    list: '/contents',
    create: '/contents',
    update: (id: string) => `/contents/${id}`,
    delete: (id: string) => `/contents/${id}`,
    details: (id: string) => `/contents/${id}`,
    bySlug: (slug: string) => `/contents/slug/${slug}`,
    published: '/contents/published/list',
    translations: (id: string) => `/contents/${id}/translations`,
  },
  
  // Contact endpoints - RUD (Read, Update, Delete)
  contact: {
    list: '/contact-form',
    create: '/contact-form',
    update: (id: string) => `/contact-form/${id}`,
    delete: (id: string) => `/contact-form/${id}`,
    detail: (id: string) => `/contact-form/${id}`,
    statistics: '/contact-form/statistics',
    export: '/contact-form/export',
  },
  // Penthouses/Listings endpoints - CRUD
  penthouses: {
    list: '/penthouses',
    create: '/penthouses',
    update: (id: string) => `/penthouses/${id}`,
    delete: (id: string) => `/penthouses/${id}`,
    detail: (id: string) => `/penthouses/${id}`,
    statistics: '/penthouses/statistics',
    publish: (id: string) => `/penthouses/${id}/publish`,
    unpublish: (id: string) => `/penthouses/${id}/unpublish`,
    close: (id: string) => `/penthouses/${id}/close`,
  },
  
  // Locations endpoints - CRUD
  locations: {
    list: '/penthouses-location',
    create: '/penthouses-location',
    update: (id: string) => `/penthouses-location/${id}`,
    delete: (id: string) => `/penthouses-location/${id}`,
    detail: (id: string) => `/penthouses-location/${id}`,
    public: '/penthouses-location/public',
    export: '/penthouses-location/export',
  },
  // Property Types endpoints - CRUD
  propertyTypes: {
    list: '/penthouses-property-type',
    create: '/penthouses-property-type',
    update: (id: string) => `/penthouses-property-type/${id}`,
    delete: (id: string) => `/penthouses-property-type/${id}`,
    detail: (id: string) => `/penthouses-property-type/${id}`,
    public: '/penthouses-property-type/public',
    export: '/penthouses-property-type/export',
  },
  // Request Information endpoints - CRUD
  requestInformation: {
    list: '/penthouses-request-information',
    create: '/penthouses-request-information',
    update: (id: string) => `/penthouses-request-information/${id}`,
    delete: (id: string) => `/penthouses-request-information/${id}`,
    detail: (id: string) => `/penthouses-request-information/${id}`,
    statistics: '/penthouses-request-information/statistics',
    byPenthouses: (penthousesId: string) => `/penthouses-request-information/penthouses/${penthousesId}`,
  },
  // Office Types endpoints - READ only
  officeTypes: {
    list: '/penthouses-office-type',
    detail: (id: string) => `/penthouses-office-type/${id}`,
  },
  // Currency endpoints - READ only
  currencies: {
    list: '/currencies',
    base: '/currencies/base',
    byCode: (code: string) => `/currencies/${code}`,
  },
  // Offer Types endpoints - READ only
  offerTypes: {
    list: '/penthouses-offer-type',
    detail: (id: string) => `/penthouses-offer-type/${id}`,
  },
  // Zones endpoints - CRUD
  zones: {
    list: '/penthouses-zone',
    create: '/penthouses-zone',
    update: (id: string) => `/penthouses-zone/${id}`,
    delete: (id: string) => `/penthouses-zone/${id}`,
    detail: (id: string) => `/penthouses-zone/${id}`,
    public: '/penthouses-zone/public',
    export: '/penthouses-zone/export',
  },
  // Exclusive Neighborhoods Locations endpoints - CRUD
  exclusiveNeighborhoodsLocations: {
    list: '/exclusive-neighborhoods-locations',
    create: '/exclusive-neighborhoods-locations',
    update: (id: number) => `/exclusive-neighborhoods-locations/${id}`,
    delete: (id: number) => `/exclusive-neighborhoods-locations/${id}`,
    detail: (id: number) => `/exclusive-neighborhoods-locations/${id}`,
    public: '/exclusive-neighborhoods-locations/public',
    export: '/exclusive-neighborhoods-locations/export',
  },
  guideExploreLifestyleCategory: {
  list: '/guide-explore-lifestyle-category',
  create: '/guide-explore-lifestyle-category',
  update: (id: number) => `/guide-explore-lifestyle-category/${id}`,
  delete: (id: number) => `/guide-explore-lifestyle-category/${id}`,
  detail: (id: number) => `/guide-explore-lifestyle-category/${id}`,
  byCode: (code: string) => `/guide-explore-lifestyle-category/code/${code}`,
},

// Guide Explore Lifestyle Listing endpoints - CRUD
guideExploreLifestyleListing: {
  list: '/guide-explore-lifestyle-listing',
  create: '/guide-explore-lifestyle-listing',
  update: (id: number) => `/guide-explore-lifestyle-listing/${id}`,
  delete: (id: number) => `/guide-explore-lifestyle-listing/${id}`,
  detail: (id: number) => `/guide-explore-lifestyle-listing/${id}`,
  byUrlAlias: (urlAlias: string) => `/guide-explore-lifestyle-listing/url-alias/${urlAlias}`,
  uploadOgImage: '/guide-explore-lifestyle-listing/upload/og-image',
  uploadCover: '/guide-explore-lifestyle-listing/upload/cover',
  uploadThumbnail: '/guide-explore-lifestyle-listing/upload/thumbnail',
},

// Exclusive Neighborhoods Listings endpoints - CRUD
exclusiveNeighborhoodsListings: {
  list: '/exclusive-neighborhoods-listings',
  create: '/exclusive-neighborhoods-listings',
  update: (id: number) => `/exclusive-neighborhoods-listings/${id}`,
  delete: (id: number) => `/exclusive-neighborhoods-listings/${id}`,
  detail: (id: number) => `/exclusive-neighborhoods-listings/${id}`,
  uploadOgImage: '/exclusive-neighborhoods-listings/upload/og-image',
  uploadCover: '/exclusive-neighborhoods-listings/upload/cover',
  uploadThumbnail: '/exclusive-neighborhoods-listings/upload/thumbnail',
},

// Guide Explore Future Project endpoints - CRUD
guideExploreFutureProject: {
  list: '/guide-explore-future-project',
  create: '/guide-explore-future-project',
  update: (id: number) => `/guide-explore-future-project/${id}`,
  delete: (id: number) => `/guide-explore-future-project/${id}`,
  detail: (id: number) => `/guide-explore-future-project/${id}`,
  byUrlAlias: (urlAlias: string) => `/guide-explore-future-project/url-alias/${urlAlias}`,
  uploadOgImage: '/guide-explore-future-project/upload/og-image',
  uploadCover: '/guide-explore-future-project/upload/cover',
  uploadThumbnail: '/guide-explore-future-project/upload/thumbnail',
  uploadLogo: '/guide-explore-future-project/upload/logo',
},

// Buyers Guide endpoints - CRUD
buyersGuide: {
  list: '/buyers-guide',
  create: '/buyers-guide',
  update: (id: number) => `/buyers-guide/${id}`,
  delete: (id: number) => `/buyers-guide/${id}`,
  detail: (id: number) => `/buyers-guide/${id}`,
  published: '/buyers-guide/published',
  byUrlAlias: (urlAlias: string) => `/buyers-guide/url/${urlAlias}`,
  uploadOgImage: '/buyers-guide/upload/og-image',
},
};
