// services/WorkOrderService.ts
import { WorkOrderModel, WorkOrderSummary } from '@/types/workorderCustom';
import { WorkOrder, WorkOrderLineItem, SalesforceQueryResponse, QueryParams } from '../types/salesforce';
import { salesforceDEVAPI } from '@/lib/salesforce-server-dev';
import { LoginCredentials, AuthApiResponse } from '@/lib/auth';

export class MemberService {

  static async Login(
    authData: Partial<LoginCredentials>
  ): Promise<any> {
    const data = { ...authData };
    // console.log('Login attempt for:', authData.username);
    return await salesforceDEVAPI.getToken<LoginCredentials>(data);
  }

  static async CreateOrUpdateWorkOrder(
    workOrderData: any,
    jwtToken: string
  ): Promise<any> {
    // console.log('CreateOrUpdateWorkOrder attempt for workOrderId:', workOrderData.workOrderId);
    return await salesforceDEVAPI.createOrUpdateWorkOrder(workOrderData, jwtToken);
  }
  static async UpdateStatusWorkOrder(
    workOrderData: any,
    jwtToken: string
  ): Promise<any> {
    // console.log('CreateOrUpdateWorkOrder attempt for workOrderId:', workOrderData.workOrderId);
    return await salesforceDEVAPI.updateStatusWorkOrder(workOrderData, jwtToken);
  }

   static async GetDOData(
    doNo: string,
    jwtToken: string
  ): Promise<WorkOrderModel[]> {
    console.error('GetDOData attempt for doNo:', doNo);
    return JSON.parse(await salesforceDEVAPI.getDOData(doNo, jwtToken)).data;
  }

  static async GetWorkOrderAttachment(
    workOrderId: string,
    jwtToken: string
  ): Promise<any> {
    console.log('GetWorkOrderAttachment attempt for workOrderId:', workOrderId);
    return JSON.parse(await salesforceDEVAPI.getWorkOrderAttachment(workOrderId, jwtToken));
  }

  static async GetWorkOrderAttachmentDownload(
    attachmentId: string,
    jwtToken: string
  ): Promise<any> {
    console.log('MemberService: GetWorkOrderAttachmentDownload attempt for attachmentId:', attachmentId);
    
    // Validate input parameters
    if (!attachmentId || typeof attachmentId !== 'string') {
      throw new Error('Invalid attachment ID provided');
    }
    
    if (!jwtToken || typeof jwtToken !== 'string') {
      throw new Error('Invalid JWT token provided');
    }
    
    try {
      const result = await salesforceDEVAPI.getWorkOrderAttachmentDownload(attachmentId, jwtToken);
      
      console.log('MemberService: Download result received');
      console.log('MemberService: Result type:', typeof result);
      
      // Validate that we received some data
      if (!result) {
        throw new Error('No data received from Salesforce API');
      }
      
      if (result && typeof result === 'object') {
        console.log('MemberService: Result structure keys:', Object.keys(result));
        
        // Log specific properties if it's a FileContentResult
        if (result.fileContents && result.contentType && result.fileDownloadName) {
          console.log('MemberService: FileContentResult detected');
          console.log('MemberService: - Content Type:', result.contentType);
          console.log('MemberService: - File Name:', result.fileDownloadName);
          console.log('MemberService: - File Contents type:', typeof result.fileContents);
          console.log('MemberService: - File Contents length:', result.fileContents?.length || result.fileContents?.byteLength || 'N/A');
          
          // Validate file contents
          if (!result.fileContents) {
            throw new Error('File contents are empty or missing');
          }
        }
      } else {
        console.log('MemberService: Result length/size:', result?.length || result?.byteLength || 'N/A');
        
        // For direct buffer/array buffer responses, validate size
        if (result?.length === 0 || result?.byteLength === 0) {
          throw new Error('Received empty file data');
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('MemberService: GetWorkOrderAttachmentDownload error:', error.message);
      console.error('MemberService: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Re-throw with more specific error message
      if (error.response?.status === 404) {
        throw new Error(`Attachment not found (ID: ${attachmentId})`);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed - invalid or expired JWT token');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied - insufficient permissions to download attachment');
      } else if (error.response?.status >= 500) {
        throw new Error(`Server error occurred while downloading attachment: ${error.message}`);
      } else {
        throw new Error(`Failed to download attachment: ${error.message}`);
      }
    }
  }
  static async GetHandOverDocumentsDownload(
    workOrderId: string,
    jwtToken: string
  ): Promise<any> {
    console.log('MemberService: GetHandOverDocumentsDownload attempt for attachmentId:', workOrderId);
    
    // Validate input parameters
    if (!workOrderId || typeof workOrderId !== 'string') {
      throw new Error('Invalid attachment ID provided');
    }
    
    if (!jwtToken || typeof jwtToken !== 'string') {
      throw new Error('Invalid JWT token provided');
    }
    
    try {
      const result = await salesforceDEVAPI.getHandOverDocumentsDownload(workOrderId, jwtToken);
      
      console.log('MemberService: Download result received');
      console.log('MemberService: Result type:', typeof result);
      
      // Validate that we received some data
      if (!result) {
        throw new Error('No data received from Salesforce API');
      }
      
      if (result && typeof result === 'object') {
        console.log('MemberService: Result structure keys:', Object.keys(result));
        
        // Log specific properties if it's a FileContentResult
        if (result.fileContents && result.contentType && result.fileDownloadName) {
          console.log('MemberService: FileContentResult detected');
          console.log('MemberService: - Content Type:', result.contentType);
          console.log('MemberService: - File Name:', result.fileDownloadName);
          console.log('MemberService: - File Contents type:', typeof result.fileContents);
          console.log('MemberService: - File Contents length:', result.fileContents?.length || result.fileContents?.byteLength || 'N/A');
          
          // Validate file contents
          if (!result.fileContents) {
            throw new Error('File contents are empty or missing');
          }
        }
      } else {
        console.log('MemberService: Result length/size:', result?.length || result?.byteLength || 'N/A');
        
        // For direct buffer/array buffer responses, validate size
        if (result?.length === 0 || result?.byteLength === 0) {
          throw new Error('Received empty file data');
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('MemberService: GetHandOverDocumentsDownload error:', error.message);
      console.error('MemberService: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Re-throw with more specific error message
      if (error.response?.status === 404) {
        throw new Error(`Attachment not found (ID: ${workOrderId})`);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed - invalid or expired JWT token');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied - insufficient permissions to download attachment');
      } else if (error.response?.status >= 500) {
        throw new Error(`Server error occurred while downloading attachment: ${error.message}`);
      } else {
        throw new Error(`Failed to download attachment: ${error.message}`);
      }
    }
  }
}
