import { WorkOrderCustom } from '@/types/workorderCustom'

export const mockWorkOrders: WorkOrderCustom[] = []

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
