import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LTL26_SUNSET_REDIRECT_URL } from "@/lib/sunset-redirect";

/** Festival site retired — permanent redirect to The Associated Guess (TAG). */
export function middleware(_request: NextRequest) {
  return NextResponse.redirect(LTL26_SUNSET_REDIRECT_URL, 308);
}

export const config = {
  matcher: "/:path*",
};
