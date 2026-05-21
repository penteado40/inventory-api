import { z } from "zod";
import { apiRequest, toContent } from "../client.js";
export function registerStoreTools(server) {
    server.tool("list_stores", "List all stores. Requires admin role. Optional filters: search by name/slug and filter by active status.", {
        q: z.string().optional().describe("Search by store name or slug"),
        active: z.boolean().optional().describe("Filter by active status (default: true)"),
    }, async ({ q, active }) => {
        const params = new URLSearchParams();
        if (q)
            params.set("q", q);
        if (active !== undefined)
            params.set("active", String(active));
        const query = params.size ? `?${params}` : "";
        const result = await apiRequest(`/stores${query}`);
        return toContent(result);
    });
    server.tool("create_store", "Create a new store. Requires admin role. Required: name. Optional: address, phone, requireProductCode.", {
        name: z.string().min(1).describe("Store name (required)"),
        address: z.string().optional().describe("Store address"),
        phone: z.string().optional().describe("Store phone number"),
        requireProductCode: z.boolean().optional().describe("Whether products require a code"),
    }, async ({ name, address, phone, requireProductCode }) => {
        const result = await apiRequest("/stores", "POST", {
            name,
            ...(address !== undefined ? { address } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(requireProductCode !== undefined ? { requireProductCode } : {}),
        });
        return toContent(result);
    });
    server.tool("get_store_by_id", "Get a store by its ID. Requires admin role.", {
        id: z.number().int().positive().describe("Store ID"),
    }, async ({ id }) => {
        const result = await apiRequest(`/stores/${id}`);
        return toContent(result);
    });
    server.tool("update_store", "Update a store's fields. Requires admin role. Slug cannot be changed. All fields are optional.", {
        id: z.number().int().positive().describe("Store ID"),
        name: z.string().min(1).optional().describe("New store name"),
        address: z.string().optional().describe("New store address"),
        phone: z.string().optional().describe("New store phone number"),
        requireProductCode: z.boolean().optional().describe("Whether products require a code"),
    }, async ({ id, name, address, phone, requireProductCode }) => {
        const result = await apiRequest(`/stores/${id}`, "PUT", {
            ...(name !== undefined ? { name } : {}),
            ...(address !== undefined ? { address } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(requireProductCode !== undefined ? { requireProductCode } : {}),
        });
        return toContent(result);
    });
    server.tool("delete_store", "Soft-delete a store (sets active = false). The record is not removed from the database. Requires admin role.", {
        id: z.number().int().positive().describe("Store ID"),
    }, async ({ id }) => {
        const result = await apiRequest(`/stores/${id}`, "DELETE");
        return toContent(result);
    });
}
