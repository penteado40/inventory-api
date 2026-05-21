import { apiRequest, toContent } from "../client.js";
export function registerStatsTools(server) {
    server.tool("get_stats_movements", "Retorna estatísticas agregadas de movimentações da loja ativa.", {}, async () => {
        const result = await apiRequest("/stats/movements");
        return toContent(result);
    });
    server.tool("get_stats_products", "Retorna estatísticas agregadas de produtos da loja ativa.", {}, async () => {
        const result = await apiRequest("/stats/products");
        return toContent(result);
    });
}
