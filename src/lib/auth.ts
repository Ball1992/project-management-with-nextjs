export interface User {
  id: string
  username: string
  role: string
  refKey?: string // For sub contractors to filter their work orders
}

export interface LoginCredentials {
  username: string
  password: string
}

// API Response interfaces to match the actual response structure
export interface AuthApiResponse {
  data: {
    token: string
    refKey: string
    role: string
    expiration: string
    username: string
  }
  code: number
  message: string
}

export interface AuthTokenData {
  token: string
  refKey: string
  role: string
  expiration: string
  username: string
}

// Mock users for demo purposes
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    username: 'subcontractor1',
    password: 'password123',
    role: 'sub_contractor',
    refKey: '0001000402'
  },
  {
    id: '2',
    username: 'admininstall',
    password: 'admin123',
    role: 'admin_install'
  },
  {
    id: '3',
    username: 'admincredit',
    password: 'admin123',
    role: 'admin_credit'
  }
]

export const authenticateUser = async (credentials: LoginCredentials): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const result = await response.json()

    if (result.success && result.data) {
      return result.data.user
    }
    
    return null
  } catch (error) {
    // console.error('Authentication error:', error)
    return null
  }
}

export const generateToken = (user: User): string => {
  // Simple token generation for demo purposes
  return btoa(JSON.stringify({ ...user, timestamp: Date.now() }))
}

// JWT token utilities
export const parseJWTToken = (token: string): any | null => {
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = JSON.parse(atob(paddedPayload));
    
    return decoded;
  } catch (error) {
    // console.error('Error parsing JWT token:', error);
    return null;
  }
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = parseJWTToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    // JWT exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

export const verifyToken = (token: string): User | null => {
  try {
    // For JWT tokens, check if they're expired
    if (token.includes('.')) {
      if (isTokenExpired(token)) {
        return null;
      }
      const decoded = parseJWTToken(token);
      if (decoded && decoded.id) {
        return {
          id: decoded.id,
          username: decoded.username || '',
          role: decoded.role || '',
          refKey: decoded.refKey
        };
      }
      return null;
    }
    
    // Fallback for old token format
    const decoded = JSON.parse(atob(token))
    // Check if token is less than 24 hours old
    if (Date.now() - decoded.timestamp < 24 * 60 * 60 * 1000) {
      const { timestamp, ...user } = decoded
      return user
    }
    return null
  } catch {
    return null
  }
}

export const storeUser = (user: User, token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
  }
}

export const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (userStr && token) {
      const user = JSON.parse(userStr)
      const verifiedUser = verifyToken(token)
      if (verifiedUser) {
        return user
      }
    }
  }
  return null
}

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
}
