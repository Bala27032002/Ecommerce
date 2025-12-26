# Wishlist & Cart API Documentation

## Overview

Complete API implementation for Wishlist and Cart functionality with per-user data isolation using JWT authentication.

---

## Database Models

### Wishlist Model (`models/Wishlist.js`)

```javascript
{
  userId: ObjectId (ref: User, unique),
  products: [
    {
      productId: ObjectId (ref: Product),
      addedAt: Date
    }
  ],
  timestamps: true
}
```

### Cart Model (`models/Cart.js`)

```javascript
{
  userId: ObjectId (ref: User, unique),
  items: [
    {
      productId: ObjectId (ref: Product),
      quantity: Number (min: 1),
      price: Number,
      addedAt: Date
    }
  ],
  timestamps: true
}
```

---

## API Endpoints

### Wishlist Endpoints

#### 1. Get User's Wishlist
```
GET /api/wishlist
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "wishlist": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "discount": 10,
      "image": "image_url",
      "rating": 4.5,
      "reviews": [],
      "weight": "200gr",
      "addedAt": "2025-12-04T10:00:00Z"
    }
  ]
}
```

**Response (Empty Wishlist):**
```json
{
  "success": true,
  "wishlist": []
}
```

---

#### 2. Add Product to Wishlist
```
POST /api/wishlist/add
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "productId": "product_id"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product added to wishlist",
  "wishlist": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "discount": 10,
      "image": "image_url",
      "rating": 4.5,
      "reviews": [],
      "weight": "200gr",
      "addedAt": "2025-12-04T10:00:00Z"
    }
  ]
}
```

**Error (400 - Product already in wishlist):**
```json
{
  "success": false,
  "message": "Product already in wishlist"
}
```

**Error (404 - Product not found):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

#### 3. Remove Product from Wishlist
```
DELETE /api/wishlist/:productId
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product removed from wishlist",
  "wishlist": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 99.99,
      ...
    }
  ]
}
```

---

#### 4. Check if Product in Wishlist
```
GET /api/wishlist/check/:productId
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "inWishlist": true
}
```

---

#### 5. Clear Entire Wishlist
```
DELETE /api/wishlist
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Wishlist cleared"
}
```

---

### Cart Endpoints

#### 1. Get User's Cart
```
GET /api/cart
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "cart": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 2,
      "image": "image_url",
      "weight": "200gr",
      "discount": 10,
      "addedAt": "2025-12-04T10:00:00Z"
    }
  ]
}
```

**Response (Empty Cart):**
```json
{
  "success": true,
  "cart": []
}
```

---

#### 2. Add Product to Cart
```
POST /api/cart/add
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 1,
      "image": "image_url",
      "weight": "200gr",
      "discount": 10,
      "addedAt": "2025-12-04T10:00:00Z"
    }
  ]
}
```

**Note:** If product already in cart, quantity is updated instead of adding duplicate.

---

#### 3. Update Cart Item Quantity
```
PUT /api/cart/:productId
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "quantity": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart quantity updated",
  "cart": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 5,
      "image": "image_url",
      "weight": "200gr",
      "discount": 10,
      "addedAt": "2025-12-04T10:00:00Z"
    }
  ]
}
```

---

#### 4. Remove Product from Cart
```
DELETE /api/cart/:productId
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product removed from cart",
  "cart": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 2,
      ...
    }
  ]
}
```

---

#### 5. Clear Entire Cart
```
DELETE /api/cart/clear
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared",
  "cart": []
}
```

---

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

**Without token (401):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

## Per-User Data Isolation

Each user has:
- **One Wishlist** - Unique by userId
- **One Cart** - Unique by userId

Users can only access their own data. Backend verifies JWT token and extracts userId.

---

## Error Handling

### Common Error Responses

**400 - Bad Request:**
```json
{
  "success": false,
  "message": "Product ID is required"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Testing with Postman

### 1. Login to Get JWT Token
```
POST http://localhost:5000/api/auth/login
Body: { "email": "user@example.com", "password": "password" }
Response: { "token": "jwt_token_here" }
```

### 2. Add to Wishlist
```
POST http://localhost:5000/api/wishlist/add
Headers: Authorization: Bearer <jwt_token>
Body: { "productId": "product_id" }
```

### 3. Get Wishlist
```
GET http://localhost:5000/api/wishlist
Headers: Authorization: Bearer <jwt_token>
```

### 4. Add to Cart
```
POST http://localhost:5000/api/cart/add
Headers: Authorization: Bearer <jwt_token>
Body: { "productId": "product_id", "quantity": 1 }
```

### 5. Get Cart
```
GET http://localhost:5000/api/cart
Headers: Authorization: Bearer <jwt_token>
```

---

## Frontend Integration

### Redux Thunks

Frontend uses Redux Thunks to call these endpoints:

```javascript
// Wishlist
dispatch(fetchWishlist());
dispatch(addToWishlist(productId));
dispatch(removeFromWishlist(productId));

// Cart
dispatch(fetchCart());
dispatch(addToCart({ productId, quantity }));
dispatch(updateCartQuantity({ productId, quantity }));
dispatch(removeFromCart(productId));
dispatch(clearCart());
```

---

## Database Setup

### Create Collections

Collections are automatically created when first document is inserted.

**Wishlist Collection:**
```javascript
db.wishlists.createIndex({ userId: 1 }, { unique: true })
```

**Cart Collection:**
```javascript
db.carts.createIndex({ userId: 1 }, { unique: true })
```

---

## Performance Considerations

1. **Indexes:** userId is unique and indexed for fast lookups
2. **Population:** Product details are populated on demand
3. **Filtering:** Only required fields are selected from Product
4. **Caching:** Consider implementing Redis for frequently accessed data

---

## Security Features

✅ JWT Authentication required for all endpoints
✅ Per-user data isolation
✅ Product existence validation
✅ Quantity validation (min: 1)
✅ Error messages don't expose sensitive data

---

## Future Enhancements

- [ ] Wishlist sharing
- [ ] Cart persistence across sessions
- [ ] Bulk operations (add multiple items)
- [ ] Cart expiration (auto-clear old items)
- [ ] Wishlist notifications
- [ ] Cart analytics

---

## Support

For issues or questions:
1. Check error messages in response
2. Verify JWT token is valid
3. Ensure product exists in database
4. Check MongoDB connection
5. Review server logs

---

**Version:** 1.0.0
**Last Updated:** December 4, 2025
**Status:** ✅ Production Ready
