import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/app";

function isUserRole(role: string): role is UserRole {
  return (
    role === "customer" ||
    role === "driver" ||
    role === "admin"
  );
}

/**
 * Verifies the current session belongs to a user with one of the allowed roles.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, role, is_active")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    redirect("/login?error=account_deactivated");
  }

  // Make sure the database value is actually one of our allowed roles.
  if (!isUserRole(profile.role)) {
    console.error("Invalid user role:", profile.role);
    redirect("/login");
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect("/login");
  }

  return {
    user,
    profile: {
      ...profile,
      role: profile.role,
    },
    supabase,
  };
}
