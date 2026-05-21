import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, toContent } from "../client.js";

export function registerUserTools(server: McpServer): void {
  server.tool(
    "list_users",
    "List all users. Requires admin role. Optional filters: search by name/email, filter by role or active status.",
    {
      q: z.string().optional().describe("Search by name or email"),
      role: z.enum(["admin", "operator", "viewer"]).optional().describe("Filter by role"),
      active: z.boolean().optional().describe("Filter by active status (default: true)"),
    },
    async ({ q, role, active }: { q?: string; role?: "admin" | "operator" | "viewer"; active?: boolean }) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (role) params.set("role", role);
      if (active !== undefined) params.set("active", String(active));
      const query = params.size ? `?${params}` : "";
      const result = await apiRequest(`/users${query}`);
      return toContent(result);
    }
  );

  server.tool(
    "create_user",
    "Create a new user. Requires admin role. Required: name, email, password, role. Optional: storeId, phone.",
    {
      name: z.string().min(1).describe("User full name (required)"),
      email: z.string().email().describe("User email address (required, must be unique)"),
      password: z.string().min(8).describe("User password, min 8 characters (required)"),
      role: z.enum(["admin", "operator", "viewer"]).describe("User role (required)"),
      storeId: z.number().int().positive().optional().describe("Store ID to associate with the user"),
      phone: z.string().regex(/^\d*$/).optional().describe("Phone number (digits only)"),
    },
    async ({ name, email, password, role, storeId, phone }: { name: string; email: string; password: string; role: "admin" | "operator" | "viewer"; storeId?: number; phone?: string }) => {
      const result = await apiRequest("/users", "POST", {
        name,
        email,
        password,
        role,
        ...(storeId !== undefined ? { storeId } : {}),
        ...(phone !== undefined ? { phone } : {}),
      });
      return toContent(result);
    }
  );

  server.tool(
    "get_user_by_id",
    "Get a user by their ID. Requires admin role.",
    {
      id: z.number().int().positive().describe("User ID"),
    },
    async ({ id }: { id: number }) => {
      const result = await apiRequest(`/users/${id}`);
      return toContent(result);
    }
  );

  server.tool(
    "update_user",
    "Update a user's name and/or phone. Requires admin role. Only name and phone can be updated here.",
    {
      id: z.number().int().positive().describe("User ID"),
      name: z.string().optional().describe("New user name"),
      phone: z.string().regex(/^\d*$/).optional().describe("New phone number (digits only)"),
    },
    async ({ id, name, phone }: { id: number; name?: string; phone?: string }) => {
      const result = await apiRequest(`/users/${id}`, "PUT", {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
      });
      return toContent(result);
    }
  );

  server.tool(
    "reset_user_password",
    "Reset a user's password. Requires admin role.",
    {
      id: z.number().int().positive().describe("User ID"),
      password: z.string().min(8).describe("New password (min 8 characters)"),
    },
    async ({ id, password }: { id: number; password: string }) => {
      const result = await apiRequest(`/users/${id}/password`, "PUT", { password });
      return toContent(result);
    }
  );

  server.tool(
    "change_user_role",
    "Change a user's role. Requires admin role.",
    {
      id: z.number().int().positive().describe("User ID"),
      role: z.enum(["admin", "operator", "viewer"]).describe("New role to assign"),
    },
    async ({ id, role }: { id: number; role: "admin" | "operator" | "viewer" }) => {
      const result = await apiRequest(`/users/${id}/role`, "PUT", { role });
      return toContent(result);
    }
  );

  server.tool(
    "change_user_store",
    "Assign or remove a user's store association. Requires admin role. Pass storeId: null to remove the link.",
    {
      id: z.number().int().positive().describe("User ID"),
      storeId: z.number().int().positive().nullable().describe("Store ID to associate, or null to remove the link"),
    },
    async ({ id, storeId }: { id: number; storeId: number | null }) => {
      const result = await apiRequest(`/users/${id}/store`, "PUT", { storeId });
      return toContent(result);
    }
  );

  server.tool(
    "delete_user",
    "Permanently delete a user. Requires admin role.",
    {
      id: z.number().int().positive().describe("User ID"),
    },
    async ({ id }: { id: number }) => {
      const result = await apiRequest(`/users/${id}`, "DELETE");
      return toContent(result);
    }
  );
}
