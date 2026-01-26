import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ["/home", "/course-setup", "/score-entry"];

  // อนุญาตให้ผ่านถ้ามี hash fragment (OAuth callback)
  // เพราะ Google OAuth จะ redirect กลับมาพร้อม #access_token
  const hasAuthFragment = request.nextUrl.hash.includes("access_token");

  // ถ้ายังไม่ login และพยายามเข้า protected routes
  // แต่ถ้ามี auth fragment ให้ผ่านไปก่อน
  if (
    protectedPaths.some((path) => pathname.startsWith(path)) &&
    !user &&
    !hasAuthFragment
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ถ้า login แล้วและเข้าหน้า login → redirect ไป /home
  if (pathname === "/" && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|auth/callback).*)"],
};
