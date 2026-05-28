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
  "message": "Show me luxury black dresses"
}
```

---

### Step 2 — Chatbot Calls the API

Forward the message to the chatbot query endpoint:

```http
POST /chatbot/query
```

```bash
curl -X POST "https://fashion-redemption-api.onrender.com/api/products/chatbot/query" \
-H "Content-Type: application/json" \
-H "x-api-key: YOUR_API_KEY" \
-d '{ "message": "Show me luxury black dresses" }'
```

---

### Step 3 — API Returns Matching Products

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "prod_1714310000001",
      "name": "Luxury Black Dress",
      "price": 220,
      "image": "https://secured-image-url.example.com/dress.jpg"
    }
  ]
}
```

---

### Step 4 — Present Products to the User

Use the `id` field to construct a checkout link. Your AI should format the response like:

> **Luxury Black Dress** — *Esp 220*
>
> [Click here to view and checkout](https://fashion-redemption.vercel.app/product/prod_1714310000001)

---

## AI Tool Definition (JSON Schema)

For OpenAI-compatible or Claude tool-calling integrations, provide this tool schema to your AI model:

```json
{
  "name": "search_products",
  "description": "Search for Fashion Redemption products based on user preferences such as name, color, category, and price range.",
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

The AI can combine multiple filters in a single tool call.

**Example 1:** "Show me black dresses for women under 150 Esp"

```json
{
  "q": "dress",
  "category": "WOMEN",
  "color": "BLACK",
  "maxPrice": 150
}
```

**Example 2:** "What new arrivals do you have for men?"

```json
{
  "category": "MEN",
  "filter": "new"
}
```

**Example 3:** "Show me trending women's items sorted by price"

```json
{
  "category": "WOMEN",
  "filter": "trending",
  "sort": "price_asc"
}
```

---

## Error Handling

If no products are found, instruct the AI to:

1. Acknowledge the specific filters used (e.g., *"I couldn't find any blue suits for kids..."*)
2. Suggest broader alternatives (e.g., *"Would you like to see navy blue suits instead, or black suits for kids?"*)
3. Offer to remove one filter at a time to widen the results

---

## Direct Search Alternative

For simple keyword-based queries without AI orchestration, use the search endpoint directly:

```bash
curl -X GET "https://fashion-redemption-api.onrender.com/api/products/search?q=black+dress" \
-H "x-api-key: YOUR_API_KEY"
```

---

## Security Notes

- **Never expose your API key** in client-side or frontend code
- Make all API calls from your server/backend
- Cache responses where appropriate to minimize API calls
- Handle rate limit errors (`429`) with exponential backoff

---

## Version

```
API Version: v1
Status:      Production
```
