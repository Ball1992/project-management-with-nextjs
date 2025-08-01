import { NextRequest, NextResponse } from 'next/server';
import { WorkOrderService } from '../../../../services/WorkOrderService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
        
    const refKey = searchParams.get('refKey') || '';
    const userRole = searchParams.get('userRole') || '';
    
    // Get all work orders from Salesforce
    const salesforceResponse = await WorkOrderService.getWorkOrderMetrics(refKey, userRole);

    return NextResponse.json({ success: true, data: salesforceResponse });
  } catch (error: any) {
    // console.error('WorkOrder Metrics API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
