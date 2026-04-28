# Product API Documentation

This document describes the API endpoints available for managing and searching products in the Fashion Redemption platform.

## Base URL
`http://<your-domain>/api/products`

---

## 1. Get All Products
Retrieves a list of products with optional filtering, sorting, and pagination.

- **URL**: `/`
- **Method**: `GET`
- **Query Parameters**:
  - `q` (string): Search term to match against product name or description.
  - `category` (string): Filter by category (e.g., `MEN`, `WOMEN`, `KIDS`).
  - `type` (string): Filter by product type (e.g., `DRESSES`, `TOPS`, `SUITS`).
  - `color` (string): Filter by variant color (e.g., `BLACK`, `BLUE`).
  - `minPrice` (number): Minimum base price.
  - `maxPrice` (number): Maximum base price.
  - `sort` (string): Sort order. Options: `price_asc`, `price_desc`, `newest`.
  - `filter` (string): Special filters. Options: `new`, `trending`, `sale`.
  - `page` (number): Page number (default: 1).
  - `limit` (number): Number of products per page (default: 12).

### Example Request
`GET /api/products?category=WOMEN&color=BLACK&maxPrice=150`

### Example Response
```json
{
  "products": [
    {
      "id": "prod_1714310000000",
      "name": "Women Tailored Structured Blazer",
      "description": "Premium tailored blazer featuring clean lines and a sharp silhouette...",
      "category": "WOMEN",
      "type": "OUTERWEAR",
      "basePrice": 140,
      "price": "Esp 140",
      "image": "https://lh3.googleusercontent.com/d/...",
      "colors": ["BLACK"],
      "sizes": ["XS", "S", "M", "L", "XL"],
      "stock": 97
    }
  ],
  "total": 1,
  "pages": 1,
  "currentPage": 1
}
```

---

## 2. Get Product by ID
Retrieves detailed information for a specific product.

- **URL**: `/:id`
- **Method**: `GET`
- **URL Params**:
  - `id` (string): The `external_id` of the product.

### Example Request
`GET /api/products/prod_1714310000000`

### Example Response
```json
{
  "id": "prod_1714310000000",
  "name": "Women Tailored Structured Blazer",
  "description": "...",
  "category": "WOMEN",
  "type": "OUTERWEAR",
  "price": "Esp 140",
  "image": "https://lh3.googleusercontent.com/d/...",
  "images": ["url1", "url2"],
  "variants": [...],
  "reviews": [...],
  "relatedProducts": [...]
}
```

---

## 3. Search Products (Simple)
A dedicated search endpoint for quick queries.

- **URL**: `/search`
- **Method**: `GET`
- **Query Parameters**:
  - `q` (string): Search query.

### Example Request
`GET /api/products/search?q=dress`
