import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Trash2, Edit, ArrowUp, ArrowDown } from "lucide-react";
import { deleteStep, reorderStep } from "./actions";

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

      <div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt (User)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {steps.map((step, index) => (
              <tr key={step.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{step.order_by}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{step.humor_flavor_step_types?.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{step.llm_models?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                  {step.llm_user_prompt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <form action={reorderStep} method="post" className="inline">
                    <input type="hidden" name="id" value={step.id} />
                    <input type="hidden" name="flavorId" value={id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="disabled:opacity-30 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowUp className="w-4 h-4 inline" />
                    </button>
                  </form>
                  <form action={reorderStep} method="post" className="inline">
                    <input type="hidden" name="id" value={step.id} />
                    <input type="hidden" name="flavorId" value={id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === steps.length - 1}
                      className="disabled:opacity-30 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowDown className="w-4 h-4 inline" />
                    </button>
                  </form>
                  <Link
                    href={`/admin/flavors/${id}/steps/${step.id}/edit`}
                    className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-400"
                  >
                    <Edit className="w-4 h-4 inline" />
                  </Link>
                  <form action={deleteStep} method="post" className="inline">
                    <input type="hidden" name="id" value={step.id} />
                    <input type="hidden" name="flavorId" value={id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      onClick={(e) => {
                        if (!confirm("Are you sure you want to delete this step?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {steps.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No steps found for this flavor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
