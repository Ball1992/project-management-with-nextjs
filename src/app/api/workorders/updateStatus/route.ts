import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '../../../../services/MemberService';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { workOrderData, token } = requestData;
    


    // Call the service to create or update work order
    const response = JSON.parse(await MemberService.UpdateStatusWorkOrder(workOrderData, token));
    
    if (response) {
      return NextResponse.json({ 
        success: true, 
        data: response
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create or update work order'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // console.error('WorkOrder CreateOrUpdate API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create or update work order' 
      },
      { status: 500 }
    );
  }
}
