import { createClient } from "@/lib/supabase/server";
import { TestingForm } from "./testing-form";

export default async function TestingPage() {
  const supabase = await createClient();

  // Fetch images from the test set
  const { data: images } = await supabase
    .from("images")
    .select("id, url, additional_context")
    .limit(20);

  // Fetch available humor flavors
  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("id, slug, description");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Humor Flavor Testing</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Choose an image and a flavor to test the caption generation chain.
      </p>

      <TestingForm images={images || []} flavors={flavors || []} />
    </div>
  );
}
