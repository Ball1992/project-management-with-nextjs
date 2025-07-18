// lib/salesforce-server.ts
import { SalesforceAuthResponse, SalesforceQueryResponse } from '@/types/salesforce';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class SalesforceServerAPI {
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

  constructor() {
    this.baseUrl = process.env.SALESFORCE_INSTANCE_URL!;
    this.apiVersion = 'v61.0';
    this.clientId = process.env.SALESFORCE_CLIENT_ID!;
    this.clientSecret = process.env.SALESFORCE_CLIENT_SECRET!;
    this.username = process.env.SALESFORCE_USERNAME!;
    this.password = process.env.SALESFORCE_PASSWORD!;
    this.securityToken = process.env.SALESFORCE_SECURITY_TOKEN!;

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
        console.log(`[SF API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[SF API] Request error:', error);
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
            console.error('[SF API] Re-authentication failed:', authError);
            return Promise.reject(authError);
          }
        }

        console.error('[SF API] Response error:', error.response?.data || error.message);
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

      console.log('[SF API] Authentication successful');
      return response.data;
    } catch (error: any) {
      console.error('[SF API] Authentication error:', error.response?.data || error.message);
      throw new Error(`Authentication failed: ${error.response?.status || error.message}`);
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate();
    }
  }

  async query<T = any>(soql: string): Promise<SalesforceQueryResponse<T>> {
    await this.ensureAuthenticated();
    const encodedQuery = encodeURIComponent(soql);
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/query?q=${encodedQuery}`;
    console.log(url)
    const response = await this.axiosInstance.get<SalesforceQueryResponse<T>>(url);
    return response.data;
  }

  async queryMore<T = any>(nextRecordsUrl: string): Promise<SalesforceQueryResponse<T>> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}${nextRecordsUrl}`;
    
    const response = await this.axiosInstance.get<SalesforceQueryResponse<T>>(url);
    return response.data;
  }

  async getRecord<T = any>(objectName: string, recordId: string, fields?: string[]): Promise<T> {
    await this.ensureAuthenticated();
    let url = `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/${objectName}/${recordId}`;
    
    if (fields && fields.length > 0) {
      url += `?fields=${fields.join(',')}`;
    }
    
    const response = await this.axiosInstance.get<T>(url);
    return response.data;
  }

  async createRecord<T = any>(objectName: string, data: Partial<T>): Promise<{ id: string; success: boolean; errors: any[] }> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/${objectName}`;
    
    const response = await this.axiosInstance.post(url, data);
    return response.data;
  }

  async updateRecord<T = any>(objectName: string, recordId: string, data: Partial<T>): Promise<void> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/${objectName}/${recordId}`;
    
    await this.axiosInstance.patch(url, data);
  }

  async deleteRecord(objectName: string, recordId: string): Promise<void> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/${objectName}/${recordId}`;
    
    await this.axiosInstance.delete(url);
  }

  async upsertRecord<T = any>(
    objectName: string, 
    externalIdField: string, 
    externalId: string, 
    data: Partial<T>
  ): Promise<{ id: string; created: boolean }> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/${objectName}/${externalIdField}/${externalId}`;
    
    const response = await this.axiosInstance.patch(url, data);
    return response.data;
  }

  async getObjectMetadata(objectName: string): Promise<any> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/${objectName}/describe`;
    
    const response = await this.axiosInstance.get(url);
    return response.data;
  }

  async getAllObjects(): Promise<any> {
    await this.ensureAuthenticated();
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects`;
    
    const response = await this.axiosInstance.get(url);
    return response.data;
  }
}

// Create singleton instance
export const salesforceAPI = new SalesforceServerAPI();