import { NextRequest, NextResponse } from 'next/server';
import { WorkOrderService } from '../../../services/WorkOrderService';
import { transformWorkOrdersToCustom, filterWorkOrdersForUser, transformCustomToWorkOrder } from '../../../helpers/helpersWorkOrders';
import { QueryParams } from '../../../types/salesforce';
import { WorkOrderCustom } from '../../../types/workorderCustom';
import { MemberService } from '@/services/MemberService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryParams: QueryParams = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      orderBy: searchParams.get('orderBy') || 'LastModifiedDate DESC',
      where: searchParams.get('where') || undefined,
      id: searchParams.get('id') || '',
      jwtToken: searchParams.get('jwtToken') || '',
    };

    const userRole = searchParams.get('userRole') || '';
    const refKey = searchParams.get('refKey') || '';
     console.log('queryParams')
    console.log(queryParams)
    // Get work orders from Salesforce
    const salesforceResponse = await WorkOrderService.getWorkOrders(queryParams);
    
    // Transform to custom format
    const transformedWorkOrders = transformWorkOrdersToCustom(salesforceResponse.records);
    
    
    if(queryParams.id!=='' && queryParams.jwtToken !=undefined && transformedWorkOrders[0].doNo!=='N/A'){
       // Get work orders from Salesforce
      const doNo = transformedWorkOrders[0].doNo!=='N/A'? transformedWorkOrders[0].doNo :''
      const salesforceResponseDO = await MemberService.GetDOData(doNo,queryParams.jwtToken);
      
      if(salesforceResponseDO!==undefined && salesforceResponseDO.length>0){
          const [day, month, year] = salesforceResponseDO[0].deliveryDate.split('/').map(Number)
          transformedWorkOrders[0].doDate =new Date(year, month - 1, day)
          transformedWorkOrders[0].doNo =salesforceResponseDO[0].doNum
          transformedWorkOrders[0].landNo =salesforceResponseDO[0].landNo
          transformedWorkOrders[0].models = salesforceResponseDO
        
      }
      
    }

    // Filter based on user role
    const filteredWorkOrders = filterWorkOrdersForUser(transformedWorkOrders, userRole, refKey);

    const response = {
      records: filteredWorkOrders,
      totalSize: filteredWorkOrders.length,
      done: salesforceResponse.done
    };

    return NextResponse.json({ success: true, data: response });
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

export async function POST(request: NextRequest) {
  try {
    const workOrderData = await request.json() as Partial<WorkOrderCustom>;
    
    // Transform custom format back to Salesforce format
    const salesforceData = transformCustomToWorkOrder(workOrderData as WorkOrderCustom);
    
    // Create in Salesforce
    const newWorkOrder = await WorkOrderService.createWorkOrder(salesforceData);
    
    if (newWorkOrder.success) {
      return NextResponse.json({ success: true, data: newWorkOrder }, { status: 201 });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create work order',
          errors: newWorkOrder.errors 
        },
        { status: 400 }
      );
    }
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
