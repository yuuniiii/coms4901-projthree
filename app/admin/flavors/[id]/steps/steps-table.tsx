"use client";

import Link from "next/link";
import { Trash2, Edit, ArrowUp, ArrowDown } from "lucide-react";
import { deleteStep, reorderStep } from "./actions";

interface Step {
  id: string;
  order_by: number;
  llm_user_prompt: string | null;
  llm_models?: { name: string } | null;
  humor_flavor_step_types?: { slug: string } | null;
}

interface StepsTableProps {
  steps: Step[];
  flavorId: string;
}

export function StepsTable({ steps, flavorId }: StepsTableProps) {
  const handleDelete = async (formData: FormData) => {
    if (!confirm("Are you sure you want to delete this step?")) {
      return;
    }
    try {
      await deleteStep(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete step");
    }
  };

  return (
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
                  <input type="hidden" name="flavorId" value={flavorId} />
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
                  <input type="hidden" name="flavorId" value={flavorId} />
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
                  href={`/admin/flavors/${flavorId}/steps/${step.id}/edit`}
                  className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-400"
                >
                  <Edit className="w-4 h-4 inline" />
                </Link>
                <form action={handleDelete} className="inline">
                  <input type="hidden" name="id" value={step.id} />
                  <input type="hidden" name="flavorId" value={flavorId} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
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
  );
}
