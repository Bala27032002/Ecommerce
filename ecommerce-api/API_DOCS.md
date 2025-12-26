# E-Commerce API Documentation

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "8519103993",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "8519103993"
  }
}
```

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "8519103993"
  }
}
```

---

### 3. Get Current User (Protected)
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "8519103993",
    "createdAt": "2025-12-01T06:00:00.000Z",
    "updatedAt": "2025-12-01T06:00:00.000Z"
  }
}
```

---

## Features Implemented

✅ **User Registration**
- Full name, email, phone, password validation
- Password confirmation check
- Duplicate email/phone prevention
- Password hashing with bcryptjs

✅ **User Login**
- Email and password validation
- Secure password comparison
- JWT token generation (7 days expiry)

✅ **JWT Authentication**
- Token-based authentication
- Protected routes middleware
- Token verification

✅ **Security**
- Password hashing with bcryptjs (salt rounds: 10)
- Email validation with regex
- JWT secret from environment variables
- Secure password storage

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Testing with Postman/cURL

### Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "8519103993",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_token_here>"
```
