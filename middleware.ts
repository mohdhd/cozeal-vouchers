import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Admin routes (we'll handle admin separately without i18n)
  matcher: [
    // Match all pathnames except for
    "/((?!api|_next|_vercel|admin|.*\\..*).*)",
    // Match root
    "/",
  ],
};
