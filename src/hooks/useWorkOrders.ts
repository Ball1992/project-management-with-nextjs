import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api-client';
import { WorkOrderCustom } from '../types/workorderCustom';
import { SalesforceQueryResponse, QueryParams } from '../types/salesforce';

interface UseWorkOrdersReturn {
  workOrders: WorkOrderCustom[];
  loading: boolean;
  error: string | null;
  totalSize: number;
  hasMore: boolean;
  metrics: any;
  fetchWorkOrders: (params?: QueryParams) => Promise<void>;
  createWorkOrder: (data: Partial<WorkOrderCustom>) => Promise<void>;
  updateWorkOrder: (id: string, data: Partial<WorkOrderCustom>) => Promise<void>;
  deleteWorkOrder: (id: string) => Promise<void>;
  refreshWorkOrders: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
}

export const useWorkOrders = (initialParams?: QueryParams): UseWorkOrdersReturn => {
  const [workOrders, setWorkOrders] = useState<WorkOrderCustom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [currentParams, setCurrentParams] = useState<QueryParams>(initialParams || {});

  const fetchWorkOrders = useCallback(async (params: QueryParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...currentParams, ...params };
      setCurrentParams(mergedParams);
      
      const response = await apiClient.get<SalesforceQueryResponse<WorkOrderCustom>>('/workorders', mergedParams);

      if (response.success && response.data) {
        setWorkOrders(response.data.records);
        setTotalSize(response.data.totalSize);
        setHasMore(!response.data.done);
      } else {
        throw new Error(response.error || 'Failed to fetch work orders');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching work orders');
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  const createWorkOrder = useCallback(async (data: Partial<WorkOrderCustom>) => {
    try {
      const response = await apiClient.post('/workorders', data);
      if (response.success) {
        await refreshWorkOrders();
        await fetchMetrics();
      } else {
        throw new Error(response.error || 'Failed to create work order');
      }
    } catch (err: any) {
      throw new Error(err.message || 'An error occurred while creating work order');
    }
  }, []);

  const updateWorkOrder = useCallback(async (id: string, data: Partial<WorkOrderCustom>) => {
    try {
      const response = await apiClient.patch(`/workorders/${id}`, data);
      if (response.success) {
        await refreshWorkOrders();
        await fetchMetrics();
      } else {
        throw new Error(response.error || 'Failed to update work order');
      }
    } catch (err: any) {
      throw new Error(err.message || 'An error occurred while updating work order');
    }
  }, []);

  const deleteWorkOrder = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/workorders/${id}`);
      await refreshWorkOrders();
      await fetchMetrics();
    } catch (err: any) {
      throw new Error(err.message || 'An error occurred while deleting work order');
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await apiClient.get('/workorders/metrics');
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (err: any) {
      // console.error('Failed to fetch metrics:', err.message);
    }
  }, []);

  const refreshWorkOrders = useCallback(async () => {
    await fetchWorkOrders(currentParams);
  }, [fetchWorkOrders, currentParams]);

  useEffect(() => {
    fetchWorkOrders();
    fetchMetrics();
  }, []);

  return {
    workOrders,
    loading,
    error,
    totalSize,
    hasMore,
    metrics,
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    refreshWorkOrders,
    fetchMetrics,
  };
};
