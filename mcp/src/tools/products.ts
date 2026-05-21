import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, toContent } from "../client.js";

export function registerProductTools(server: McpServer): void {
  server.tool(
    "list_products",
    "List all products for the current store. Requires API_TOKEN and API_STORE_ID env vars. Optional filters: status, category, search by name/code.",
    {
      status: z.enum(["pedido", "em_estoque"]).optional().describe("Filter by product status"),
      category: z.string().optional().describe("Filter by category"),
      q: z.string().optional().describe("Search by name or code"),
    },
    async ({ status, category, q }: { status?: "pedido" | "em_estoque"; category?: string; q?: string }) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      if (q) params.set("q", q);
      const query = params.size ? `?${params}` : "";
      const result = await apiRequest(`/products${query}`);
      return toContent(result);
    }
  );

  server.tool(
    "create_product",
    "Create a new product for the current store. Requires admin or operator role and API_STORE_ID env var. Required: name, category, locationId, buyer, cost.",
    {
      name: z.string().min(1).describe("Product name (required)"),
      category: z.string().min(1).describe("Product category (required)"),
      locationId: z.number().int().positive().describe("Location ID where the product is stored (required)"),
      buyer: z.string().min(1).describe("Name of the buyer (required)"),
      cost: z.number().int().nonnegative().describe("Product cost in cents (required)"),
      arrivedAt: z.string().datetime().optional().describe("Arrival datetime (ISO 8601, required when status is 'em_estoque')"),
      status: z.enum(["pedido", "em_estoque"]).optional().describe("Product status (default: 'pedido')"),
    },
    async ({ name, category, locationId, buyer, cost, arrivedAt, status }: { name: string; category: string; locationId: number; buyer: string; cost: number; arrivedAt?: string; status?: "pedido" | "em_estoque" }) => {
      const result = await apiRequest("/products", "POST", {
        name,
        category,
        locationId,
        buyer,
        cost,
        ...(arrivedAt !== undefined ? { arrivedAt } : {}),
        ...(status !== undefined ? { status } : {}),
      });
      return toContent(result);
    }
  );

  server.tool(
    "get_product_by_id",
    "Get a product by its ID. Requires API_TOKEN and API_STORE_ID env vars.",
    {
      id: z.number().int().positive().describe("Product ID"),
    },
    async ({ id }: { id: number }) => {
      const result = await apiRequest(`/products/${id}`);
      return toContent(result);
    }
  );

  server.tool(
    "update_product",
    "Update a product's fields. Requires admin or operator role and API_STORE_ID env var. When changing status to 'em_estoque', arrivedAt is required.",
    {
      id: z.number().int().positive().describe("Product ID"),
      name: z.string().min(1).optional().describe("Product name"),
      category: z.string().min(1).optional().describe("Product category"),
      locationId: z.number().int().positive().optional().describe("New location ID"),
      buyer: z.string().min(1).optional().describe("Name of the buyer"),
      cost: z.number().int().nonnegative().optional().describe("Product cost in cents"),
      arrivedAt: z.string().datetime().optional().describe("Arrival datetime (ISO 8601, required when changing status to 'em_estoque')"),
      status: z.enum(["pedido", "em_estoque"]).optional().describe("Product status"),
    },
    async ({ id, name, category, locationId, buyer, cost, arrivedAt, status }: { id: number; name?: string; category?: string; locationId?: number; buyer?: string; cost?: number; arrivedAt?: string; status?: "pedido" | "em_estoque" }) => {
      const result = await apiRequest(`/products/${id}`, "PUT", {
        ...(name !== undefined ? { name } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(locationId !== undefined ? { locationId } : {}),
        ...(buyer !== undefined ? { buyer } : {}),
        ...(cost !== undefined ? { cost } : {}),
        ...(arrivedAt !== undefined ? { arrivedAt } : {}),
        ...(status !== undefined ? { status } : {}),
      });
      return toContent(result);
    }
  );

  server.tool(
    "delete_product",
    "Delete a product. Fails if it has linked movements. Requires admin role and API_STORE_ID env var.",
    {
      id: z.number().int().positive().describe("Product ID"),
    },
    async ({ id }: { id: number }) => {
      const result = await apiRequest(`/products/${id}`, "DELETE");
      return toContent(result);
    }
  );
}
