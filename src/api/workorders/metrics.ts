// pages/api/workorders/metrics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { WorkOrderService } from '../../services/WorkOrderService';
import { ApiResponse } from '../../types/salesforce';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} Not Allowed` 
    });
  }

 
}