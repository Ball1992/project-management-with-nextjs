import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '../../../services/MemberService';
import { LoginCredentials, generateToken, type User } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const credentials: LoginCredentials = await request.json();
    
    // Validate input
    if (!credentials.username || !credentials.password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Username and password are required' 
        },
        { status: 400 }
      );
    }

    // Call the API to get token
    const authResponse =JSON.parse( await MemberService.Login(credentials));
    
  
    // Check if the response has the expected structure
    // Handle both nested (authResponse.data.token) and direct (authResponse.token) structures
    let tokenData = null;
    
    if (authResponse && authResponse.data && authResponse.data.token) {
      // Nested structure: { data: { token, role, etc }, code, message }
      tokenData = authResponse.data;
    } else if (authResponse && authResponse.token) {
      // Direct structure: { token, role, refKey, etc }
      tokenData = authResponse;
    }
    
    if (tokenData && tokenData.token) {
      // Create user object based on API response
      const user: User = {
        id: tokenData.username || credentials.username,
        username: tokenData.username || credentials.username,
        role: tokenData.role,
        refKey: tokenData.refKey
      };

      // Use the JWT token from the API response
      const token = tokenData.token;

      return NextResponse.json({ 
        success: true, 
        data: {
          user,
          token,
          expiration: tokenData.expiration
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: authResponse?.message || 'Invalid username or password',
          code: authResponse?.code || -1,
          debug: {
            hasAuthResponse: !!authResponse,
            hasData: !!(authResponse && authResponse.data),
            hasToken: !!(authResponse && authResponse.token),
            hasDataToken: !!(authResponse && authResponse.data && authResponse.data.token)
          }
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    // console.error('Auth API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Authentication failed' 
      },
      { status: 500 }
    );
  }
}
