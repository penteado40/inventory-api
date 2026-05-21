import { z } from "zod";
const BASE_URL = process.env.API_URL ?? "http://localhost:3000";
let accessToken = null;
export function setAccessToken(token) {
    accessToken = token;
}
export function authHeaders() {
    return {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
}
async function apiRequest(path, method = "GET", body) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: authHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const responseBody = await res.json().catch(() => null);
    return { status: res.status, body: responseBody };
}
function toContent(result) {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({ status: result.status, body: result.body }, null, 2),
            },
        ],
    };
}
export function registerAuthTools(server) {
    server.tool("login", "Authenticate with email and password. The returned accessToken is automatically stored in memory for all subsequent tool calls.", {
        email: z.string().email().describe("User email"),
        password: z.string().min(8).describe("User password (min 8 characters)"),
    }, async ({ email, password }) => {
        const result = await apiRequest("/auth/login", "POST", { email, password });
        if (result.status === 200 && result.body && typeof result.body === "object") {
            const body = result.body;
            const data = body.data;
            const token = data?.accessToken ?? body.accessToken;
            if (token && typeof token === "string") {
                setAccessToken(token);
            }
        }
        return toContent(result);
    });
    server.tool("refresh_token", "Exchange a refresh token for a new access token and refresh token pair. The new accessToken is automatically stored in memory.", {
        token: z.string().min(1).describe("The refresh token to exchange"),
    }, async ({ token }) => {
        const result = await apiRequest("/auth/refresh", "POST", { token });
        if (result.status === 200 && result.body && typeof result.body === "object") {
            const body = result.body;
            const data = body.data;
            const newToken = data?.accessToken ?? body.accessToken;
            if (newToken && typeof newToken === "string") {
                setAccessToken(newToken);
            }
        }
        return toContent(result);
    });
    server.tool("logout", "Invalidate the current user's refresh tokens. Requires prior login.", {}, async () => {
        const result = await apiRequest("/auth/logout", "POST");
        return toContent(result);
    });
    server.tool("switch_store", "Switch store context for admin users. Generates a new access token scoped to the selected store. The new token is automatically stored in memory.", {
        storeId: z.number().int().positive().describe("ID of the store to switch to"),
    }, async ({ storeId }) => {
        const result = await apiRequest("/auth/switch-store", "POST", { storeId });
        if (result.status === 200 && result.body && typeof result.body === "object") {
            const body = result.body;
            const data = body.data;
            const token = data?.accessToken ?? body.accessToken;
            if (token && typeof token === "string") {
                setAccessToken(token);
            }
        }
        return toContent(result);
    });
}
