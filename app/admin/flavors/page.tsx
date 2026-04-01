import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Settings2, Trash2, Edit } from "lucide-react";
import { deleteFlavor } from "./actions";

export default async function FlavorsPage() {
  const supabase = await createClient();

  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return <div>Error loading flavors: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Humor Flavors</h1>
        <Link
          href="/admin/flavors/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Flavor
        </Link>
      </div>

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
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{flavor.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{flavor.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
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
                  <form action={deleteFlavor} method="post" className="inline">
                    <input type="hidden" name="id" value={flavor.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      title="Delete Flavor"
                      onClick={(e) => {
                        if (!confirm("Are you sure you want to delete this flavor?")) {
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
    </div>
  );
}
