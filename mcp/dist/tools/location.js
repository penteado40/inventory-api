import { z } from "zod";
import { apiRequest, toContent } from "../client.js";
export function registerLocationTools(server) {
    server.tool("list_locations", "List all locations for the current store, including nested children. Requires API_TOKEN and API_STORE_ID env vars. Optional filters: locationTypeId, parentId, search by displayName.", {
        locationTypeId: z.number().int().positive().optional().describe("Filter by location type ID"),
        parentId: z.number().int().positive().optional().describe("Filter by parent location ID"),
        q: z.string().optional().describe("Search by displayName"),
    }, async ({ locationTypeId, parentId, q }) => {
        const params = new URLSearchParams();
        if (locationTypeId !== undefined)
            params.set("locationTypeId", String(locationTypeId));
        if (parentId !== undefined)
            params.set("parentId", String(parentId));
        if (q)
            params.set("q", q);
        const query = params.size ? `?${params}` : "";
        const result = await apiRequest(`/locations${query}`);
        return toContent(result);
    });
    server.tool("create_location", "Create a new location for the current store. Requires admin role and API_STORE_ID env var. Required: number, locationTypeId. Optional: parentId.", {
        number: z.number().int().positive().describe("Location number (required, unique per type+parent+store)"),
        locationTypeId: z.number().int().positive().describe("Location type ID (required)"),
        parentId: z.number().int().positive().nullable().optional().describe("Parent location ID (optional, for nested locations)"),
    }, async ({ number, locationTypeId, parentId }) => {
        const result = await apiRequest("/locations", "POST", {
            number,
            locationTypeId,
            ...(parentId !== undefined ? { parentId } : {}),
        });
        return toContent(result);
    });
    server.tool("get_location_by_id", "Get a location by its ID, including its direct children. Requires API_TOKEN and API_STORE_ID env vars.", {
        id: z.number().int().positive().describe("Location ID"),
    }, async ({ id }) => {
        const result = await apiRequest(`/locations/${id}`);
        return toContent(result);
    });
    server.tool("update_location", "Update a location's fields. Requires admin role and API_STORE_ID env var. Validates circular references in parentId.", {
        id: z.number().int().positive().describe("Location ID"),
        number: z.number().int().positive().optional().describe("New location number"),
        locationTypeId: z.number().int().positive().optional().describe("New location type ID"),
        parentId: z.number().int().positive().nullable().optional().describe("New parent location ID (null to remove parent)"),
    }, async ({ id, number, locationTypeId, parentId }) => {
        const result = await apiRequest(`/locations/${id}`, "PUT", {
            ...(number !== undefined ? { number } : {}),
            ...(locationTypeId !== undefined ? { locationTypeId } : {}),
            ...(parentId !== undefined ? { parentId } : {}),
        });
        return toContent(result);
    });
    server.tool("delete_location", "Delete a location. Fails if it has children or allocated products. Requires admin role and API_STORE_ID env var.", {
        id: z.number().int().positive().describe("Location ID"),
    }, async ({ id }) => {
        const result = await apiRequest(`/locations/${id}`, "DELETE");
        return toContent(result);
    });
}
