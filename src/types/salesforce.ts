export interface SalesforceAuthResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

export interface SalesforceQueryResponse<T = any> {
  totalSize: number;
  done: boolean;
  records: T[];
  nextRecordsUrl?: string;
}

export interface SalesforceRecord {
  Id: string;
  attributes: {
    type: string;
    url: string;
  };
}

export interface WorkOrder extends SalesforceRecord {
  Id: string;
  WorkOrderNumber: string;
  Status: string;
  Priority: string;
  CreatedDate: string;
  Subject: string;
  Description: string;
  DONumber__c: string;

  // Account lookup fields
  Account: {
    Id: string;
    Name: string;
    ERP_Customer_ID__c?: string;
  };
  
  // Vendor lookup fields
  Vendor_Name__r: {
    Id: string;
    Name: string;
    ERP_Customer_ID__c?: string;
  };
  
  // Service Appointments (related list)
  ServiceAppointments: ServiceAppointmentResult;
}
export interface ServiceAppointmentResult {
  totalSize: number;
  done: boolean;
  records: ServiceAppointment[];
}
export interface ServiceAppointment {
  Id: string;
  AppointmentNumber: string;
  Status: string;
  SchedStartTime?: string;
  SchedEndTime?: string;
  ActualStartTime?: string;
  ActualEndTime?: string;
  ActualDuration?: number;
}
export interface WorkOrderLineItem extends SalesforceRecord {
  WorkOrderId: string;
  WorkOrderLineItemNumber: string;
  Product2Id?: string;
  Description?: string;
  Status: string;
  Priority: string;
  Quantity?: number;
  UnitPrice?: number;
  Discount?: number;
  TotalPrice?: number;
  StartDate?: string;
  EndDate?: string;
  DurationInMinutes?: number;
  DurationType?: string;
  ServiceAppointmentCount?: number;
  StatusCategory?: string;
  // Product lookup
  Product2?: {
    Id: string;
    Name: string;
    ProductCode?: string;
  };
}

export interface SalesforceError {
  message: string;
  errorCode: string;
  fields?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: SalesforceError[];
}

export interface QueryParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  where?: string;
  id?: string;
  jwtToken?: string;
}
export interface DODataParams {
  doNo: string;
  jwtToken: string;
}
