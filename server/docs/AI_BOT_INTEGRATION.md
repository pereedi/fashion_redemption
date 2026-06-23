# AI Chatbot Integration Guide

The Fashion Redemption Product API is purpose-built to support conversational commerce. This guide explains how to connect any AI chatbot to the product catalog.

---

## Supported Chatbot Use Cases

- AI shopping assistants
- Conversational commerce flows
- Product recommendation systems
- Smart storefront assistants

---

## Recommended Chatbot Flow

### Step 1 — User Sends a Shopping Request

Your chatbot receives a natural language message from the user:

```json
{
  "message": "Show me a medium black dress under 15000 ESP"
}
```

---

### Step 2 — Chatbot Calls the API

Forward the message to the chatbot query endpoint:

```http
POST /api/v1/products/chatbot/query
```

```bash
curl -X POST "https://fashion-redemption-api.onrender.com/api/v1/products/chatbot/query" \
-H "Content-Type: application/json" \
-H "x-api-key: YOUR_API_KEY" \
-d '{ "message": "Show me a medium black dress under 15000 ESP" }'
```

---

### Step 3 — API Returns Matching Products

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "prod_1714310000000",
      "name": "Elegant Pleated Midi Dress",
      "price": 14000,
      "currency": "ESP",
      "category": "women",
      "rating": 4.8,
      "image": "https://fashion-redemption-api.onrender.com/images/products/women_elegant_pleated_midi_dress_1.jpg",
      "availability": true,
      "checkoutUrl": "https://fashion-redemption.vercel.app/product/prod_1714310000000"
    }
  ]
}
```

---

### Step 4 — Present Products to the User

Use the `checkoutUrl` field returned by the API directly, or construct it using the `id` field. Your AI should format the response like:

> **Elegant Pleated Midi Dress** — *14,000 ESP*
>
> [Click here to view and checkout](https://fashion-redemption.vercel.app/product/prod_1714310000000)

---

## AI Tool Definition (JSON Schema)

For OpenAI-compatible or Claude tool-calling integrations, provide this tool schema to your AI model:

```json
{
  "name": "search_products",
  "description": "Search for Fashion Redemption products based on user preferences such as name, color, size, category, and price range.",
  "parameters": {
    "type": "object",
    "properties": {
      "q": {
        "type": "string",
        "description": "General search query (e.g., 'summer dress', 'hoodie', 'luxury suit')."
      },
      "category": {
        "type": "string",
        "enum": ["MEN", "WOMEN", "KIDS"],
        "description": "Target audience category."
      },
      "color": {
        "type": "string",
        "description": "Preferred product color (e.g., 'BLACK', 'WHITE', 'BLUE')."
      },
      "size": {
        "type": "string",
        "enum": ["XS", "S", "M", "L", "XL", "XXL"],
        "description": "Preferred product size."
      },
      "minPrice": {
        "type": "number",
        "description": "Minimum price in Esp."
      },
      "maxPrice": {
        "type": "number",
        "description": "Maximum price in Esp."
      },
      "sort": {
        "type": "string",
        "enum": ["price_asc", "price_desc", "newest"],
        "description": "Sort order for results."
      },
      "filter": {
        "type": "string",
        "enum": ["new", "trending", "sale"],
        "description": "Special status filter for the product list."
      },
      "page": {
        "type": "number",
        "description": "Page number for paginated results (default: 1)."
      },
      "limit": {
        "type": "number",
        "description": "Number of results per page (default: 10)."
      }
    }
  }
}
```

---

## System Prompt Template

Configure your AI model with a system prompt that establishes its role:

```
You are a fashion assistant for Fashion Redemption — a premium fashion brand.
Help users find products by using the search_products tool when they express any shopping intent.
When you find products, always present them with their name, price, and a checkout link.
If no products are found, suggest broader search alternatives.
Always be helpful, stylish, and conversational in tone.
```

---

## Advanced Filtering Examples

The AI can combine multiple filters, including size, in a single tool call.

**Example 1:** "Show me medium black dresses for women under 15000 ESP"

```json
{
  "q": "dress",
  "category": "WOMEN",
  "color": "BLACK",
  "size": "M",
  "maxPrice": 15000
}
```

**Example 2:** "What new arrivals do you have for men in size XL?"

```json
{
  "category": "MEN",
  "size": "XL",
  "filter": "new"
}
```

**Example 3:** "Show me trending women's items in size S sorted by price"

```json
{
  "category": "WOMEN",
  "size": "S",
  "filter": "trending",
  "sort": "price_asc"
}
```

---

## Error Handling

If no products are found, instruct the AI to:

1. Acknowledge the specific filters used (e.g., *"I couldn't find any blue suits for kids in size Medium..."*)
2. Suggest broader alternatives (e.g., *"Would you like to see navy blue suits instead, or black suits for kids in size Medium?"*)
3. Offer to remove one filter at a time (like size or color) to widen the results

---

## Direct Search Alternative

For simple keyword-based queries without AI orchestration, use the search endpoint directly:

```bash
curl -X GET "https://fashion-redemption-api.onrender.com/api/v1/products/search?q=black+dress" \
-H "x-api-key: YOUR_API_KEY"
```

---

## Security Notes

- **Never expose your API key** in client-side or frontend code
- Make all API calls from your server/backend proxy
- Cache responses where appropriate to minimize API calls
- Handle rate limit errors (`429`) with exponential backoff

---

## Version

```
API Version: v1
Status:      Production
```
