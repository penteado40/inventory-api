import { z } from "zod";
import { apiRequest, toContent } from "../client.js";
export function registerMovementTools(server) {
    server.tool("list_movements", "List all movements for the current store. Requires API_TOKEN and API_STORE_ID env vars. Optional filters: status, movementTypeId, search by code/requester.", {
        status: z.enum(["preparando", "enviado", "entregue"]).optional().describe("Filter by movement status"),
        movementTypeId: z.number().int().positive().optional().describe("Filter by movement type ID"),
        q: z.string().optional().describe("Search by code or requester"),
    }, async ({ status, movementTypeId, q }) => {
        const params = new URLSearchParams();
        if (status)
            params.set("status", status);
        if (movementTypeId !== undefined)
            params.set("movementTypeId", String(movementTypeId));
        if (q)
            params.set("q", q);
        const query = params.size ? `?${params}` : "";
        const result = await apiRequest(`/movements${query}`);
        return toContent(result);
    });
    server.tool("create_movement", "Create a new movement for the current store. Requires admin or operator role and API_STORE_ID env var. Required: movementTypeId, requester, movedAt.", {
        movementTypeId: z.number().int().positive().describe("Movement type ID (required)"),
        requester: z.string().min(1).describe("Name of the requester (required)"),
        movedAt: z.string().datetime().describe("Movement datetime (ISO 8601, required)"),
        notes: z.string().optional().describe("Optional notes"),
    }, async ({ movementTypeId, requester, movedAt, notes }) => {
        const result = await apiRequest("/movements", "POST", {
            movementTypeId,
            requester,
            movedAt,
            ...(notes !== undefined ? { notes } : {}),
        });
        return toContent(result);
    });
    server.tool("get_movement_by_id", "Get a movement by its ID including items and payments. Requires API_TOKEN and API_STORE_ID env vars.", {
        id: z.number().int().positive().describe("Movement ID"),
    }, async ({ id }) => {
        const result = await apiRequest(`/movements/${id}`);
        return toContent(result);
    });
    server.tool("update_movement", "Update a movement's fields. Requires admin or operator role and API_STORE_ID env var.", {
        id: z.number().int().positive().describe("Movement ID"),
        requester: z.string().min(1).optional().describe("Name of the requester"),
        movedAt: z.string().datetime().optional().describe("Movement datetime (ISO 8601)"),
        status: z.enum(["preparando", "enviado", "entregue"]).optional().describe("Movement status"),
        notes: z.string().optional().describe("Optional notes"),
    }, async ({ id, requester, movedAt, status, notes }) => {
        const result = await apiRequest(`/movements/${id}`, "PUT", {
            ...(requester !== undefined ? { requester } : {}),
            ...(movedAt !== undefined ? { movedAt } : {}),
            ...(status !== undefined ? { status } : {}),
            ...(notes !== undefined ? { notes } : {}),
        });
        return toContent(result);
    });
    server.tool("delete_movement", "Cancel a movement and revert its items. Requires admin role and API_STORE_ID env var.", {
        id: z.number().int().positive().describe("Movement ID"),
    }, async ({ id }) => {
        const result = await apiRequest(`/movements/${id}`, "DELETE");
        return toContent(result);
    });
    server.tool("add_movement_item", "Add an item to a movement. Requires admin or operator role and API_STORE_ID env var. Required: productId, quantity, productValue, paidValue.", {
        id: z.number().int().positive().describe("Movement ID"),
        productId: z.number().int().positive().describe("Product ID (required)"),
        quantity: z.number().int().positive().describe("Quantity (required, minimum 1)"),
        productValue: z.number().int().nonnegative().describe("Product value in cents (required)"),
        paidValue: z.number().int().nonnegative().describe("Paid value in cents (required, must be <= productValue)"),
    }, async ({ id, productId, quantity, productValue, paidValue }) => {
        const result = await apiRequest(`/movements/${id}/items`, "POST", {
            productId,
            quantity,
            productValue,
            paidValue,
        });
        return toContent(result);
    });
    server.tool("update_movement_item", "Update an item in a movement. Requires admin or operator role and API_STORE_ID env var. paidValue must be <= productValue.", {
        id: z.number().int().positive().describe("Movement ID"),
        itemId: z.number().int().positive().describe("Item ID"),
        quantity: z.number().int().positive().optional().describe("New quantity"),
        productValue: z.number().int().nonnegative().optional().describe("New product value in cents"),
        paidValue: z.number().int().nonnegative().optional().describe("New paid value in cents (must be <= productValue)"),
    }, async ({ id, itemId, quantity, productValue, paidValue }) => {
        const result = await apiRequest(`/movements/${id}/items/${itemId}`, "PUT", {
            ...(quantity !== undefined ? { quantity } : {}),
            ...(productValue !== undefined ? { productValue } : {}),
            ...(paidValue !== undefined ? { paidValue } : {}),
        });
        return toContent(result);
    });
    server.tool("delete_movement_item", "Remove an item from a movement. Requires admin role and API_STORE_ID env var.", {
        id: z.number().int().positive().describe("Movement ID"),
        itemId: z.number().int().positive().describe("Item ID"),
    }, async ({ id, itemId }) => {
        const result = await apiRequest(`/movements/${id}/items/${itemId}`, "DELETE");
        return toContent(result);
    });
    server.tool("add_movement_payment", "Register a payment for a movement. Requires admin or operator role and API_STORE_ID env var. Required: amount, paidAt.", {
        id: z.number().int().positive().describe("Movement ID"),
        amount: z.number().int().positive().describe("Payment amount in cents (required)"),
        paidAt: z.string().datetime().describe("Payment datetime (ISO 8601, required)"),
        notes: z.string().optional().describe("Optional payment notes"),
    }, async ({ id, amount, paidAt, notes }) => {
        const result = await apiRequest(`/movements/${id}/payments`, "POST", {
            amount,
            paidAt,
            ...(notes !== undefined ? { notes } : {}),
        });
        return toContent(result);
    });
}
