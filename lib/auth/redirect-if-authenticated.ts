import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function redirectIfAuthenticated() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return;
  }

  if (!profile.is_active) {
    return;
  }

  switch (profile.role) {
    case "admin":
      redirect("/admin");

    case "driver":
      redirect("/driver");

    case "customer":
    default:
      redirect("/customer");
  }
}
