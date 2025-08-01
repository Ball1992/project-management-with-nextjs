# API Response Data Mapping

## Original API Response Structure

The authentication API returns the following response structure:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQiLCJuYmYiOjE3NTMwNzk2OTksImV4cCI6MTc1MzE2NjA5OSwiaWF0IjoxNzUzMDc5Njk5fQ.MVPZRRlrJdY8flO86Yjqh9oQ3tHrUQwS4e3Iz7Ck0aQ",
    "refKey": "1000105",
    "role": "sub_contractor",
    "expiration": "7/22/2025 1:34:59 PM",
    "username": "daikin_torpun@hotmail.com"
  },
  "code": 0,
  "message": "success"
}
```

## JWT Token Payload

The JWT token contains the following decoded payload:

```json
{
  "id": "4",
  "nbf": 1753079699,
  "exp": 1753166099,
  "iat": 1753079699
}
```

Where:
- `id`: User ID
- `nbf`: Not Before timestamp (Unix timestamp)
- `exp`: Expiration timestamp (Unix timestamp)
- `iat`: Issued At timestamp (Unix timestamp)

## Data Flow Mapping

### 1. API Response → TypeScript Interfaces

**AuthApiResponse Interface:**
```typescript
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
```

**AuthTokenData Interface:**
```typescript
export interface AuthTokenData {
  token: string
  refKey: string
  role: string
  expiration: string
  username: string
}
```

### 2. API Response → User Object

The API response is mapped to the internal User interface:

```typescript
export interface User {
  id: string        // From JWT token payload.id
  username: string  // From response.data.username
  role: string      // From response.data.role
  refKey?: string   // From response.data.refKey
}
```

**Mapping Logic:**
```typescript
const user: User = {
  id: authResponse.data.username || credentials.username,
  username: authResponse.data.username || credentials.username,
  role: authResponse.data.role,
  refKey: authResponse.data.refKey
};
```

### 3. Client Response Structure

The API endpoint returns this structure to the client:

```typescript
{
  success: true,
  data: {
    user: User,           // Mapped user object
    token: string,        // JWT token from API
    expiration: string    // Expiration date from API
  }
}
```

## JWT Token Handling

### Token Parsing
- **Function:** `parseJWTToken(token: string)`
- **Purpose:** Extracts payload from JWT token
- **Returns:** Decoded payload object or null

### Token Validation
- **Function:** `isTokenExpired(token: string)`
- **Purpose:** Checks if JWT token is expired
- **Logic:** Compares `exp` claim with current timestamp

### Token Verification
- **Function:** `verifyToken(token: string)`
- **Purpose:** Validates token and extracts user data
- **Returns:** User object or null

## Storage Strategy

### Local Storage
- **User Data:** `localStorage.setItem('user', JSON.stringify(user))`
- **Token:** `localStorage.setItem('token', token)`

### Retrieval and Validation
```typescript
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  
  if (userStr && token) {
    const user = JSON.parse(userStr)
    const verifiedUser = verifyToken(token)
    if (verifiedUser) {
      return user
    }
  }
  return null
}
```

## Error Handling

### Success Response (code: 0)
- Token is valid and user is authenticated
- User object is created and stored
- JWT token is stored for future requests

### Error Response (code: != 0)
```typescript
{
  success: false,
  error: authResponse?.message || 'Invalid username or password',
  code: authResponse?.code || -1
}
```

## Security Considerations

1. **JWT Token Expiration:** Automatically validated using `exp` claim
2. **Token Storage:** Stored in localStorage (consider httpOnly cookies for production)
3. **Token Validation:** Verified on each request using `verifyToken()`
4. **Automatic Cleanup:** Invalid/expired tokens are removed from storage

## Usage Examples

### Authentication Flow
```typescript
// 1. User submits credentials
const credentials = { username: 'user@example.com', password: 'password' }

// 2. API call returns mapped response
const response = await fetch('/api/auth', {
  method: 'POST',
  body: JSON.stringify(credentials)
})

// 3. Client receives structured response
const result = await response.json()
// result.data.user contains mapped User object
// result.data.token contains JWT token
// result.data.expiration contains expiration date
```

### Token Validation
```typescript
// Check if stored token is valid
const storedUser = getStoredUser()
if (storedUser) {
  // User is authenticated and token is valid
  // console.log('User:', storedUser)
} else {
  // Redirect to login
}
```

## File Locations

- **Types:** `src/lib/auth.ts`
- **API Endpoint:** `src/app/api/auth/route.ts`
- **Service Layer:** `src/services/MemberService.ts`
- **Salesforce Integration:** `src/lib/salesforce-server-dev.ts`
