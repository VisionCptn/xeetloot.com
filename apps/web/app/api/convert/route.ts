import { NextRequest } from "next/server";
import { callApi } from "@/lib/api-client";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const res = await callApi("/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json" } });
}
