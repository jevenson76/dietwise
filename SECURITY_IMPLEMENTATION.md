# DietWise Security Implementation: httpOnly Cookies

## Overview
This document outlines the implementation of secure authentication using httpOnly cookies to prevent XSS-based session hijacking attacks.

## The Problem: localStorage JWT Vulnerability
Previously, JWT tokens were stored in localStorage, which is vulnerable to XSS attacks:
- Malicious scripts can access localStorage via JavaScript
- If an attacker injects malicious code, they can steal the JWT token
- This leads to session hijacking and unauthorized access

## The Solution: httpOnly Cookies
We've implemented httpOnly cookie-based authentication with the following benefits:

### 1. XSS Protection
- httpOnly cookies cannot be accessed via JavaScript
- Even if an attacker executes malicious scripts, they cannot read the authentication token
- This effectively prevents session hijacking from XSS attacks

### 2. Automatic Cookie Management
- Browsers automatically send cookies with requests to the same domain
- No manual token management required on the client side
- Reduces complexity and potential security mistakes

### 3. Server-Side Control
- The server has full control over cookie lifecycle
- Can set secure flags, expiration, and domain restrictions
- Enables proper logout by clearing cookies server-side

## Implementation Details

### Client-Side Changes

#### API Configuration (`src/services/api/index.ts`)
```typescript
// Removed localStorage token management
// Added credentials: 'include' to all fetch requests
const response = await fetch(url, {
  ...options,
  headers,
  credentials: 'include', // Ensures httpOnly cookies are sent
});
```

#### Authentication Service (`src/services/api/auth.ts`)
```typescript
interface AuthResponse {
  user: User;
  success: boolean;
  // Token no longer returned in response
}

// Authentication state is checked by validating with server
async isAuthenticated(): Promise<boolean> {
  try {
    const user = await this.getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
}
```

#### Auth Hook (`hooks/useAuth.ts`)
```typescript
// Simplified initialization - no localStorage token checks
const initializeAuth = async () => {
  try {
    // Cookie is automatically sent, just check if user exists
    const currentUser = await authApi.getCurrentUser();
    // Update state based on response
  } catch (error) {
    // Handle authentication failure
  }
};
```

### Server-Side Requirements

For this implementation to work, the backend must:

#### 1. Set httpOnly Cookies on Login/Signup
```javascript
// Example Express.js implementation
app.post('/auth/login', async (req, res) => {
  // Validate credentials...
  const token = generateJWT(user);
  
  res.cookie('auth-token', token, {
    httpOnly: true,              // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',          // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });
  
  res.json({ user, success: true });
});
```

#### 2. Validate Cookies on Protected Routes
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.cookies['auth-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

#### 3. Clear Cookies on Logout
```javascript
app.post('/auth/logout', (req, res) => {
  res.clearCookie('auth-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  res.json({ success: true });
});
```

### Additional Security Considerations

#### 1. CSRF Protection
- Use `sameSite: 'strict'` cookie attribute
- Consider implementing CSRF tokens for state-changing operations
- Validate origin headers for sensitive requests

#### 2. Secure Cookie Attributes
- `secure: true` in production (HTTPS only)
- `httpOnly: true` to prevent JavaScript access
- `sameSite: 'strict'` to prevent cross-site requests

#### 3. Cookie Expiration
- Set reasonable expiration times
- Implement refresh token mechanism if needed
- Consider sliding session expiration

## Migration Benefits

### Security Improvements
✅ **XSS Protection**: Tokens cannot be stolen via JavaScript  
✅ **Automatic Security**: Browser handles cookie security  
✅ **Server Control**: Full server-side session management  

### Developer Experience
✅ **Simplified Client Code**: No manual token management  
✅ **Automatic Authentication**: Cookies sent automatically  
✅ **Cleaner API**: No need to manually add Authorization headers  

### Compliance
✅ **Security Standards**: Follows OWASP recommendations  
✅ **Best Practices**: Industry-standard authentication approach  
✅ **Audit Ready**: Clear security implementation for reviews  

## Testing Considerations

### Manual Testing
1. Login should work without localStorage tokens
2. Authenticated requests should work automatically
3. Logout should clear authentication state
4. Page refresh should maintain authentication (if cookie valid)

### Automated Testing
- Mock cookie behavior in unit tests
- Test authentication flow without localStorage
- Verify CSRF protection if implemented
- Test cookie expiration handling

## Conclusion

The migration to httpOnly cookies significantly improves the security posture of the DietWise application by:
- Preventing XSS-based session hijacking
- Simplifying authentication logic
- Following security best practices
- Reducing client-side security responsibilities

This implementation requires coordination with the backend team to ensure proper cookie handling on the server side.