import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "./server.js";

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const key = req.headers["x-api-key"];
  if (process.env.MCP_API_KEY && key !== process.env.MCP_API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

app.post("/mcp", async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await createServer().connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = Number(process.env.MCP_PORT ?? 3001);
app.listen(port, () => console.log(`MCP HTTP Server running on port ${port}`));
