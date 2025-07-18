export interface WorkOrderModel {
  id: string
  model: string
  serialNo: string
}

export interface WorkOrderAttachment {
  id: string
  filename: string
  type: 'work_report' | 'other' | 'hand_over_doc' | 'installation_photo' | 'test_run_report' | 'others'
  url: string
  uploadedAt: Date
  size?: number
  base64?: string
}

export interface WorkOrderCustom {
  id: string
  woNo: string
  sub: string // vendor
  account: string // customer
  createdDate: Date
  landNo: string
  doNo: string // Delivery Order Number
  doDate: Date
  planStart: Date
  planFinished: Date
  actualStart?: Date
  actualFinished?: Date
  models: WorkOrderModel[]
  workReportAttachments: WorkOrderAttachment[]
  otherAttachments: WorkOrderAttachment[]
  handOverDocAttachments: WorkOrderAttachment[]
  installationPhotoAttachments: WorkOrderAttachment[]
  testRunReportAttachments: WorkOrderAttachment[]
  othersAttachments: WorkOrderAttachment[]
  remark: string
  status: 'waiting_sub_contractor' | 'waiting_install_admin' | 'waiting_credit_admin'
  installStaff?: string // status confirm
  creditStaff?: string // status document
  refKey: string // For filtering by sub contractor
}

export type WorkOrderStatus = WorkOrderCustom['status']

export const getStatusLabel = (status: WorkOrderStatus): string => {
  switch (status) {
    case 'waiting_sub_contractor':
      return 'Waiting Install'
    case 'waiting_install_admin':
      return 'Installation Complete'
    case 'waiting_credit_admin':
      return 'Waiting Credit Admin'
    default:
      return status
  }
}

export const getStatusColor = (status: WorkOrderStatus): 'warning' | 'info' | 'success' => {
  switch (status) {
    case 'waiting_sub_contractor':
      return 'warning'
    case 'waiting_install_admin':
      return 'info'
    case 'waiting_credit_admin':
      return 'success'
    default:
      return 'info'
  }
}

export interface WorkOrderSummary {
  total: number
  totalWaitingInstall: number // vendor
  totalInstallationComplete: number // vendor
  totalWaitingCreditAdmin: number // vendor

}
