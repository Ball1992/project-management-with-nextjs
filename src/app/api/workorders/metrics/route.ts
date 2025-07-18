import { NextRequest, NextResponse } from 'next/server';
import { WorkOrderService } from '../../../../services/WorkOrderService';

export async function GET(request: NextRequest) {
  try {
     const { searchParams } = new URL(request.url);
        
  
    const refKey = searchParams.get('refKey') || '';
    // Get all work orders from Salesforce
    const salesforceResponse = await WorkOrderService.getWorkOrderMetrics(refKey); // Get a large number for metrics

    return NextResponse.json({ success: true, data: salesforceResponse });
  } catch (error: any) {
    console.error('WorkOrder Metrics API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
