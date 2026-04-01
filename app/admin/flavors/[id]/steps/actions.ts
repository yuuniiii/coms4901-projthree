"use client";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteStep(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const flavorId = formData.get("flavorId") as string;

  const { error } = await supabase.from("humor_flavor_steps").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/flavors/${flavorId}/steps`);
}

export async function reorderStep(formData: FormData) {
  const supabase = await createClient();
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
