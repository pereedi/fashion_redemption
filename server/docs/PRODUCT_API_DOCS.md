# Fashion Redemption Product API

Secure product integration API for chatbot systems, storefronts, and external applications.

---

## Overview

The Fashion Redemption Product API allows developers to:

- Retrieve products
- Search products
- Filter product collections
- Connect AI chatbots to product search
- Build external storefront integrations

This documentation only exposes integration-safe endpoints. Sensitive product architecture, internal inventory logic, admin routes, and protected operations are intentionally hidden for security purposes.

---

## Base URL

```
https://fashion-redemption-api.onrender.com/api/products
```

---

## Authentication

All requests require an API key.

> API keys are provided upon request. Please contact the administrator.

**Request Header**

```
x-api-key: YOUR_API_KEY
```

---

## Response Format

All endpoints return standardized JSON responses.

**Success Response**

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": []
}
```

**Error Response**

```json
{
  "success": false,
  "message": "Invalid request"
}
```

---

## GET Endpoints

---

### 1. Get Products

Retrieve available products with optional filtering and pagination.

**Endpoint**

```
GET /
```

**Query Parameters**

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| q         | string | Search products    |
| category  | string | Filter by category |
| type      | string | Filter by type     |
| color     | string | Filter by color    |
| minPrice  | number | Minimum price      |
| maxPrice  | number | Maximum price      |
| sort      | string | Sort results       |
| page      | number | Page number        |
| limit     | number | Items per page     |

**Example Request**

```bash
curl -X GET "https://fashion-redemption-api.onrender.com/api/products?category=WOMEN&color=BLACK&page=1&limit=10" \
-H "x-api-key: YOUR_API_KEY"
```

**Example Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_1714310000000",
      "name": "Premium Fashion Product",
      "price": 140,
      "currency": "ESP",
      "image": "https://secured-image-url.example.com/image.jpg",
      "availability": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

> **Notes:** Only integration-safe product data is returned. Internal inventory logic is protected. Product metadata exposure is minimized. Sensitive product structures are hidden.

---

### 2. Get Product Details

Retrieve information about a single product.

**Endpoint**

```
GET /:id
```

**Example Request**

```bash
curl -X GET "https://fashion-redemption-api.onrender.com/api/products/prod_1714310000000" \
-H "x-api-key: YOUR_API_KEY"
```

**Example Response**

```json
{
  "success": true,
  "data": {
    "id": "prod_1714310000000",
    "name": "Premium Fashion Product",
    "description": "Product description here.",
    "price": 140,
    "currency": "ESP",
    "images": [
      "https://secured-image-url.example.com/image.jpg"
    ],
    "availability": true
  }
}
```

---

### 3. Search Products

Quick product search endpoint optimized for chatbot integrations.

**Endpoint**

```
GET /search
```

**Query Parameters**

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| q         | string | Search keyword |

**Example Request**

```bash
curl -X GET "https://fashion-redemption-api.onrender.com/api/products/search?q=black+dress" \
-H "x-api-key: YOUR_API_KEY"
```

**Example Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_1714310000001",
      "name": "Black Fashion Dress",
      "price": 120,
      "image": "https://secured-image-url.example.com/dress.jpg"
    }
  ]
}
```

---

## POST Endpoints

---

### 1. Chatbot Product Query

This endpoint is optimized for AI chatbot integrations.

**Endpoint**

```
POST /chatbot/query
```

**Request Body**

```json
{
  "message": "Show me black luxury outfits"
}
```

**Example Request**

```bash
curl -X POST "https://fashion-redemption-api.onrender.com/api/products/chatbot/query" \
-H "Content-Type: application/json" \
-H "x-api-key: YOUR_API_KEY" \
-d '{
  "message": "Show me black luxury outfits"
}'
```

**Example Response**

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "prod_1714310000002",
      "name": "Luxury Black Outfit",
      "price": 220,
      "image": "https://secured-image-url.example.com/outfit.jpg"
    }
  ]
}
```

---

## Security Practices

For security reasons:

- API keys are not publicly shared
- Sensitive product architecture is hidden
- Internal product metadata is protected
- Admin endpoints are excluded from this documentation
- Rate limiting is enabled
- Protected routes require authentication

---

## Protected / Internal Routes

The following routes are intentionally excluded from this documentation:

- Admin management
- Inventory control
- Analytics
- Internal product operations
- Order administration
- User management

These routes are available only for internal systems.

---

## Rate Limits

To ensure service stability:

- Excessive requests may be temporarily blocked
- Abuse detection is enabled
- Automated scraping is restricted

---

## Best Practices

Recommended integration practices:

- Store API keys securely
- Never expose API keys in client-side code
- Cache product responses where possible
- Use pagination for large datasets
- Handle API errors gracefully

---

## Version

```
API Version: v1
Status:      Production
```
