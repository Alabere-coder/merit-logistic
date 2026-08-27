"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";

type CreateAdminInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
};

export async function createAdmin(input: CreateAdminInput) {
  try {
    // Make sure someone is logged in and is an admin
    const { user, supabase } = await requireRole(["admin"]);

    // Get the current admin's database profile
    const { data: currentAdmin, error: currentAdminError } = await supabase
      .from("users")
      .select("id, role, is_super_admin")
      .eq("id", user.id)
      .single();

    if (currentAdminError || !currentAdmin) {
      console.error("CURRENT ADMIN LOOKUP ERROR:", currentAdminError);

      return {
        error: "Admin profile not found.",
      };
    }

    // Only the Top Admin can create another admin
    if (
      currentAdmin.role !== "admin" ||
      currentAdmin.is_super_admin !== true
    ) {
      return {
        error: "Only the Top Admin can create another admin.",
      };
    }

    // Basic validation
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const email = input.email.trim().toLowerCase();
    const phoneNumber = input.phoneNumber?.trim() || null;

    if (!firstName || !lastName || !email || !input.password) {
      return {
        error: "Please fill in all required fields.",
      };
    }

    if (input.password.length < 8) {
      return {
        error: "Password must be at least 8 characters.",
      };
    }

    // Use the service-role client for Auth operations
    const adminSupabase = createAdminClient();

    // Create Supabase Auth user
    const {
      data: authData,
      error: authError,
    } = await adminSupabase.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        role: "admin",
      },
    });

    if (authError || !authData.user) {
      console.error("CREATE ADMIN AUTH ERROR:", authError);

      return {
        error: authError?.message ?? "Unable to create admin account.",
      };
    }

    // Create the public.users profile
   // The handle_new_user() database trigger should have
// already created the public.users profile.

const { data: createdProfile, error: profileError } =
  await adminSupabase
    .from("users")
    .select("id")
    .eq("id", authData.user.id)
    .single();

if (profileError || !createdProfile) {
  console.error("CREATE ADMIN PROFILE ERROR:", profileError);

  // Clean up the Auth account if the profile was not created.
  await adminSupabase.auth.admin.deleteUser(authData.user.id);

  return {
    error: "Admin profile could not be created.",
  };
}

// Make absolutely sure this account is a normal admin.
// It must NOT become a Top Admin.
const { error: updateProfileError } = await adminSupabase
  .from("users")
  .update({
    first_name: firstName,
    last_name: lastName,
    email,
    phone_number: phoneNumber,
    role: "admin",
    is_active: true,
    is_super_admin: false,
  })
  .eq("id", authData.user.id);

if (updateProfileError) {
  console.error(
    "UPDATE ADMIN PROFILE ERROR:",
    updateProfileError
  );

  await adminSupabase.auth.admin.deleteUser(authData.user.id);

  return {
    error: "Admin profile could not be configured.",
  };
}

    revalidatePath("/admin/users");
    revalidatePath("/admin/users/admins");

    return {
      success: true,
      adminId: authData.user.id,
    };
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);

    return {
      error: "Unable to create admin.",
    };
  }
}

// ADMIN UPDATING SECTION

export async function updateAdmin(
  adminId: string,
  input: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }
) {
  try {
    const { user, supabase } = await requireRole(["admin"]);

    // Verify the current user is the Top Admin
    const { data: currentAdmin, error: currentAdminError } =
      await supabase
        .from("users")
        .select("id, role, is_super_admin")
        .eq("id", user.id)
        .single();

    if (currentAdminError || !currentAdmin) {
      return {
        error: "Admin profile not found.",
      };
    }

    if (
      currentAdmin.role !== "admin" ||
      currentAdmin.is_super_admin !== true
    ) {
      return {
        error: "Only the Top Admin can update administrators.",
      };
    }

    // Find the admin being updated
    const { data: targetAdmin, error: targetError } = await supabase
      .from("users")
      .select("id, role, is_super_admin")
      .eq("id", adminId)
      .single();

    if (targetError || !targetAdmin) {
      return {
        error: "Administrator not found.",
      };
    }

    if (targetAdmin.role !== "admin") {
      return {
        error: "The selected user is not an administrator.",
      };
    }

    // Never allow the Top Admin to be modified through this action
    if (targetAdmin.is_super_admin) {
      return {
        error: "The Top Admin cannot be modified.",
      };
    }

    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const phoneNumber = input.phoneNumber?.trim() || null;

    if (!firstName || !lastName) {
      return {
        error: "First name and last name are required.",
      };
    }

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      })
      .eq("id", adminId)
      .eq("role", "admin")
      .eq("is_super_admin", false);

    if (error) {
      console.error("UPDATE ADMIN ERROR:", error);

      return {
        error: error.message,
      };
    }

    revalidatePath("/admin/users/admins");

    return {
      success: true,
    };
  } catch (error) {
    console.error("UPDATE ADMIN ERROR:", error);

    return {
      error: "Unable to update administrator.",
    };
  }
}

// deactivate admin account

export async function deactivateAdmin(adminId: string) {
  try {
    const { user, supabase } = await requireRole(["admin"]);

    // Get current admin
    const { data: currentAdmin, error: currentAdminError } =
      await supabase
        .from("users")
        .select("id, role, is_super_admin")
        .eq("id", user.id)
        .single();

    if (currentAdminError || !currentAdmin) {
      return {
        error: "Admin profile not found.",
      };
    }

    // Only Top Admin can deactivate admins
    if (
      currentAdmin.role !== "admin" ||
      currentAdmin.is_super_admin !== true
    ) {
      return {
        error: "Only the Top Admin can deactivate administrators.",
      };
    }

    // Get target admin
    const { data: targetAdmin, error: targetError } = await supabase
      .from("users")
      .select("id, role, is_super_admin, is_active")
      .eq("id", adminId)
      .single();

    if (targetError || !targetAdmin) {
      return {
        error: "Administrator not found.",
      };
    }

    if (targetAdmin.role !== "admin") {
      return {
        error: "The selected user is not an administrator.",
      };
    }

    // Protect Top Admin
    if (targetAdmin.is_super_admin) {
      return {
        error: "The Top Admin cannot be deactivated.",
      };
    }

    if (!targetAdmin.is_active) {
      return {
        error: "This administrator is already inactive.",
      };
    }

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("users")
      .update({
        is_active: false,
      })
      .eq("id", adminId)
      .eq("role", "admin")
      .eq("is_super_admin", false);

    if (error) {
      console.error("DEACTIVATE ADMIN ERROR:", error);

      return {
        error: error.message,
      };
    }

    revalidatePath("/admin/users/admins");

    return {
      success: true,
    };
  } catch (error) {
    console.error("DEACTIVATE ADMIN ERROR:", error);

    return {
      error: "Unable to deactivate administrator.",
    };
  }
}

// reactivate admin account

export async function reactivateAdmin(adminId: string) {
  try {
    const { user, supabase } = await requireRole(["admin"]);

    const { data: currentAdmin, error: currentAdminError } =
      await supabase
        .from("users")
        .select("id, role, is_super_admin")
        .eq("id", user.id)
        .single();

    if (currentAdminError || !currentAdmin) {
      return {
        error: "Admin profile not found.",
      };
    }

    if (
      currentAdmin.role !== "admin" ||
      currentAdmin.is_super_admin !== true
    ) {
      return {
        error: "Only the Top Admin can reactivate administrators.",
      };
    }

    const { data: targetAdmin, error: targetError } = await supabase
      .from("users")
      .select("id, role, is_super_admin, is_active")
      .eq("id", adminId)
      .single();

    if (targetError || !targetAdmin) {
      return {
        error: "Administrator not found.",
      };
    }

    if (targetAdmin.role !== "admin") {
      return {
        error: "The selected user is not an administrator.",
      };
    }

    if (targetAdmin.is_super_admin) {
      return {
        error: "The Top Admin does not need to be reactivated.",
      };
    }

    if (targetAdmin.is_active) {
      return {
        error: "This administrator is already active.",
      };
    }

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("users")
      .update({
        is_active: true,
      })
      .eq("id", adminId)
      .eq("role", "admin")
      .eq("is_super_admin", false);

    if (error) {
      console.error("REACTIVATE ADMIN ERROR:", error);

      return {
        error: error.message,
      };
    }

    revalidatePath("/admin/users/admins");

    return {
      success: true,
    };
  } catch (error) {
    console.error("REACTIVATE ADMIN ERROR:", error);

    return {
      error: "Unable to reactivate administrator.",
    };
  }
}