import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Récupération de la session
    const { data } = await supabase.auth.getSession()

    // Vérification des routes protégées (sans admin)
    const protectedRoutes = ["/dashboard", "/account/settings"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute && !data.session) {
      const redirectUrl = new URL("/account/login", request.url)
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // En cas d'erreur, on continue sans bloquer la navigation
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/account/:path*", "/dashboard/:path*"],
}
