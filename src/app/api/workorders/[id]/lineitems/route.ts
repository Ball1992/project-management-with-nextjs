import { NextRequest, NextResponse } from 'next/server';
import { WorkOrderService } from '../../../../../services/WorkOrderService';
import { WorkOrderLineItem } from '../../../../../types/salesforce';

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
    const lineItems = await WorkOrderService.getWorkOrderLineItems(id);
    return NextResponse.json({ success: true, data: lineItems });
  } catch (error: any) {
    console.error('WorkOrder LineItem API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const lineItemData = await request.json() as Partial<WorkOrderLineItem>;
    const newLineItem = await WorkOrderService.createWorkOrderLineItem(id, lineItemData);
    
    if (newLineItem.success) {
      return NextResponse.json({ success: true, data: newLineItem }, { status: 201 });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create work order line item',
          errors: newLineItem.errors 
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('WorkOrder LineItem API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
