import { WorkOrderCustom } from '@/types/workorderCustom'

export const mockWorkOrders: WorkOrderCustom[] = [
  {
    id: '1',
    woNo: 'WO-2024-001',
    sub: 'ABC Installation Co.',
    account: 'Customer A Ltd.',
    createdDate: new Date('2024-01-15'),
    landNo: 'LAND001',
    doNo: 'DO-2024-001',
    doDate: new Date('2024-01-20'),
    planStart: new Date('2024-01-25'),
    planFinished: new Date('2024-01-30'),
    actualStart: new Date('2024-01-25'),
    actualFinished: new Date('2024-01-29'),
    models: [
      { id: '1', model: 'Model-X1', serialNo: 'SN001234' },
      { id: '2', model: 'Model-X2', serialNo: 'SN001235' }
    ],
    workReportAttachments: [
      {
        id: '1',
        filename: 'work_report_001.pdf',
        type: 'work_report',
        url: '/uploads/work_report_001.pdf',
        uploadedAt: new Date('2024-01-29')
      }
    ],
    otherAttachments: [],
    handOverDocAttachments: [],
    installationPhotoAttachments: [],
    testRunReportAttachments: [],
    othersAttachments: [],
    remark: 'Installation completed successfully',
    status: 'waiting_install_admin',
    refKey: 'SUB001'
  },
  {
    id: '2',
    woNo: 'WO-2024-002',
    sub: 'ABC Installation Co.',
    account: 'Customer B Corp.',
    createdDate: new Date('2024-01-18'),
    landNo: 'LAND002',
    doNo: 'DO-2024-002',
    doDate: new Date('2024-01-22'),
    planStart: new Date('2024-01-28'),
    planFinished: new Date('2024-02-02'),
    models: [
      { id: '3', model: 'Model-Y1', serialNo: 'SN002001' }
    ],
    workReportAttachments: [],
    otherAttachments: [],
    handOverDocAttachments: [],
    installationPhotoAttachments: [],
    testRunReportAttachments: [],
    othersAttachments: [],
    remark: '',
    status: 'waiting_sub_contractor',
    refKey: 'SUB001'
  },
  {
    id: '3',
    woNo: 'WO-2024-003',
    sub: 'DEF Solutions',
    account: 'Customer C Inc.',
    createdDate: new Date('2024-01-20'),
    landNo: 'LAND003',
    doNo: 'DO-2024-003',
    doDate: new Date('2024-01-25'),
    planStart: new Date('2024-02-01'),
    planFinished: new Date('2024-02-05'),
    actualStart: new Date('2024-02-01'),
    actualFinished: new Date('2024-02-04'),
    models: [
      { id: '4', model: 'Model-Z1', serialNo: 'SN003001' },
      { id: '5', model: 'Model-Z2', serialNo: 'SN003002' },
      { id: '6', model: 'Model-Z3', serialNo: 'SN003003' }
    ],
    workReportAttachments: [
      {
        id: '2',
        filename: 'work_report_003.pdf',
        type: 'work_report',
        url: '/uploads/work_report_003.pdf',
        uploadedAt: new Date('2024-02-04')
      }
    ],
    otherAttachments: [
      {
        id: '3',
        filename: 'additional_docs.pdf',
        type: 'other',
        url: '/uploads/additional_docs.pdf',
        uploadedAt: new Date('2024-02-04')
      }
    ],
    handOverDocAttachments: [],
    installationPhotoAttachments: [],
    testRunReportAttachments: [],
    othersAttachments: [],
    remark: 'Complex installation with multiple units',
    status: 'waiting_credit_admin',
    installStaff: 'John Smith',
    refKey: 'SUB002'
  },
  {
    id: '4',
    woNo: 'WO-2024-004',
    sub: 'DEF Solutions',
    account: 'Customer D Ltd.',
    createdDate: new Date('2024-01-22'),
    landNo: 'LAND004',
    doNo: 'DO-2024-004',
    doDate: new Date('2024-01-27'),
    planStart: new Date('2024-02-03'),
    planFinished: new Date('2024-02-08'),
    models: [
      { id: '7', model: 'Model-A1', serialNo: 'SN004001' }
    ],
    workReportAttachments: [],
    otherAttachments: [],
    handOverDocAttachments: [],
    installationPhotoAttachments: [],
    testRunReportAttachments: [],
    othersAttachments: [],
    remark: '',
    status: 'waiting_sub_contractor',
    refKey: 'SUB002'
  }
]

export const getWorkOrdersForUser = (userRole: string, refKey?: string): WorkOrderCustom[] => {
  if (userRole === 'sub_contractor' && refKey) {
    return mockWorkOrders.filter(wo => wo.refKey === refKey)
  }
  return mockWorkOrders
}

export const getWorkOrderById = (id: string): WorkOrderCustom | undefined => {
  return mockWorkOrders.find(wo => wo.id === id)
}

export const updateWorkOrder = (id: string, updates: Partial<WorkOrderCustom>): WorkOrderCustom | null => {
  const index = mockWorkOrders.findIndex(wo => wo.id === id)
  if (index !== -1) {
    mockWorkOrders[index] = { ...mockWorkOrders[index], ...updates }
    return mockWorkOrders[index]
  }
  return null
}
