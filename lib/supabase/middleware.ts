import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const redirectTo = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    return NextResponse.redirect(url);
  };

  const isAdminArea = path.startsWith("/admin") && path !== "/admin/login";
  const isSellerArea = path.startsWith("/seller");
  const isCustomerArea = path.startsWith("/customer");
  const isLandingPage = path === "/";

  // Not logged in: only the landing/login page and /admin/login are open
  if (!user) {
    if (isAdminArea || isSellerArea || isCustomerArea) return redirectTo("/");
    return response;
  }

  // Logged in and visiting the login page: send them into the app
  if (isLandingPage) return redirectTo("/customer");

  // Logged in: check role only where it matters
  if (isAdminArea || isSellerArea) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "customer";

    // Everyone logged in can open the "become a seller" form
    const isBecomeSeller = path.startsWith("/seller/business");

    if (isAdminArea && role !== "admin") return redirectTo("/customer");
    if (isSellerArea && !isBecomeSeller && role !== "seller" && role !== "admin") {
      return redirectTo("/customer");
    }
  }

  return response;
}