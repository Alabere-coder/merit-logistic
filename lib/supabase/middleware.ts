import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT:
  // Refresh/validate the Supabase session.
  await supabase.auth.getUser();

  return response;
}

// import { createServerClient, type CookieOptions } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";
// import type { Database } from "@/types/database";

// export async function updateSession(request: NextRequest) {
//   let response = NextResponse.next({
//     request: { headers: request.headers },
//   });

//   const supabase = createServerClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return request.cookies.get(name)?.value;
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           request.cookies.set({ name, value, ...options });
//           response = NextResponse.next({ request: { headers: request.headers } });
//           response.cookies.set({ name, value, ...options });
//         },
//         remove(name: string, options: CookieOptions) {
//           request.cookies.set({ name, value: "", ...options });
//           response = NextResponse.next({ request: { headers: request.headers } });
//           response.cookies.set({ name, value: "", ...options });
//         },
//       },
//     }
//   );

//   // Refresh the session if expired — required for Server Components,
//   // which can only read cookies, not write them.
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   return { response, user, supabase };
// }
