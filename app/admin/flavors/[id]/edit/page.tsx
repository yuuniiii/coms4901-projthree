import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateFlavor } from "../../actions";

export default async function EditFlavorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: flavor } = await supabase
    .from("humor_flavors")
    .select("*")
    .eq("id", id)
    .single();

  if (!flavor) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link href="/admin/flavors" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Flavors
        </Link>
        <h1 className="text-3xl font-bold">Edit Humor Flavor: {flavor.slug}</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border dark:border-gray-800 shadow">
        <form action={updateFlavor} className="space-y-4">
          <input type="hidden" name="id" value={flavor.id} />
          
          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1">
              Slug (URL-friendly name)
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              defaultValue={flavor.slug}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              defaultValue={flavor.description || ""}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/admin/flavors"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Update Flavor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
