// services/WorkOrderService.ts
import { WorkOrderSummary } from '@/types/workorderCustom';
import { salesforceAPI } from '../lib/salesforce-server';
import { WorkOrder, WorkOrderLineItem, SalesforceQueryResponse, QueryParams } from '../types/salesforce';

export class WorkOrderService {
  static async getWorkOrders(params: QueryParams = {}): Promise<SalesforceQueryResponse<WorkOrder>> {
    const { limit = 20, offset = 0, orderBy = 'LastModifiedDate DESC', where } = params;
    
    let query = `
      SELECT Id
      , WorkOrderNumber
      , Status
      , Priority
      , Account.Id
      , Account.Name
      , Subject
      , Description
      , DONumber__c
      , Account.ERP_Customer_ID__c
      , CreatedDate
      , Vendor_Name__r.Id, Vendor_Name__r.Name
      , Vendor_Name__r.ERP_Customer_ID__c
      , (SELECT Id, AppointmentNumber, Status, SchedStartTime, SchedEndTime, ActualStartTime, ActualEndTime, ActualDuration
        FROM ServiceAppointments
        WHERE SchedStartTime != null AND SchedEndTime != null
        ORDER BY SchedStartTime ASC) 
      FROM WorkOrder
    `;
    
    if (where) {
      query += ` WHERE Id IN (
    SELECT ParentRecordId
    FROM ServiceAppointment
    WHERE SchedStartTime != null AND SchedEndTime != null
) AND Category__c='Installation' AND  Vendor_Name__r.ERP_Customer_ID__c!=''  ${where}`;
    }else{
      query += ` WHERE Id IN (
    SELECT ParentRecordId
    FROM ServiceAppointment
    WHERE SchedStartTime != null AND SchedEndTime != null
) AND Category__c='Installation' AND  Vendor_Name__r.ERP_Customer_ID__c!=''  `;
    }
    


    query += ` ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
      console.log('query123')
     console.log(query)

    return await salesforceAPI.query<WorkOrder>(query);
  }

  static async getWorkOrderById(id: string): Promise<WorkOrder> {
    const fields = [
      'Id', 'WorkOrderNumber', 'AccountId', 'ContactId', 'Subject', 'Description',
      'Status', 'Priority', 'CreatedDate', 'LastModifiedDate', 'StartDate', 'EndDate',
      'Duration', 'DurationType', 'WorkTypeId', 'ServiceTerritoryId',
      'OwnerId', 'AssetId', 'LocationId', 'TotalPrice', 'Discount', 'Tax', 'GrandTotal',
      'IsClosed', 'IsDeleted', 'StatusCategory', 'LineItemCount'
    ];
    
    return await salesforceAPI.getRecord<WorkOrder>('WorkOrder', id, fields);
  }

  static async createWorkOrder(workOrderData: Partial<WorkOrder>): Promise<{ id: string; success: boolean; errors: any[] }> {
    return await salesforceAPI.createRecord<WorkOrder>('WorkOrder', workOrderData);
  }

  static async updateWorkOrder(id: string, workOrderData: Partial<WorkOrder>): Promise<void> {
    return await salesforceAPI.updateRecord<WorkOrder>('WorkOrder', id, workOrderData);
  }

  static async deleteWorkOrder(id: string): Promise<void> {
    return await salesforceAPI.deleteRecord('WorkOrder', id);
  }

  static async getWorkOrdersByStatus(status: string): Promise<SalesforceQueryResponse<WorkOrder>> {
    const query = `
      SELECT Id, WorkOrderNumber, Subject, Status, Priority,
             Account.Name, Contact.Name
      FROM WorkOrder
      WHERE Status = '${status}'
      ORDER BY LastModifiedDate DESC
    `;
    
    return await salesforceAPI.query<WorkOrder>(query);
  }

  static async getWorkOrdersByPriority(priority: string): Promise<SalesforceQueryResponse<WorkOrder>> {
    const query = `
      SELECT Id, WorkOrderNumber, Subject, Status, Priority,
             Account.Name, Contact.Name
      FROM WorkOrder
      WHERE Priority = '${priority}'
      ORDER BY LastModifiedDate DESC
    `;
    
    return await salesforceAPI.query<WorkOrder>(query);
  }

  static async getWorkOrderLineItems(workOrderId: string): Promise<SalesforceQueryResponse<WorkOrderLineItem>> {
    const query = `
      SELECT Id, WorkOrderLineItemNumber, WorkOrderId, Product2Id, Description,
             Status, Priority, Quantity, UnitPrice, Discount, TotalPrice,
             StartDate, EndDate, DurationInMinutes, DurationType,
             Product2.Name, Product2.ProductCode
      FROM WorkOrderLineItem
      WHERE WorkOrderId = '${workOrderId}'
      ORDER BY WorkOrderLineItemNumber
    `;
    
    return await salesforceAPI.query<WorkOrderLineItem>(query);
  }

  static async createWorkOrderLineItem(
    workOrderId: string, 
    lineItemData: Partial<WorkOrderLineItem>
  ): Promise<{ id: string; success: boolean; errors: any[] }> {
    const data = { ...lineItemData, WorkOrderId: workOrderId };
    return await salesforceAPI.createRecord<WorkOrderLineItem>('WorkOrderLineItem', data);
  }

  static async updateWorkOrderLineItem(
    id: string, 
    lineItemData: Partial<WorkOrderLineItem>
  ): Promise<void> {
    return await salesforceAPI.updateRecord<WorkOrderLineItem>('WorkOrderLineItem', id, lineItemData);
  }

  static async deleteWorkOrderLineItem(id: string): Promise<void> {
    return await salesforceAPI.deleteRecord('WorkOrderLineItem', id);
  }

  static async searchWorkOrders(searchTerm: string): Promise<SalesforceQueryResponse<WorkOrder>> {
    const query = `
      SELECT Id
      , WorkOrderNumber
      , Status
      , Subject
      , Description
      , Priority
      , Account.Id
      , Account.Name
      , Account.ERP_Customer_ID__c
      , Vendor_Name__r.Id, Vendor_Name__r.Name
      , Vendor_Name__r.ERP_Customer_ID__c
      , CreatedDate
        , (SELECT Id, AppointmentNumber, Status, SchedStartTime, SchedEndTime, ActualStartTime, ActualEndTime, ActualDuration
        FROM ServiceAppointments
        WHERE SchedStartTime != null AND SchedEndTime != null
        ORDER BY SchedStartTime ASC) 
      FROM WorkOrder
      ORDER BY LastModifiedDate DESC
      LIMIT 50
    `;
    
    return await salesforceAPI.query<WorkOrder>(query);
  }

  static async getWorkOrderMetrics(refKey: string, userRole?: string): Promise<any> {
    // Build refKey filter condition - skip for admin roles
    let refKeyCondition = '';
    if (userRole !== 'admin_install' && userRole !== 'admin_credit') {
      refKeyCondition = ` AND ( Vendor_Name__r.ERP_Customer_ID__c='${refKey}' or Vendor_Name__r.ERP_Customer_ID__c='000${refKey}' )`;
    }

    const queries = [
      // Total
      `SELECT COUNT() FROM WorkOrder WHERE Id IN (
    SELECT ParentRecordId
    FROM ServiceAppointment
    WHERE SchedStartTime != null AND SchedEndTime != null
) AND Category__c='Installation' AND (Status='Reception'  OR Status='Done (Operation)' OR  Status='Closed' ) AND  Vendor_Name__r.ERP_Customer_ID__c!=''  ${refKeyCondition}`,
      // Waiting Install
      `SELECT COUNT() FROM WorkOrder WHERE Id IN (
    SELECT ParentRecordId
    FROM ServiceAppointment
    WHERE SchedStartTime != null AND SchedEndTime != null
) AND Category__c='Installation' AND  Vendor_Name__r.ERP_Customer_ID__c!='' ${refKeyCondition} AND (Status='Reception')`,
      // Completed
      `SELECT COUNT() FROM WorkOrder WHERE Id IN (
    SELECT ParentRecordId
    FROM ServiceAppointment
    WHERE SchedStartTime != null AND SchedEndTime != null
) AND Category__c='Installation' AND  Vendor_Name__r.ERP_Customer_ID__c!='' ${refKeyCondition} AND Status='Done (Operation)'`,
      // Credit Review
      `SELECT COUNT() FROM WorkOrder WHERE Id IN (
    SELECT ParentRecordId
    FROM ServiceAppointment
    WHERE SchedStartTime != null AND SchedEndTime != null
) AND Category__c='Installation' AND  Vendor_Name__r.ERP_Customer_ID__c!='' ${refKeyCondition} AND Status='Closed' AND IsCreditHandoverReceived__c = false  `
    ];

    const results = await Promise.all(
      queries.map(query => salesforceAPI.query(query))
    );

    return {
      total: results[0].totalSize,
      totalWaitingInstall: results[1].totalSize,
      totalInstallationComplete: results[2].totalSize,
      totalWaitingCreditAdmin: results[3].totalSize
    } as WorkOrderSummary;
  }
}
