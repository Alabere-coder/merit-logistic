"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import type { UserRole } from "@/types/app";

type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setUser(null);
          return;
        }

        const { data: profile, error } = await supabase
          .from("users")
          .select(
            "id, first_name, last_name, email, role, is_active"
          )
          .eq("id", authUser.id)
          .single();

        if (error || !profile) {
          console.error("LOAD CURRENT USER ERROR:", error);
          setUser(null);
          return;
        }

        if (!profile.is_active) {
          setUser(null);
          return;
        }

        setUser({
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          role: profile.role as UserRole,
          isActive: profile.is_active,
        });
      } catch (error) {
        console.error("CURRENT USER ERROR:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    isLoggedIn: !!user,
  };
}