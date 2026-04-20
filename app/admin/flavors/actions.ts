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

export async function duplicateFlavor(sourceFlavorId: string, newSlug: string) {
  try {
    const { supabase } = await checkAdmin();

    if (!newSlug) {
      return { success: false, error: "New slug is required" };
    }

    // Check if new slug is already taken
    const { data: existingFlavor } = await supabase
      .from("humor_flavors")
      .select("id")
      .eq("slug", newSlug)
      .single();

    if (existingFlavor) {
      return { success: false, error: "Slug already exists" };
    }

    // Fetch the source flavor row
    const { data: sourceFlavor, error: fetchFlavorError } = await supabase
      .from("humor_flavors")
      .select("*")
      .eq("id", sourceFlavorId)
      .single();

    if (fetchFlavorError || !sourceFlavor) {
      return { success: false, error: "Source flavor not found" };
    }

    // Fetch all its steps
    const { data: sourceSteps, error: fetchStepsError } = await supabase
      .from("humor_flavor_steps")
      .select("*")
      .eq("humor_flavor_id", sourceFlavorId)
      .order("order_by", { ascending: true });

    if (fetchStepsError) {
      return { success: false, error: "Failed to fetch source steps" };
    }

    // Insert the new flavor row
    const { data: newFlavor, error: insertFlavorError } = await supabase
      .from("humor_flavors")
      .insert({
        slug: newSlug,
        description: sourceFlavor.description,
      })
      .select()
      .single();

    if (insertFlavorError || !newFlavor) {
      return { success: false, error: `Failed to create new flavor: ${insertFlavorError?.message}` };
    }

    // Insert copies of all step rows if any
    if (sourceSteps && sourceSteps.length > 0) {
      const stepsToInsert = sourceSteps.map((step) => ({
        humor_flavor_id: newFlavor.id,
        llm_temperature: step.llm_temperature,
        order_by: step.order_by,
        llm_input_type_id: step.llm_input_type_id,
        llm_output_type_id: step.llm_output_type_id,
        llm_model_id: step.llm_model_id,
        humor_flavor_step_type_id: step.humor_flavor_step_type_id,
        llm_system_prompt: step.llm_system_prompt,
        llm_user_prompt: step.llm_user_prompt,
        description: step.description,
      }));

      const { error: insertStepsError } = await supabase
        .from("humor_flavor_steps")
        .insert(stepsToInsert);

      if (insertStepsError) {
        // Cleanup the created flavor if steps fail
        await supabase.from("humor_flavors").delete().eq("id", newFlavor.id);
        return { success: false, error: `Failed to copy steps: ${insertStepsError.message}` };
      }
    }

    revalidatePath("/admin/flavors");
    return { success: true, newFlavorId: String(newFlavor.id) };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}
