import { NextRequest } from "next/server";
import { callApi } from "@/lib/api-client";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")?.trim() ?? "";
  const turnstileToken = request.nextUrl.searchParams.get("turnstileToken") ?? "";

  const qs = new URLSearchParams({ url, turnstileToken });
  const res = await callApi(`/resolve?${qs.toString()}`, {
    headers: { "CF-Connecting-IP": request.headers.get("CF-Connecting-IP") ?? "" },
  });

  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": "application/json", "X-Resolve-Cache": res.headers.get("X-Resolve-Cache") ?? "" },
  });
}
