export interface User {
  id: string
  username: string
  role: 'sub_contractor' | 'admin_install' | 'admin_credit'
  refKey?: string // For sub contractors to filter their work orders
}

export interface LoginCredentials {
  username: string
  password: string
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
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const user = mockUsers.find(u => u.username === credentials.username && u.password === credentials.password)
  if (user) {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  return null
}

export const generateToken = (user: User): string => {
  // Simple token generation for demo purposes
  return btoa(JSON.stringify({ ...user, timestamp: Date.now() }))
}

export const verifyToken = (token: string): User | null => {
  try {
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
