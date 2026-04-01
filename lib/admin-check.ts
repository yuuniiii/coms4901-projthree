import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";

export async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Please login.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .single();

  if (!profile || (!profile.is_superadmin && !profile.is_matrix_admin)) {
    throw new Error("Unauthorized: Admin access required.");
  }

  return { supabase, user };
}
