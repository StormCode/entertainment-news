import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  // Fail closed: if env var is missing, block rather than allow
  if (!password) {
    return new NextResponse("503 — ADMIN_PASSWORD 環境變數未設定", { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    // Extract password (everything after the first colon, allowing colons in the password)
    const colonIdx = decoded.indexOf(":");
    const supplied = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : decoded;
    if (supplied === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("401 Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="散場之後管理後台", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
