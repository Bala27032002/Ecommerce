# E-Commerce API Setup Guide

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Admin User in Database
Run this command to create the first admin user:
```bash
npm run create-admin
```

**Output:**
```
✅ Admin created successfully!
📧 Email: admin@example.com
🔐 Password: admin123
👤 Role: admin
```

### 3. Start the Server
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## Admin Login Flow

### Step 1: Login as Admin
**POST** `http://localhost:5000/api/admin/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": ["manage_products", "manage_categories"]
  }
}
```

### Step 2: Copy the Token
Save the token from the response. You'll use it for all admin operations.

---

## Admin Operations

### Create Category
**POST** `http://localhost:5000/api/categories`

**Headers:**
```
Authorization: Bearer <your_admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Vegetables",
  "description": "Fresh vegetables from local farms",
  "image": "https://example.com/vegetables.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Vegetables",
    "slug": "vegetables",
    "image": "https://example.com/vegetables.jpg"
  }
}
```

---

### Create Product
**POST** `http://localhost:5000/api/products`

**Headers:**
```
Authorization: Bearer <your_admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Fresh Tomato",
  "description": "Organic fresh tomatoes from local farms",
  "category": "507f1f77bcf86cd799439011",
  "price": 5.99,
  "originalPrice": 7.99,
  "discount": 25,
  "image": "https://example.com/tomato.jpg",
  "images": ["https://example.com/tomato1.jpg"],
  "stock": 100,
  "sku": "TOMATO-001",
  "tags": ["organic", "fresh", "vegetable"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Fresh Tomato",
    "price": 5.99,
    "stock": 100,
    ...
  }
}
```

---

### Update Product
**PUT** `http://localhost:5000/api/products/:id`

**Headers:**
```
Authorization: Bearer <your_admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "price": 4.99,
  "stock": 150,
  "discount": 20
}
```

---

### Delete Product
**DELETE** `http://localhost:5000/api/products/:id`

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

---

### Update Category
**PUT** `http://localhost:5000/api/categories/:id`

**Headers:**
```
Authorization: Bearer <your_admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Fresh Vegetables",
  "description": "Updated description"
}
```

---

### Delete Category
**DELETE** `http://localhost:5000/api/categories/:id`

**Headers:**
```
Authorization: Bearer <your_admin_token>
```

---

## User Operations (No Auth Required)

### User Registration
**POST** `http://localhost:5000/api/auth/register`

**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "8519103993",
  "password": "password123",
  "confirmPassword": "password123"
}
```

---

### User Login
**POST** `http://localhost:5000/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Get All Products
**GET** `http://localhost:5000/api/products`

**Query Parameters:**
- `category=vegetables` - Filter by category
- `search=tomato` - Search products
- `sort=price-low` - Sort by price (low to high)
- `page=1` - Page number
- `limit=10` - Items per page

**Example:**
```
http://localhost:5000/api/products?category=vegetables&sort=price-low&page=1&limit=10
```

---

### Get Single Product
**GET** `http://localhost:5000/api/products/:id`

---

### Get All Categories
**GET** `http://localhost:5000/api/categories`

---

### Add Product Review (User)
**POST** `http://localhost:5000/api/products/:id/review`

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "rating": 5,
  "comment": "Great quality product!"
}
```

---

## Postman Setup Tips

### 1. Create Environment Variable
- Click "Environment" → "Create"
- Add variable: `admin_token` = your token value
- Use in headers: `Authorization: Bearer {{admin_token}}`

### 2. Save Requests
- Save each endpoint as a collection
- Organize by: Auth, Products, Categories, Users

### 3. Quick Test Flow
1. Login Admin → Get Token
2. Create Category → Copy Category ID
3. Create Product → Use Category ID
4. Update Product → Use Product ID
5. Delete Product
6. Delete Category

---

## Database Schema

### Admin
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/superadmin),
  permissions: [String],
  isActive: Boolean,
  timestamps: true
}
```

### User
```javascript
{
  fullName: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  timestamps: true
}
```

### Category
```javascript
{
  name: String (unique),
  description: String,
  image: String,
  slug: String (auto-generated),
  isActive: Boolean,
  timestamps: true
}
```

### Product
```javascript
{
  name: String,
  description: String,
  category: ObjectId (ref: Category),
  price: Number,
  originalPrice: Number,
  discount: Number,
  image: String,
  images: [String],
  stock: Number,
  rating: Number,
  reviews: [{userId, rating, comment}],
  isFeatured: Boolean,
  isActive: Boolean,
  tags: [String],
  sku: String (unique),
  timestamps: true
}
```

---

## Error Handling

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```
**Solution:** Check if token is valid and in Authorization header

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```
**Solution:** Admin doesn't have required permission

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```
**Solution:** Check if ID is correct

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```
**Solution:** Check request body for missing fields

---

## Troubleshooting

### Admin Login Not Working
- Check email and password are correct
- Verify admin exists in database
- Check MongoDB connection

### Token Not Working
- Verify token is copied correctly
- Check Authorization header format: `Bearer <token>`
- Token expires in 7 days

### Product Creation Fails
- Verify category ID is valid
- Check all required fields are provided
- Ensure admin has `manage_products` permission

### MongoDB Connection Error
- Check MongoDB is running
- Verify MONGO_URL in .env file
- Check network connectivity

---

## API Endpoints Summary

| Method | Endpoint | Auth | Permission |
|--------|----------|------|-----------|
| POST | /api/admin/login | No | - |
| GET | /api/admin/me | Admin | - |
| POST | /api/categories | Admin | manage_categories |
| GET | /api/categories | No | - |
| PUT | /api/categories/:id | Admin | manage_categories |
| DELETE | /api/categories/:id | Admin | manage_categories |
| POST | /api/products | Admin | manage_products |
| GET | /api/products | No | - |
| PUT | /api/products/:id | Admin | manage_products |
| DELETE | /api/products/:id | Admin | manage_products |
| POST | /api/auth/register | No | - |
| POST | /api/auth/login | No | - |
| GET | /api/auth/me | User | - |
| POST | /api/products/:id/review | User | - |
