# AI Chatbot Integration Guide

This guide explains how to integrate your AI chatbot with the Product API. The most effective way is to define **Tools** (also known as Functions) that the AI can call to fetch product data.

## 1. AI Tool Definition (JSON Schema)

Provide this schema to your AI model (e.g., OpenAI `tools` or Claude `tools`).

```json
{
  "name": "search_products",
  "description": "Search for products based on user preferences like name, color, category, and price range.",
  "parameters": {
    "type": "object",
    "properties": {
      "q": {
        "type": "string",
        "description": "The general search query (e.g., 'summer dress', 'hoodie')."
      },
      "category": {
        "type": "string",
        "enum": ["MEN", "WOMEN", "KIDS"],
        "description": "The target audience category."
      },
      "color": {
        "type": "string",

        
        "description": "The preferred color of the product."
      },
      "minPrice": {
        "type": "number",
        "description": "Minimum price in Esp."
      },
      "maxPrice": {
        "type": "number",
        "description": "Maximum price in Esp."
      },
      "filter": {
        "type": "string",
        "enum": ["new", "trending", "sale"],
        "description": "Special status filter."
      }
    }
  }
}
```

## 2. Implementation Workflow

### Step 1: System Prompt
Configure your AI with a system prompt that explains its role:
> "You are a fashion assistant for Fashion Redemption. Help users find products. When a user asks for something specific, use the `search_products` tool. Always provide a checkout link for the products you recommend."

### Step 2: Handling the Tool Call
When the AI decides to call `search_products`, your backend/frontend should:
1. Extract the arguments.
2. Call `GET /api/products` with those arguments as query parameters.
3. Return the JSON response back to the AI.

### Step 3: Presenting Products to the User
The AI will receive a list of products. Instruct it to format the response like this:

**AI Response Example:**
> "I found a perfect match for you! 
> 
> **[Product Name]**
> *Price: [Price]*
> *[Description]*
> 
> [Image]
> 
> [Click here to view and checkout](https://fashion-redemption.vercel.app/product/[id])"

**Note:** Use the `id` field from the product object to construct the checkout link.

## 3. Advanced Filtering
The AI can combine multiple filters. For example:
- "Show me black dresses for women under 150 Esp"
- The AI should call: `search_products(q="dress", category="WOMEN", color="BLACK", maxPrice=150)`

## 4. Error Handling
If no products are found, instruct the AI to:
1. Acknowledge the specific filters (e.g., "I couldn't find any blue suits for kids...").
2. Suggest broader alternatives (e.g., "Would you like to see navy blue suits instead, or black suits for kids?").
