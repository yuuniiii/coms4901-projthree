"use client";

import Link from "next/link";
import { Settings2, Trash2, Edit, Copy, Check, X, Loader2 } from "lucide-react";
import { deleteFlavor, duplicateFlavor } from "./actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Flavor {
  id: string;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
}

interface FlavorsTableProps {
  flavors: Flavor[];
}

export function FlavorsTable({ flavors }: FlavorsTableProps) {
  const router = useRouter();
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleDelete = async (formData: FormData) => {
    if (!confirm("Are you sure you want to delete this flavor?")) {
      return;
    }
    try {
      await deleteFlavor(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete flavor");
    }
  };

  const startDuplicating = (flavor: Flavor) => {
    setDuplicatingId(flavor.id);
    setNewSlug(`${flavor.slug}-copy`);
    setInlineError(null);
  };

  const cancelDuplicating = () => {
    setDuplicatingId(null);
    setNewSlug("");
    setInlineError(null);
  };

  const confirmDuplicating = async () => {
    if (!duplicatingId || !newSlug) return;
    
    setIsSubmitting(true);
    setInlineError(null);
    
    try {
      const result = await duplicateFlavor(duplicatingId, newSlug);
      if (result.success) {
        setDuplicatingId(null);
        setNewSlug("");
        router.refresh();
        alert("Flavor duplicated successfully!");
      } else {
        setInlineError(result.error || "Failed to duplicate flavor");
      }
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {flavors.map((flavor) => (
            <tr key={flavor.id}>
              <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                {duplicatingId === flavor.id ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="block w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Enter new slug..."
                      autoFocus
                      disabled={isSubmitting}
                    />
                    {inlineError && (
                      <p className="text-xs text-red-600">{inlineError}</p>
                    )}
                  </div>
                ) : (
                  flavor.slug
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {duplicatingId === flavor.id ? (
                  <span className="text-gray-400 italic">Duplicating...</span>
                ) : (
                  flavor.description
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                {duplicatingId === flavor.id ? (
                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={confirmDuplicating}
                      disabled={isSubmitting || !newSlug}
                      className="text-green-600 hover:text-green-900 dark:hover:text-green-400 disabled:opacity-50"
                      title="Confirm Duplicate"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 inline animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 inline" />
                      )}
                    </button>
                    <button
                      onClick={cancelDuplicating}
                      disabled={isSubmitting}
                      className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400"
                      title="Cancel"
                    >
                      <X className="w-4 h-4 inline" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => startDuplicating(flavor)}
                      className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400"
                      title="Duplicate Flavor"
                    >
                      <Copy className="w-4 h-4 inline" />
                    </button>
                    <Link
                      href={`/admin/flavors/${flavor.id}/steps`}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                      title="Manage Steps"
                    >
                      <Settings2 className="w-4 h-4 inline" />
                    </Link>
                    <Link
                      href={`/admin/flavors/${flavor.id}/edit`}
                      className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-400"
                      title="Edit Flavor"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </Link>
                    <form action={handleDelete} className="inline">
                      <input type="hidden" name="id" value={flavor.id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        title="Delete Flavor"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </form>
                  </>
                )}
              </td>
            </tr>
          ))}
          {flavors.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                No humor flavors found. Create one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
