"use server";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type ActionState = {
  error?: string;
  success?: string;
};

/**
 * Customer self-signup.
 *
 * Customers can create their own accounts.
 * Drivers and admins cannot be created through this action.
 */
export async function signUp(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
  } = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`,
      data: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        role: "customer",
      },
    },
  });

  if (error) {
    console.error("Signup error:", error);

    return {
      error: error.message,
    };
  }

  return {
    success:
      "Account created. Check your email to verify your address.",
  };
}

/**
 * Login
 */
export async function logIn(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: "Incorrect email or password.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unable to retrieve your account.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error(
      "Unable to load user profile:",
      profileError
    );

    return {
      error: "Unable to load your user profile.",
    };
  }

  revalidatePath("/", "layout");

  if (profile.role === "admin") {
    redirect("/admin");
  }

  if (profile.role === "driver") {
    redirect("/driver");
  }

  redirect("/customer");
}

/**
 * Logout
 */
export async function logOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");

  redirect("/login");
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return {
      error: "Please enter your email address.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    console.error("PASSWORD RESET ERROR:", error);

    return {
      error: error.message,
    };
  }

  return {
    success:
      "If an account exists with that email, we've sent a password reset link.",
  };
}

/**
 * Reset password
 */
export async function resetPassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect("/login?reset=success");
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(
  email: string
): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: "Verification email sent.",
  };
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return {
      error: "Please fill in all password fields.",
    };
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      error: "Please fill in all password fields.",
    };
  }

  if (newPassword.length < 8) {
    return {
      error: "New password must be at least 8 characters.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      error: "New passwords do not match.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      error: "You must be logged in.",
    };
  }

  // Verify current password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return {
      error: "Your current password is incorrect.",
    };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("PASSWORD UPDATE ERROR:", updateError);

    return {
      error: updateError.message,
    };
  }

  return {
    success: "Password changed successfully.",
  };
}