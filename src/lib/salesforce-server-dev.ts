// lib/salesforce-server.ts
import { SalesforceAuthResponse, SalesforceQueryResponse } from '@/types/salesforce';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class SalesforceServerDEVAPI {
  private baseUrl: string;
  private apiVersion: string;
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;
  private securityToken: string;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;
  private axiosInstance: AxiosInstance;
  private apiOriginalHost: string;

  constructor() {
    this.baseUrl = process.env.SALESFORCE_DEV_INSTANCE_URL!;
    this.apiVersion = 'v61.0';
    this.clientId = process.env.SALESFORCE_DEV_CLIENT_ID!;
    this.clientSecret = process.env.SALESFORCE_DEV_CLIENT_SECRET!;
    this.username = process.env.SALESFORCE_DEV_USERNAME!;
    this.password = process.env.SALESFORCE_DEV_PASSWORD!;
    this.securityToken = process.env.SALESFORCE_DEV_SECURITY_TOKEN!;
    this.username = process.env.SALESFORCE_DEV_USERNAME!;
    this.apiOriginalHost = process.env.SALESFORCE_DEV_API_HOST_ORIGINAL!;

    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        // console.log(`[SF API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        // console.error('[SF API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await this.authenticate();
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (authError) {
            // console.error('[SF API] Re-authentication failed:', authError);
            return Promise.reject(authError);
          }
        }

        // console.error('[SF API] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async authenticate(): Promise<SalesforceAuthResponse> {
    const tokenUrl = `${this.baseUrl}/services/oauth2/token`;
   
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('username', this.username);
    params.append('password', this.password + this.securityToken);

    try {
      const response: AxiosResponse<SalesforceAuthResponse> = await axios.post(
        tokenUrl, 
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;

      // console.log('[SF API] Authentication successful');
      return response.data;
    } catch (error: any) {
      // console.error('[SF API] Authentication error:', error.response?.data || error.message);
      throw new Error(`Authentication failed: ${error.response?.status || error.message}`);
    }
  }
  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken) {
      console.log('[SF API] No access token found, authenticating...');
      await this.authenticate();
      console.log('[SF API] Authentication completed, token acquired');
    } else {
      console.log('[SF API] Using existing access token');
    }
  }

  async getToken<T = any>( data: Partial<T>): Promise<any> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/apexrest/SDSGatewayApi`;
    this.axiosInstance.interceptors.request.use(
      (config) => {
        config.headers["Api-Host"] = `${this.apiOriginalHost}/D-Link-API/api/v1/Auth/User/getToken`;
        config.headers["Api-Method"] = `POST`;
        return config;
      },
      (error) => {
        // console.error('[SF API] Request error:', error);
        return Promise.reject(error);
      }
    );
    const response = await this.axiosInstance.post(url, data);
 
    return response.data;
  }

  async createOrUpdateWorkOrder<T = any>(data: Partial<T>, jwtToken: string): Promise<any> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/apexrest/SDSGatewayApi`;
    
    // Create a new axios instance for this specific request to avoid interceptor conflicts
    const requestConfig = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        'Api-Host': `${this.apiOriginalHost}/D-Link-API/api/v1/WorkOrder/CreateOrUpdate`,
        'Api-Method': 'POST',
        'Api-Authorization': `Bearer ${jwtToken}`
      },
    };

    try {
      const response = await axios.post(url, data, requestConfig);
      // console.log('[SF API] WorkOrder CreateOrUpdate successful');
      return response.data;
    } catch (error: any) {
      // console.error('[SF API] WorkOrder CreateOrUpdate error:', error.response?.data || error.message);
      throw error;
    }
  }
  async updateStatusWorkOrder<T = any>(data: Partial<T>, jwtToken: string): Promise<any> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/apexrest/SDSGatewayApi`;
    
    // Create a new axios instance for this specific request to avoid interceptor conflicts
    const requestConfig = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        'Api-Host': `${this.apiOriginalHost}/D-Link-API/api/v1/WorkOrder/UpdateStatus`,
        'Api-Method': 'POST',
        'Api-Authorization': `Bearer ${jwtToken}`
      },
    };

    try {
      const response = await axios.post(url, data, requestConfig);
      // console.log('[SF API] WorkOrder CreateOrUpdate successful');
      return response.data;
    } catch (error: any) {
      // console.error('[SF API] WorkOrder CreateOrUpdate error:', error.response?.data || error.message);
      throw error;
    }
  }
  async getDOData<T = any>(data: Partial<T>, jwtToken: string): Promise<any> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/apexrest/SDSGatewayApi`;
    
    // Create a new axios instance for this specific request to avoid interceptor conflicts
    const requestConfig = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        'Api-Host': `${this.apiOriginalHost}/D-Link-API/api/v1/DO/${data}`,
        'Api-Method': 'GET',
        'Api-Authorization': `Bearer ${jwtToken}`
      },
    };

    try {
      console.log('url');
      console.log(requestConfig);
      const response = await axios.post(url, {}, requestConfig);
      //console.log('[SF API] DOData successful');
      return response.data;
    } catch (error: any) {
      //console.error('[SF API] DOData error:', error.response?.data || error.message);
      throw error;
    }
  }
  async getWorkOrderAttachment<T = any>(workOrderId: Partial<T>, jwtToken: string): Promise<any> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/apexrest/SDSGatewayApi`;
    
    // Create a new axios instance for this specific request to avoid interceptor conflicts
    const requestConfig = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        'Api-Host': `${this.apiOriginalHost}/D-Link-API/api/v1/WorkOrder/Structured/${workOrderId}`,
        'Api-Method': 'GET',
        'Api-Authorization': `Bearer ${jwtToken}`
      },
    };

    try {
      console.log('url');
      console.log(requestConfig);
      const response = await axios.post(url, {}, requestConfig);
      //console.log('[SF API] DOData successful');
      return response.data;
    } catch (error: any) {
      //console.error('[SF API] DOData error:', error.response?.data || error.message);
      throw error;
    }
  }
  async getWorkOrderAttachmentDownload<T = any>(AttachmentId: Partial<T>, jwtToken: string): Promise<any> {
    await this.ensureAuthenticated();
    
    // Validate environment variables
    if (!this.instanceUrl) {
      throw new Error('Salesforce instance URL not available - authentication may have failed');
    }
    
    if (!this.apiOriginalHost) {
      throw new Error('API original host not configured in environment variables');
    }
    
    const url = `${this.instanceUrl}/services/apexrest/SDSGatewayApi`;
    
    console.log('[SF API] Environment check:');
    console.log('- Instance URL:', this.instanceUrl);
    console.log('- API Original Host:', this.apiOriginalHost);
    console.log('- Access Token present:', !!this.accessToken);
    
    // Use GET method with proper binary response handling
    const requestConfig = {
      timeout: 60000,
      responseType: 'arraybuffer' as const, // This is crucial for binary data
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Api-Host': `${this.apiOriginalHost}/D-Link-API/api/v1/WorkOrder/Download/${AttachmentId}`,
        'Api-Download':'true',
        'Api-Authorization': `Bearer ${jwtToken}`
      },
    };

    try {
      console.log('[SF API] Download request config:');
      console.log({
        url,
        attachmentId: AttachmentId,
        apiHost: requestConfig.headers['Api-Host'],
        method: 'GET',
        responseType: requestConfig.responseType,
        headers: requestConfig.headers
      });
      
      // Use GET method to trigger handleDownloadRequest directly
      const response = await axios.get(url, requestConfig);
      
      console.log('[SF API] Download response received');
      console.log('[SF API] Response status:', response.status);
      console.log('[SF API] Response data type:', typeof response.data);
      console.log('[SF API] Response data is ArrayBuffer:', response.data instanceof ArrayBuffer);
      console.log('[SF API] Response data size:', response.data?.byteLength || response.data?.length || 'N/A');
      console.log('[SF API] Response headers:', response.headers);
      
      if (!response.data) {
        throw new Error('No data received from download API');
      }
      
      // Validate that we received binary data
      if (!(response.data instanceof ArrayBuffer) && !Buffer.isBuffer(response.data)) {
        console.error('[SF API] Expected binary data but received:', typeof response.data);
        throw new Error('Invalid response format - expected binary data');
      }
      
      // Extract filename and content type from headers
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `attachment_${AttachmentId}`;
      
      if (contentDisposition) {
        console.log('[SF API] Content-Disposition header:', contentDisposition);
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['"]/g, '');
          console.log('[SF API] Extracted filename from header:', fileName);
        }
      }
      
      console.log('[SF API] Final content type:', contentType);
      console.log('[SF API] Final filename:', fileName);
      
      // Convert ArrayBuffer to Buffer for consistent handling
      const buffer = response.data instanceof ArrayBuffer 
        ? Buffer.from(response.data)
        : response.data;
      
      console.log('[SF API] Final buffer size:', buffer.length);
      console.log('[SF API] First 16 bytes (hex):', buffer.subarray(0, 16).toString('hex'));
      
      // Validate buffer is not empty
      if (buffer.length === 0) {
        throw new Error('Received empty file data');
      }
      
      return {
        fileContents: buffer,
        contentType: contentType,
        fileDownloadName: fileName
      };
      
    } catch (error: any) {
      console.error('[SF API] File download error:', error.response?.data || error.message);
      console.error('[SF API] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Try to get more details from the error response
      if (error.response?.data) {
        try {
          const errorText = Buffer.isBuffer(error.response.data) 
            ? error.response.data.toString('utf8')
            : error.response.data;
          console.error('[SF API] Error response body:', errorText);
        } catch (parseError) {
          console.error('[SF API] Could not parse error response:', parseError);
        }
      }
      
      // Include more context in the error message
      const statusInfo = error.response?.status ? ` (Status: ${error.response.status})` : '';
      throw new Error(`File download failed: ${error.message}${statusInfo}`);
    }
  }
  async getHandOverDocumentsDownload<T = any>(workOrderId: Partial<T>, jwtToken: string): Promise<any> {
    await this.ensureAuthenticated();
    
    // Validate environment variables
    if (!this.instanceUrl) {
      throw new Error('Salesforce instance URL not available - authentication may have failed');
    }
    
    if (!this.apiOriginalHost) {
      throw new Error('API original host not configured in environment variables');
    }
    
    const url = `${this.instanceUrl}/services/apexrest/SDSGatewayApi`;
    
    console.log('[SF API] Environment check:');
    console.log('- Instance URL:', this.instanceUrl);
    console.log('- API Original Host:', this.apiOriginalHost);
    console.log('- Access Token present:', !!this.accessToken);
    
    // Use GET method with proper binary response handling
    const requestConfig = {
      timeout: 60000,
      responseType: 'arraybuffer' as const, // This is crucial for binary data
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Api-Host': `${this.apiOriginalHost}/D-Link-API/api/v1/WorkOrder/Report/${workOrderId}`,
        'Api-Authorization': `Bearer ${jwtToken}`
      },
    };

    try {
      console.log('[SF API] Download request config:');
      console.log({
        url,
        workOrderId: workOrderId,
        apiHost: requestConfig.headers['Api-Host'],
        method: 'GET',
        responseType: requestConfig.responseType,
        headers: requestConfig.headers
      });
      
      // Use GET method to trigger handleDownloadRequest directly
      const response = await axios.get(url, requestConfig);
      
      console.log('[SF API] Download response received');
      console.log('[SF API] Response status:', response.status);
      console.log('[SF API] Response data type:', typeof response.data);
      console.log('[SF API] Response data is ArrayBuffer:', response.data instanceof ArrayBuffer);
      console.log('[SF API] Response data size:', response.data?.byteLength || response.data?.length || 'N/A');
      console.log('[SF API] Response headers:', response.headers);
      
      if (!response.data) {
        throw new Error('No data received from download API');
      }
      
      // Validate that we received binary data
      if (!(response.data instanceof ArrayBuffer) && !Buffer.isBuffer(response.data)) {
        console.error('[SF API] Expected binary data but received:', typeof response.data);
        throw new Error('Invalid response format - expected binary data');
      }
      
      // Extract filename and content type from headers
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `attachment_${workOrderId}`;
      
      if (contentDisposition) {
        console.log('[SF API] Content-Disposition header:', contentDisposition);
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['"]/g, '');
          console.log('[SF API] Extracted filename from header:', fileName);
        }
      }
      
      console.log('[SF API] Final content type:', contentType);
      console.log('[SF API] Final filename:', fileName);
      
      // Convert ArrayBuffer to Buffer for consistent handling
      const buffer = response.data instanceof ArrayBuffer 
        ? Buffer.from(response.data)
        : response.data;
      
      console.log('[SF API] Final buffer size:', buffer.length);
      console.log('[SF API] First 16 bytes (hex):', buffer.subarray(0, 16).toString('hex'));
      
      // Validate buffer is not empty
      if (buffer.length === 0) {
        throw new Error('Received empty file data');
      }
      
      return {
        fileContents: buffer,
        contentType: contentType,
        fileDownloadName: fileName
      };
      
    } catch (error: any) {
      console.error('[SF API] File download error:', error.response?.data || error.message);
      console.error('[SF API] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Try to get more details from the error response
      if (error.response?.data) {
        try {
          const errorText = Buffer.isBuffer(error.response.data) 
            ? error.response.data.toString('utf8')
            : error.response.data;
          console.error('[SF API] Error response body:', errorText);
        } catch (parseError) {
          console.error('[SF API] Could not parse error response:', parseError);
        }
      }
      
      // Include more context in the error message
      const statusInfo = error.response?.status ? ` (Status: ${error.response.status})` : '';
      throw new Error(`File download failed: ${error.message}${statusInfo}`);
    }
  }
}

// Create singleton instance
export const salesforceDEVAPI = new SalesforceServerDEVAPI();
