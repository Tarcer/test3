import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()

  // Créer un client spécifique au middleware
  const supabase = createMiddlewareClient({ req: request, res })

  // Vérifier la session
  const { data } = await supabase.auth.getSession()

  // Vérifier si l'utilisateur est authentifié pour les routes protégées
  const protectedRoutes = ["/dashboard", "/account/settings", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !data.session) {
    const redirectUrl = new URL("/account/login", request.url)
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/dashboard/:path*"],
}
