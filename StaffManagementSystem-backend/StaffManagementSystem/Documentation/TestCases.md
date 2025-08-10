# Comprehensive Test Cases for Staff Management System

## 🧪 Authentication & Authorization Test Cases

### **User Registration Tests**

#### Test Case 1: Valid Registration with Company Email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john.doe@company.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```
**Expected Result:** 
- Status: 200 OK
- Response: Registration success message
- Database: User created with `EmailVerified = false`, `IsActive = false`
- Email: Verification email sent

#### Test Case 2: Valid Registration with Gmail (Testing)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@gmail.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```
**Expected Result:** 
- Status: 200 OK
- Gmail domain now allowed for testing

#### Test Case 3: Invalid Email Domain
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "external",
    "email": "external@yahoo.com",
    "password": "SecurePass123!",
    "firstName": "External",
    "lastName": "User"
  }'
```
**Expected Result:**
- Status: 400 Bad Request
- Error: "Registration denied: Email domain 'yahoo.com' is not authorized"

#### Test Case 4: Weak Password
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "weakpass",
    "email": "weak@company.com",
    "password": "123",
    "firstName": "Weak",
    "lastName": "Password"
  }'
```
**Expected Result:**
- Status: 400 Bad Request
- Error: Password validation failures

#### Test Case 5: Duplicate Username
```bash
# First registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "duplicate",
    "email": "first@company.com",
    "password": "SecurePass123!"
  }'

# Second registration with same username
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "duplicate",
    "email": "second@company.com",
    "password": "SecurePass123!"
  }'
```
**Expected Result:**
- First: 200 OK
- Second: 400 Bad Request, "Username already exists"

### **Email Verification Tests**

#### Test Case 6: Valid Email Verification
```bash
# After registration, get token from database or email
curl -X GET "http://localhost:5000/api/auth/verify-email?token=VERIFICATION_TOKEN_HERE"
```
**Expected Result:**
- Status: 302 Redirect to frontend success page
- Database: `EmailVerified = true`, `IsActive = true`
- Email: Welcome email sent

#### Test Case 7: Invalid/Expired Token
```bash
curl -X GET "http://localhost:5000/api/auth/verify-email?token=invalid-token"
```
**Expected Result:**
- Status: 400 Bad Request
- Error: "Invalid verification token"

#### Test Case 8: Resend Verification Email
```bash
curl -X POST http://localhost:5000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com"
  }'
```
**Expected Result:**
- Status: 200 OK
- Response: Generic success message (security)
- New verification email sent if email exists

### **Login Tests**

#### Test Case 9: Valid Login (Admin)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!@#"
  }'
```
**Expected Result:**
- Status: 200 OK
- Response: JWT token + user details
- User object includes admin flags

#### Test Case 10: Login Before Email Verification
```bash
# Try to login with unverified account
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "unverified",
    "password": "SecurePass123!"
  }'
```
**Expected Result:**
- Status: 401 Unauthorized
- Error: "Please verify your email address before logging in"

#### Test Case 11: Invalid Credentials
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrongpassword"
  }'
```
**Expected Result:**
- Status: 401 Unauthorized
- Error: "Invalid username or password"
- Database: `FailedLoginAttempts` incremented

#### Test Case 12: Account Lockout (5 Failed Attempts)
```bash
# Repeat 5 times with wrong password
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "testuser",
      "password": "wrongpassword"
    }'
done

# 6th attempt should be locked
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "correctpassword"
  }'
```
**Expected Result:**
- First 5 attempts: 401 Unauthorized
- 6th attempt: 401 with "Account is temporarily locked"
- Database: `IsAccountLocked = true`, `LockedUntil = DateTime + 30min`

### **Admin Management Tests**

#### Test Case 13: List Users (Admin Required)
```bash
# First get admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!@#"}' \
  | jq -r '.token')

# List users
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
**Expected Result:**
- Status: 200 OK
- Response: Paginated user list with metadata

#### Test Case 14: Grant Admin Permissions
```bash
# Get user ID from previous list, then grant permissions
curl -X POST http://localhost:5000/api/admin/users/USER_ID_HERE/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isAdministrator": true,
    "canManageUsers": true,
    "canManageRoles": true
  }'
```
**Expected Result:**
- Status: 200 OK
- Database: User permissions updated
- Response: Updated user object

#### Test Case 15: Non-Admin Trying Admin Endpoint
```bash
# Get regular user token
USER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!"}' \
  | jq -r '.token')

# Try to access admin endpoint
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $USER_TOKEN"
```
**Expected Result:**
- Status: 403 Forbidden
- Error: "Access denied. Admin privileges required"

#### Test Case 16: Self-Modification Prevention
```bash
# Admin trying to remove their own admin status
curl -X POST http://localhost:5000/api/admin/users/ADMIN_USER_ID/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isAdministrator": false,
    "canManageUsers": false,
    "canManageRoles": false
  }'
```
**Expected Result:**
- Status: 400 Bad Request
- Error: "You cannot modify your own administrator status"

### **Company Access Control Tests**

#### Test Case 17: Middleware Domain Validation
```bash
# Create user with company email, verify, and login
curl -X GET http://localhost:5000/api/employee \
  -H "Authorization: Bearer $TOKEN_FROM_COMPANY_USER"
```
**Expected Result:**
- Status: 200 OK
- Access granted through middleware

#### Test Case 18: Subdomain Support (Wildcard)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hruser",
    "email": "hr@hr.company.com",
    "password": "SecurePass123!",
    "firstName": "HR",
    "lastName": "User"
  }'
```
**Expected Result:**
- Status: 200 OK (wildcards enabled)
- Subdomain accepted due to `AllowWildcards: true`

### **System Integration Tests**

#### Test Case 19: Complete User Journey
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "journey",
    "email": "journey@gmail.com",
    "password": "Journey123!",
    "firstName": "Test",
    "lastName": "Journey"
  }'

# 2. Verify email (get token from logs or email)
curl -X GET "http://localhost:5000/api/auth/verify-email?token=TOKEN_HERE"

# 3. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"journey","password":"Journey123!"}' \
  | jq -r '.token')

# 4. Access protected endpoint
curl -X GET http://localhost:5000/api/employee \
  -H "Authorization: Bearer $TOKEN"

# 5. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result:** Full journey successful

#### Test Case 20: Default Admin Initialization
```bash
# On first app startup, admin should be created automatically
# Check with login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!@#"
  }'
```
**Expected Result:**
- Status: 200 OK
- Admin account exists and functional

## 🎨 Frontend Test Cases

### **Login Page Tests**

#### Test Case 21: Login Form Validation
- **Valid Login**: Enter valid credentials → Success
- **Empty Fields**: Submit empty form → Error messages
- **Invalid Credentials**: Wrong password → Error display
- **Loading State**: During login → Spinner shows
- **Navigation**: Click "Create Account" → Navigate to register

### **Registration Page Tests**

#### Test Case 22: Registration Form Validation
- **Password Mismatch**: Different passwords → Error shown
- **Weak Password**: "123" → Strength error
- **Invalid Email**: "notanemail" → Format error
- **Company Email Hint**: Shows company domain requirement
- **Success State**: Valid registration → Success page with email instructions

#### Test Case 23: Email Verification Page
- **Valid Token**: URL with `?success=true` → Success message + countdown
- **Invalid Token**: No success param → Error message
- **Auto Redirect**: After 5 seconds → Navigate to login
- **Manual Navigation**: Click login button → Navigate immediately

### **Responsive Design Tests**

#### Test Case 24: Mobile Compatibility
- **Login Page**: Mobile viewport → Form remains usable
- **Registration Page**: Long form → Scrollable with fixed submit
- **Email Page**: Success message → Centered and readable

## 🔒 Security Test Cases

#### Test Case 25: SQL Injection Attempts
```bash
# Try SQL injection in login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin; DROP TABLE Users; --",
    "password": "anything"
  }'
```
**Expected Result:**
- Status: 401 Unauthorized
- No SQL injection, parameterized queries protect

#### Test Case 26: JWT Token Security
```bash
# Try accessing endpoint with invalid token
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer invalid.jwt.token"
```
**Expected Result:**
- Status: 401 Unauthorized
- Token validation fails

#### Test Case 27: CORS Policy
```bash
# Try request from unauthorized origin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://malicious-site.com" \
  -d '{"username":"admin","password":"Admin123!@#"}'
```
**Expected Result:**
- CORS policy should block if not in allowed origins

## 📊 Performance Test Cases

#### Test Case 28: Database Query Performance
```bash
# Test with large user dataset
# Create 1000+ users and test admin list endpoint
time curl -X GET http://localhost:5000/api/admin/users?limit=100 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
**Expected Result:**
- Response time < 2 seconds
- Proper pagination working

#### Test Case 29: Concurrent Login Attempts
```bash
# Test 10 simultaneous logins
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"Admin123!@#"}' &
done
wait
```
**Expected Result:**
- All requests handled successfully
- No race conditions or deadlocks

## 🏗️ Integration Test Environment Setup

### **Test Database Setup**
```bash
# Use test database
dotnet ef database update --connection "Server=localhost;Database=StaffManagementTest;Trusted_Connection=True;"
```

### **Test Email Configuration**
```json
{
  "EmailSettings": {
    "SmtpHost": "localhost",
    "SmtpPort": 1025,
    "EnableSsl": false,
    "FromEmail": "test@localhost"
  }
}
```
**Use MailHog or similar for email testing**

### **Environment Variables for Testing**
```bash
export ASPNETCORE_ENVIRONMENT=Testing
export JWT_KEY=test-key-for-testing
export DB_CONNECTION="Server=localhost;Database=TestDb;Trusted_Connection=True;"
```

## 📋 Test Execution Checklist

### **Before Testing:**
- [ ] Database is running and accessible
- [ ] Backend API is running on correct port
- [ ] Frontend is built and served
- [ ] Email service is configured (or mocked)
- [ ] Test accounts are clean/reset

### **Critical Tests to Pass:**
- [ ] Default admin account creation
- [ ] Valid user registration flow
- [ ] Email verification process
- [ ] Login with verified account
- [ ] Domain restriction enforcement
- [ ] Admin permission management
- [ ] Account lockout after failed attempts
- [ ] JWT token authentication
- [ ] Company access middleware validation
- [ ] SQL injection protection

### **Test Data Cleanup:**
```sql
-- Clean test data between runs
DELETE FROM Users WHERE Email LIKE '%test%' OR Username LIKE '%test%';
DELETE FROM Users WHERE Email LIKE '%@gmail.com' AND Username != 'admin';
```

This comprehensive test suite covers all authentication flows, security measures, admin functions, and edge cases! 🧪✅