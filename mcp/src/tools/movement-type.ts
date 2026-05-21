import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, toContent } from "../client.js";

export function registerMovementTypeTools(server: McpServer): void {
  server.tool(
    "list_movement_types",
    "List all movement types for the current store. Requires API_TOKEN and API_STORE_ID env vars. Optional filters: behavior, search by name.",
    {
      behavior: z.enum(["entrada", "saida", "encomenda"]).optional().describe("Filter by behavior type"),
      q: z.string().optional().describe("Search by name"),
    },
    async ({ behavior, q }: { behavior?: "entrada" | "saida" | "encomenda"; q?: string }) => {
      const params = new URLSearchParams();
      if (behavior) params.set("behavior", behavior);
      if (q) params.set("q", q);
      const query = params.size ? `?${params}` : "";
      const result = await apiRequest(`/movement-types${query}`);
      return toContent(result);
    }
  );

  server.tool(
    "create_movement_type",
    "Create a new movement type for the current store. Requires admin role and API_STORE_ID env var. Required: name, behavior. Behavior cannot be changed after creation.",
    {
      name: z.string().min(1).describe("Movement type name (required, must be unique per store)"),
      behavior: z.enum(["entrada", "saida", "encomenda"]).describe("Movement behavior: 'entrada' (stock in), 'saida' (stock out), 'encomenda' (order)"),
    },
    async ({ name, behavior }: { name: string; behavior: "entrada" | "saida" | "encomenda" }) => {
      const result = await apiRequest("/movement-types", "POST", { name, behavior });
      return toContent(result);
    }
  );

  server.tool(
    "get_movement_type_by_id",
    "Get a movement type by its ID. Requires API_TOKEN and API_STORE_ID env vars.",
    {
      id: z.number().int().positive().describe("Movement type ID"),
    },
    async ({ id }: { id: number }) => {
      const result = await apiRequest(`/movement-types/${id}`);
      return toContent(result);
    }
  );

  server.tool(
    "update_movement_type",
    "Update a movement type's name. Behavior cannot be changed. Requires admin role and API_STORE_ID env var.",
    {
      id: z.number().int().positive().describe("Movement type ID"),
      name: z.string().min(1).optional().describe("New movement type name"),
    },
    async ({ id, name }: { id: number; name?: string }) => {
      const result = await apiRequest(`/movement-types/${id}`, "PUT", {
        ...(name !== undefined ? { name } : {}),
      });
      return toContent(result);
    }
  );

  server.tool(
    "delete_movement_type",
    "Delete a movement type. Fails if any movements are linked to it. Requires admin role and API_STORE_ID env var.",
    {
      id: z.number().int().positive().describe("Movement type ID"),
    },
    async ({ id }: { id: number }) => {
      const result = await apiRequest(`/movement-types/${id}`, "DELETE");
      return toContent(result);
    }
  );
}
