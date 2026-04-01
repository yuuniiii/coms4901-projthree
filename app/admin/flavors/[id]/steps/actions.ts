"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin-check";

export async function createStep(formData: FormData) {
  const { supabase } = await checkAdmin();
  const humor_flavor_id = formData.get("flavorId") as string;
  const llm_model_id = formData.get("llm_model_id") as string;
  const humor_flavor_step_type_id = formData.get("humor_flavor_step_type_id") as string;
  const llm_input_type_id = formData.get("llm_input_type_id") as string;
  const llm_output_type_id = formData.get("llm_output_type_id") as string;
  const llm_temperature = formData.get("llm_temperature") as string;
  const llm_system_prompt = formData.get("llm_system_prompt") as string;
  const llm_user_prompt = formData.get("llm_user_prompt") as string;
  const description = formData.get("description") as string;

  // Get current max order_by
  const { data: maxStep } = await supabase
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", humor_flavor_id)
    .order("order_by", { ascending: false })
    .limit(1)
    .single();

  const order_by = (maxStep?.order_by ?? 0) + 1;

  const { error } = await supabase.from("humor_flavor_steps").insert({
    humor_flavor_id: parseInt(humor_flavor_id),
    llm_model_id: parseInt(llm_model_id),
    humor_flavor_step_type_id: parseInt(humor_flavor_step_type_id),
    llm_input_type_id: parseInt(llm_input_type_id),
    llm_output_type_id: parseInt(llm_output_type_id),
    llm_temperature: parseFloat(llm_temperature),
    llm_system_prompt,
    llm_user_prompt,
    description,
    order_by,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/flavors/${humor_flavor_id}/steps`);
  redirect(`/admin/flavors/${humor_flavor_id}/steps`);
}

export async function updateStep(formData: FormData) {
  const { supabase } = await checkAdmin();
  const id = formData.get("id") as string;
  const humor_flavor_id = formData.get("flavorId") as string;
  const llm_model_id = formData.get("llm_model_id") as string;
  const humor_flavor_step_type_id = formData.get("humor_flavor_step_type_id") as string;
  const llm_input_type_id = formData.get("llm_input_type_id") as string;
  const llm_output_type_id = formData.get("llm_output_type_id") as string;
  const llm_temperature = formData.get("llm_temperature") as string;
  const llm_system_prompt = formData.get("llm_system_prompt") as string;
  const llm_user_prompt = formData.get("llm_user_prompt") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("humor_flavor_steps")
    .update({
      llm_model_id: parseInt(llm_model_id),
      humor_flavor_step_type_id: parseInt(humor_flavor_step_type_id),
      llm_input_type_id: parseInt(llm_input_type_id),
      llm_output_type_id: parseInt(llm_output_type_id),
      llm_temperature: parseFloat(llm_temperature),
      llm_system_prompt,
      llm_user_prompt,
      description,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/flavors/${humor_flavor_id}/steps`);
  redirect(`/admin/flavors/${humor_flavor_id}/steps`);
}

export async function deleteStep(formData: FormData) {
  const { supabase } = await checkAdmin();
  const id = formData.get("id") as string;
  const flavorId = formData.get("flavorId") as string;

  const { error } = await supabase.from("humor_flavor_steps").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/flavors/${flavorId}/steps`);
}

export async function reorderStep(formData: FormData) {
  const { supabase } = await checkAdmin();
  const id = formData.get("id") as string;
  const flavorId = formData.get("flavorId") as string;
  const direction = formData.get("direction") as "up" | "down";

  // Get all steps for this flavor to calculate new order
  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("id, order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: true });

  if (!steps) return;

  const currentIndex = steps.findIndex((s) => s.id.toString() === id);
  if (currentIndex === -1) return;

  const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (newIndex < 0 || newIndex >= steps.length) return;

  const currentStep = steps[currentIndex];
  const targetStep = steps[newIndex];

  // Swap order_by values
  const { error: error1 } = await supabase
    .from("humor_flavor_steps")
    .update({ order_by: targetStep.order_by })
    .eq("id", currentStep.id);

  const { error: error2 } = await supabase
    .from("humor_flavor_steps")
    .update({ order_by: currentStep.order_by })
    .eq("id", targetStep.id);

  if (error1 || error2) throw new Error("Failed to reorder");

  revalidatePath(`/admin/flavors/${flavorId}/steps`);
}
