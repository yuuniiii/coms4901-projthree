"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin-check";

export async function createFlavor(formData: FormData) {
  const { supabase } = await checkAdmin();
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase.from("humor_flavors").insert({
    slug,
    description,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/flavors");
  redirect("/admin/flavors");
}

export async function updateFlavor(formData: FormData) {
  const { supabase } = await checkAdmin();
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("humor_flavors")
    .update({ slug, description })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/flavors");
  redirect("/admin/flavors");
}

export async function deleteFlavor(formData: FormData) {
  const { supabase } = await checkAdmin();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("humor_flavors").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/flavors");
}
