import { NextRequest, NextResponse } from "next/server";

const origin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

export function middleware(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new NextResponse(null, { status: 204, headers });
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
}

export const config = { matcher: "/api/:path*" };
