import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

// Default rate limit configurations for different endpoints
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  '/api/v1/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'พยายามล็อกอินมากเกินไป กรุณาลองใหม่ภายหลัง'
  },
  '/api/v1/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour
    message: 'พยายามสมัครสมาชิกมากเกินไป กรุณาลองใหม่ภายหลัง'
  },
  '/api/v1/auth/refresh': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 refresh attempts per 5 minutes
    message: 'พยายามรีเฟรช token มากเกินไป กรุณาลองใหม่ภายหลัง'
  },
  'default': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes for general API
    message: 'คำขอมากเกินไป กรุณาลองใหม่ภายหลัง'
  }
};

// Clean up expired entries
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Get client identifier (IP + User-Agent for better uniqueness)
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.substring(0, 50)}`; // Limit user-agent length
}

// Rate limiting middleware
export function rateLimit(request: NextRequest): NextResponse | null {
  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  const pathname = request.nextUrl.pathname;
  
  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // Get rate limit config for this endpoint
  const config = rateLimitConfigs[pathname] || rateLimitConfigs['default'];
  
  const clientId = getClientId(request);
  const key = `${pathname}:${clientId}`;
  const now = Date.now();

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupExpiredEntries();
  }

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
    return null; // Allow request
  }

  // Increment counter
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);
    
    return new NextResponse(
      JSON.stringify({
        responseStatus: 429,
        responseMessage: config.message || 'Too Many Requests',
        data: null,
        retryAfter: resetTimeSeconds
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': resetTimeSeconds.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString()
        }
      }
    );
  }

  // Add rate limit headers to successful requests
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString());
  response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

  return null; // Allow request to continue
}

// Enhanced rate limiting for specific sensitive operations
export function strictRateLimit(request: NextRequest, endpoint: string): NextResponse | null {
  const strictConfigs: Record<string, RateLimitConfig> = {
    'password-reset': {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 password reset attempts per hour
      message: 'พยายามรีเซ็ตรหัสผ่านมากเกินไป กรุณาลองใหม่ใน 1 ชั่วโมง'
    },
    'admin-login': {
      windowMs: 30 * 60 * 1000, // 30 minutes
      maxRequests: 3, // 3 admin login attempts per 30 minutes
      message: 'พยายามล็อกอินแอดมินมากเกินไป กรุณาลองใหม่ใน 30 นาที'
    }
  };

  const config = strictConfigs[endpoint];
  if (!config) return null;

  const clientId = getClientId(request);
  const key = `strict:${endpoint}:${clientId}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);
    
    return new NextResponse(
      JSON.stringify({
        responseStatus: 429,
        responseMessage: config.message,
        data: null,
        retryAfter: resetTimeSeconds
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': resetTimeSeconds.toString()
        }
      }
    );
  }

  return null;
}

// Export rate limit status for monitoring
export function getRateLimitStatus(): Array<{ key: string; count: number; resetTime: number }> {
  const now = Date.now();
  const status: Array<{ key: string; count: number; resetTime: number }> = [];
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (now <= value.resetTime) {
      status.push({
        key,
        count: value.count,
        resetTime: value.resetTime
      });
    }
  }
  
  return status;
}
