import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateStep } from "../../actions";

export default async function EditStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;
  const supabase = await createClient();

  // Fetch reference data
  const { data: models } = await supabase.from("llm_models").select("id, name");
  const { data: stepTypes } = await supabase.from("humor_flavor_step_types").select("id, slug");
  const { data: inputTypes } = await supabase.from("llm_input_types").select("id, slug");
  const { data: outputTypes } = await supabase.from("llm_output_types").select("id, slug");
  
  const { data: step } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("id", stepId)
    .single();

  if (!step) {
    notFound();
  }

  const { data: flavor } = await supabase.from("humor_flavors").select("slug").eq("id", id).single();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link href={`/admin/flavors/${id}/steps`} className="text-sm text-blue-600 hover:underline">
          &larr; Back to Steps
        </Link>
        <h1 className="text-3xl font-bold">Edit Step in: {flavor?.slug}</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border dark:border-gray-800 shadow">
        <form action={updateStep} className="space-y-6">
          <input type="hidden" name="id" value={stepId} />
          <input type="hidden" name="flavorId" value={id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Step Type</label>
              <select name="humor_flavor_step_type_id" defaultValue={step.humor_flavor_step_type_id} className="w-full p-2 border rounded bg-white dark:bg-gray-800" required>
                {stepTypes?.map(t => <option key={t.id} value={t.id}>{t.slug}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LLM Model</label>
              <select name="llm_model_id" defaultValue={step.llm_model_id} className="w-full p-2 border rounded bg-white dark:bg-gray-800" required>
                {models?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Input Type</label>
              <select name="llm_input_type_id" defaultValue={step.llm_input_type_id} className="w-full p-2 border rounded bg-white dark:bg-gray-800" required>
                {inputTypes?.map(t => <option key={t.id} value={t.id}>{t.slug}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Output Type</label>
              <select name="llm_output_type_id" defaultValue={step.llm_output_type_id} className="w-full p-2 border rounded bg-white dark:bg-gray-800" required>
                {outputTypes?.map(t => <option key={t.id} value={t.id}>{t.slug}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Temperature (0.0 - 1.0)</label>
              <input type="number" name="llm_temperature" step="0.1" min="0" max="1" defaultValue={step.llm_temperature} className="w-full p-2 border rounded bg-white dark:bg-gray-800" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input type="text" name="description" defaultValue={step.description || ""} className="w-full p-2 border rounded bg-white dark:bg-gray-800" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">System Prompt</label>
            <textarea name="llm_system_prompt" rows={4} defaultValue={step.llm_system_prompt || ""} className="w-full p-2 border rounded bg-white dark:bg-gray-800 font-mono text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">User Prompt</label>
            <textarea name="llm_user_prompt" rows={6} defaultValue={step.llm_user_prompt || ""} className="w-full p-2 border rounded bg-white dark:bg-gray-800 font-mono text-sm" required />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href={`/admin/flavors/${id}/steps`} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancel</Link>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Step</button>
          </div>
        </form>
      </div>
    </div>
  );
}
