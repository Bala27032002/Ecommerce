# Admin API Documentation

## Admin Authentication Endpoints

### 1. Admin Login
**POST** `/api/admin/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200):**
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

---

### 2. Register New Admin (SuperAdmin Only)
**POST** `/api/admin/register`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "password123",
  "role": "admin",
  "permissions": ["manage_products", "manage_categories"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439012",
    "name": "New Admin",
    "email": "newadmin@example.com",
    "role": "admin",
    "permissions": ["manage_products", "manage_categories"]
  }
}
```

---

### 3. Get Current Admin
**GET** `/api/admin/me`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "admin": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": ["manage_products", "manage_categories"],
    "isActive": true,
    "createdAt": "2025-12-01T06:00:00.000Z",
    "updatedAt": "2025-12-01T06:00:00.000Z"
  }
}
```

---

### 4. Get All Admins (SuperAdmin Only)
**GET** `/api/admin/all`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "admins": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "permissions": ["manage_products", "manage_categories"],
      "isActive": true
    }
  ]
}
```

---

### 5. Update Admin (SuperAdmin Only)
**PUT** `/api/admin/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Admin Name",
  "role": "admin",
  "permissions": ["manage_products", "manage_categories", "manage_orders"],
  "isActive": true
}
```

---

### 6. Delete Admin (SuperAdmin Only)
**DELETE** `/api/admin/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

---

## Product Management (Admin Only)

### 1. Create Product
**POST** `/api/products`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Fresh Tomato",
  "description": "Organic fresh tomatoes from local farms",
  "category": "507f1f77bcf86cd799439011",
  "price": 5.99,
  "originalPrice": 7.99,
  "discount": 25,
  "image": "https://example.com/tomato.jpg",
  "images": ["https://example.com/tomato1.jpg", "https://example.com/tomato2.jpg"],
  "stock": 100,
  "sku": "TOMATO-001",
  "tags": ["organic", "fresh", "vegetable"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Fresh Tomato",
    ...
  }
}
```

---

### 2. Update Product
**PUT** `/api/products/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "price": 4.99,
  "stock": 150,
  "discount": 20,
  "isFeatured": true
}
```

---

### 3. Delete Product
**DELETE** `/api/products/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

---

## Category Management (Admin Only)

### 1. Create Category
**POST** `/api/categories`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Vegetables",
  "description": "Fresh vegetables from local farms",
  "image": "https://example.com/vegetables.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Vegetables",
    "slug": "vegetables",
    "description": "Fresh vegetables from local farms",
    "image": "https://example.com/vegetables.jpg",
    "isActive": true
  }
}
```

---

### 2. Update Category
**PUT** `/api/categories/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Fresh Vegetables",
  "description": "Updated description",
  "isActive": true
}
```

---

### 3. Delete Category
**DELETE** `/api/categories/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

---

## Admin Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ["admin", "superadmin"], default: "admin"),
  permissions: [String] (enum: [
    "manage_products",
    "manage_categories",
    "manage_users",
    "manage_orders",
    "view_analytics"
  ]),
  isActive: Boolean (default: true),
  timestamps: true
}
```

---

## Available Permissions

- `manage_products` - Create, update, delete products
- `manage_categories` - Create, update, delete categories
- `manage_users` - Create, update, delete admins
- `manage_orders` - Manage orders
- `view_analytics` - View analytics and reports

---

## Admin Roles

- **admin** - Regular admin with assigned permissions
- **superadmin** - Full access to all features and can manage other admins

---

## Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**403 Forbidden (No Permission):**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Admin not found"
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

## Testing with Postman

### Step 1: Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Step 2: Create Product (with admin token)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Tomato",
    "description": "Organic fresh tomatoes",
    "category": "507f1f77bcf86cd799439011",
    "price": 5.99,
    "image": "https://example.com/tomato.jpg",
    "stock": 100
  }'
```

### Step 3: Create Category (with admin token)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vegetables",
    "description": "Fresh vegetables",
    "image": "https://example.com/vegetables.jpg"
  }'
```
