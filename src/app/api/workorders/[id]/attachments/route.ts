import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '../../../../../services/MemberService';

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
    const { searchParams } = new URL(request.url);
    const jwtToken = searchParams.get('jwtToken');

    if (!jwtToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'JWT Token is required' 
        },
        { status: 400 }
      );
    }

    const attachmentData = await MemberService.GetWorkOrderAttachment(id, jwtToken);
    
    return NextResponse.json({ 
      success: true, 
      data: attachmentData.data,
      code: attachmentData.code,
      message: attachmentData.message
    });
  } catch (error: any) {
    console.error('WorkOrder Attachment API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
