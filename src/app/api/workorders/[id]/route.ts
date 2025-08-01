import { NextRequest, NextResponse } from 'next/server';
import { WorkOrderService } from '../../../../services/WorkOrderService';
import { transformWorkOrderToCustom, transformCustomToWorkOrder } from '../../../../helpers/helpersWorkOrders';
import { WorkOrderCustom } from '../../../../types/workorderCustom';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'WorkOrder ID is required' 
      },
      { status: 400 }
    );
  }

  try {
    const salesforceWorkOrder = await WorkOrderService.getWorkOrderById(id);
    const transformedWorkOrder = transformWorkOrderToCustom(salesforceWorkOrder);
    
    return NextResponse.json({ success: true, data: transformedWorkOrder });
  } catch (error: any) {
    // console.error('WorkOrder API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'WorkOrder ID is required' 
      },
      { status: 400 }
    );
  }

  try {
    const updateData = await request.json() as Partial<WorkOrderCustom>;
    
    // Transform custom format back to Salesforce format
    const salesforceData = transformCustomToWorkOrder(updateData as WorkOrderCustom);
    
    // Update in Salesforce
    await WorkOrderService.updateWorkOrder(id, salesforceData);
    
    // Get updated work order and transform back
    const updatedSalesforceWorkOrder = await WorkOrderService.getWorkOrderById(id);
    const transformedWorkOrder = transformWorkOrderToCustom(updatedSalesforceWorkOrder);
    
    return NextResponse.json({ success: true, data: transformedWorkOrder });
  } catch (error: any) {
    // console.error('WorkOrder API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'WorkOrder ID is required' 
      },
      { status: 400 }
    );
  }

  try {
    const updateData = await request.json() as Partial<WorkOrderCustom>;
    
    // Transform custom format back to Salesforce format
    const salesforceData = transformCustomToWorkOrder(updateData as WorkOrderCustom);
    
    // Update in Salesforce
    await WorkOrderService.updateWorkOrder(id, salesforceData);
    
    // Get updated work order and transform back
    const updatedSalesforceWorkOrder = await WorkOrderService.getWorkOrderById(id);
    const transformedWorkOrder = transformWorkOrderToCustom(updatedSalesforceWorkOrder);
    
    return NextResponse.json({ success: true, data: transformedWorkOrder });
  } catch (error: any) {
    // console.error('WorkOrder API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'WorkOrder ID is required' 
      },
      { status: 400 }
    );
  }

  try {
    await WorkOrderService.deleteWorkOrder(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    // console.error('WorkOrder API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
