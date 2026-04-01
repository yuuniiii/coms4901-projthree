import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StepsTable } from "./steps-table";

export default async function StepsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch flavor details
  const { data: flavor } = await supabase
    .from("humor_flavors")
    .select("slug")
    .eq("id", id)
    .single();

  // Fetch steps with related information
  const { data: steps, error } = await supabase
    .from("humor_flavor_steps")
    .select(`
      *,
      llm_models (name),
      humor_flavor_step_types (slug)
    `)
    .eq("humor_flavor_id", id)
    .order("order_by", { ascending: true });

  if (error) {
    return <div>Error loading steps: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Link href="/admin/flavors" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Flavors
          </Link>
          <h1 className="text-3xl font-bold">Steps for: {flavor?.slug}</h1>
        </div>
        <Link
          href={`/admin/flavors/${id}/steps/new`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </Link>
      </div>

      <StepsTable steps={steps || []} flavorId={id} />
    </div>
  );
}
