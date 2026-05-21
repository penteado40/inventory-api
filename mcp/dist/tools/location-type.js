import { z } from "zod";
import { apiRequest, toContent } from "../client.js";
export function registerLocationTypeTools(server) {
    server.tool("list_location_types", "List all location types for the current store. Requires API_TOKEN and API_STORE_ID env vars. Optional: search by name.", {
        q: z.string().optional().describe("Search by name"),
    }, async ({ q }) => {
        const params = new URLSearchParams();
        if (q)
            params.set("q", q);
        const query = params.size ? `?${params}` : "";
        const result = await apiRequest(`/location-types${query}`);
        return toContent(result);
    });
    server.tool("create_location_type", "Create a new location type for the current store. Requires admin role and API_STORE_ID env var. Required: name.", {
        name: z.string().min(1).describe("Location type name (required, must be unique per store)"),
    }, async ({ name }) => {
        const result = await apiRequest("/location-types", "POST", { name });
        return toContent(result);
    });
    server.tool("get_location_type_by_id", "Get a location type by its ID. Requires API_TOKEN and API_STORE_ID env vars.", {
        id: z.number().int().positive().describe("Location type ID"),
    }, async ({ id }) => {
        const result = await apiRequest(`/location-types/${id}`);
        return toContent(result);
    });
    server.tool("update_location_type", "Update a location type's name. Requires admin role and API_STORE_ID env var.", {
        id: z.number().int().positive().describe("Location type ID"),
        name: z.string().min(1).optional().describe("New location type name"),
    }, async ({ id, name }) => {
        const result = await apiRequest(`/location-types/${id}`, "PUT", {
            ...(name !== undefined ? { name } : {}),
        });
        return toContent(result);
    });
    server.tool("delete_location_type", "Delete a location type. Fails if any locations are using this type. Requires admin role and API_STORE_ID env var.", {
        id: z.number().int().positive().describe("Location type ID"),
    }, async ({ id }) => {
        const result = await apiRequest(`/location-types/${id}`, "DELETE");
        return toContent(result);
    });
}
