import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '../../../../services/MemberService';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { workOrderData, token } = requestData;
    
    // Validate input
    if (!workOrderData || !token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'WorkOrder data and token are required' 
        },
        { status: 400 }
      );
    }

    // Validate required fields for work order updates
    if (workOrderData.workOrderId) {
      // Check if actualStart and actualFinished are provided
      if (!workOrderData.actualStart || !workOrderData.actualFinished) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'กรุณากรอกวันที่เริ่มงานจริง (Actual Start) และวันที่เสร็จงานจริง (Actual Finished)' 
          },
          { status: 400 }
        );
      }

      // Validate that actualFinished is not before actualStart
      const actualStart = new Date(workOrderData.actualStart);
      const actualFinished = new Date(workOrderData.actualFinished);
      
      if (actualFinished < actualStart) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'วันที่เสร็จงานจริงต้องไม่เป็นวันก่อนวันที่เริ่มงานจริง' 
          },
          { status: 400 }
        );
      }
    }

    // Call the service to create or update work order
    const response = JSON.parse(await MemberService.CreateOrUpdateWorkOrder(workOrderData, token));
    
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
