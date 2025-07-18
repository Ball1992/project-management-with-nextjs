import { WorkOrder } from '@/types/salesforce';
import { WorkOrderCustom, WorkOrderModel, WorkOrderAttachment } from '@/types/workorderCustom';

/**
 * Transform Salesforce WorkOrder to WorkOrderCustom format
 */
export function transformWorkOrderToCustom(salesforceWorkOrder: WorkOrder): WorkOrderCustom {
  // Map Salesforce status to custom status
  const mapStatus = (sfStatus: string): WorkOrderCustom['status'] => {
    switch (sfStatus?.toLowerCase()) {
      case 'new':
      case 'open':
        return 'waiting_sub_contractor';
      case 'in progress':
      case 'working':
        return 'waiting_install_admin';
      case 'completed':
      case 'closed':
        return 'waiting_credit_admin';
      default:
        return 'waiting_sub_contractor';
    }
  };

  // Create models array from Salesforce data
  const models: WorkOrderModel[] = [
    {
      id: salesforceWorkOrder.Id,
      model: salesforceWorkOrder.WorkOrderNumber || 'N/A',
      serialNo: salesforceWorkOrder.WorkOrderNumber || 'N/A'
    }
  ];

  // Create empty attachment arrays (these would be populated from SF attachments if available)
  const emptyAttachments: WorkOrderAttachment[] = [];

  // Get dates from ServiceAppointments if available
  const firstAppointment = salesforceWorkOrder.ServiceAppointments?.[0];
  const planStart = firstAppointment?.SchedStartTime ? new Date(firstAppointment.SchedStartTime) : new Date();
  const planFinished = firstAppointment?.SchedEndTime ? new Date(firstAppointment.SchedEndTime) : new Date();
  const actualStart = firstAppointment?.ActualStartTime ? new Date(firstAppointment.ActualStartTime) : undefined;
  const actualFinished = firstAppointment?.ActualEndTime ? new Date(firstAppointment.ActualEndTime) : undefined;

  const workOrderCustom: WorkOrderCustom = {
    id: salesforceWorkOrder.Id,
    woNo: salesforceWorkOrder.WorkOrderNumber,
    sub: salesforceWorkOrder.Vendor_Name__r?.ERP_Customer_ID__c || 'N/A',
    account: salesforceWorkOrder.Account?.Name || 'N/A',
    createdDate: new Date(salesforceWorkOrder.CreatedDate),
    landNo: salesforceWorkOrder.Id.slice(-6), // Generate from ID as placeholder
    doNo: `DO-${salesforceWorkOrder.WorkOrderNumber}`,
    doDate: new Date(salesforceWorkOrder.CreatedDate),
    planStart,
    planFinished,
    actualStart,
    actualFinished,
    models,
    workReportAttachments: emptyAttachments,
    otherAttachments: emptyAttachments,
    handOverDocAttachments: emptyAttachments,
    installationPhotoAttachments: emptyAttachments,
    testRunReportAttachments: emptyAttachments,
    othersAttachments: emptyAttachments,
    remark: '', // No description field in current SF structure
    status: mapStatus(salesforceWorkOrder.Status),
    installStaff: undefined, // Would need custom field in SF
    creditStaff: undefined, // Would need custom field in SF
    refKey: salesforceWorkOrder.Vendor_Name__r?.ERP_Customer_ID__c || salesforceWorkOrder.Account?.ERP_Customer_ID__c || salesforceWorkOrder.Id.slice(-6)
  };

  return workOrderCustom;
}

/**
 * Transform array of Salesforce WorkOrders to WorkOrderCustom format
 */
export function transformWorkOrdersToCustom(salesforceWorkOrders: WorkOrder[]): WorkOrderCustom[] {
  return salesforceWorkOrders.map(transformWorkOrderToCustom);
}

/**
 * Transform WorkOrderCustom back to Salesforce WorkOrder format for updates
 */
export function transformCustomToWorkOrder(customWorkOrder: WorkOrderCustom): Partial<WorkOrder> {
  // Map custom status back to Salesforce status
  const mapStatusToSF = (customStatus: WorkOrderCustom['status']): string => {
    switch (customStatus) {
      case 'waiting_sub_contractor':
        return 'New';
      case 'waiting_install_admin':
        return 'In Progress';
      case 'waiting_credit_admin':
        return 'Completed';
      default:
        return 'New';
    }
  };

  const salesforceWorkOrder: Partial<WorkOrder> = {
    Id: customWorkOrder.id,
    WorkOrderNumber: customWorkOrder.woNo,
    Status: mapStatusToSF(customWorkOrder.status),
    Priority: 'Medium', // Default priority
    CreatedDate: customWorkOrder.createdDate.toISOString(),
    // Note: Other fields like Account and Vendor_Name__r are lookup fields
    // and would need to be handled differently in a real Salesforce update
  };

  return salesforceWorkOrder;
}

/**
 * Get metrics from WorkOrderCustom array
 */
export function getWorkOrderMetrics(workOrders: WorkOrderCustom[]) {
  return {
    total: workOrders.length,
    waiting_sub_contractor: workOrders.filter(wo => wo.status === 'waiting_sub_contractor').length,
    waiting_install_admin: workOrders.filter(wo => wo.status === 'waiting_install_admin').length,
    waiting_credit_admin: workOrders.filter(wo => wo.status === 'waiting_credit_admin').length
  };
}

/**
 * Filter work orders for specific user role
 */
export function filterWorkOrdersForUser(
  workOrders: WorkOrderCustom[], 
  userRole: string, 
  refKey?: string
): WorkOrderCustom[] {
  if (userRole === 'sub_contractor' && refKey) {
    return workOrders.filter(wo => wo.refKey === refKey);
  }
  return workOrders;
}

/**
 * Deserialize WorkOrderCustom from API response (convert string dates to Date objects)
 */
export function deserializeWorkOrderCustom(data: any): WorkOrderCustom {
  return {
    ...data,
    createdDate: new Date(data.createdDate),
    doDate: new Date(data.doDate),
    planStart: new Date(data.planStart),
    planFinished: new Date(data.planFinished),
    actualStart: data.actualStart ? new Date(data.actualStart) : undefined,
    actualFinished: data.actualFinished ? new Date(data.actualFinished) : undefined,
    workReportAttachments: data.workReportAttachments?.map((att: any) => ({
      ...att,
      uploadedAt: new Date(att.uploadedAt)
    })) || [],
    otherAttachments: data.otherAttachments?.map((att: any) => ({
      ...att,
      uploadedAt: new Date(att.uploadedAt)
    })) || [],
    handOverDocAttachments: data.handOverDocAttachments?.map((att: any) => ({
      ...att,
      uploadedAt: new Date(att.uploadedAt)
    })) || [],
    installationPhotoAttachments: data.installationPhotoAttachments?.map((att: any) => ({
      ...att,
      uploadedAt: new Date(att.uploadedAt)
    })) || [],
    testRunReportAttachments: data.testRunReportAttachments?.map((att: any) => ({
      ...att,
      uploadedAt: new Date(att.uploadedAt)
    })) || [],
    othersAttachments: data.othersAttachments?.map((att: any) => ({
      ...att,
      uploadedAt: new Date(att.uploadedAt)
    })) || []
  };
}

/**
 * Deserialize array of WorkOrderCustom from API response
 */
export function deserializeWorkOrdersCustom(dataArray: any[]): WorkOrderCustom[] {
  return dataArray.map(deserializeWorkOrderCustom);
}
