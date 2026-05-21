import { authHeaders } from "./tools/auth.js";

const BASE_URL = process.env.API_URL ?? "http://localhost:3000";

export async function apiRequest(
  path: string,
  method: string = "GET",
  body?: unknown
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const responseBody = await res.json().catch(() => null);
  return { status: res.status, body: responseBody };
}

export function toContent(result: { status: number; body: unknown }) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ status: result.status, body: result.body }, null, 2),
      },
    ],
  };
}
