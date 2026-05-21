import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerStoreTools } from "./tools/store.js";
import { registerUserTools } from "./tools/user.js";
import { registerLocationTypeTools } from "./tools/location-type.js";
import { registerLocationTools } from "./tools/location.js";
import { registerMovementTypeTools } from "./tools/movement-type.js";
import { registerProductTools } from "./tools/products.js";
import { registerMovementTools } from "./tools/movements.js";
import { registerStatsTools } from "./tools/stats.js";
export function createServer() {
    const server = new McpServer({
        name: "inventory-api",
        version: "1.0.0",
    });
    registerAuthTools(server);
    registerStoreTools(server);
    registerUserTools(server);
    registerLocationTypeTools(server);
    registerLocationTools(server);
    registerMovementTypeTools(server);
    registerProductTools(server);
    registerMovementTools(server);
    registerStatsTools(server);
    return server;
}
