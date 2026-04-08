import { checkAdmin } from "@/lib/admin-check";
import { TestingForm } from "./testing-form";

export default async function TestingPage() {
  const { supabase } = await checkAdmin();

  // Fetch images for the gallery
  const { data: images } = await supabase
    .from("images")
    .select("id, url, image_description, additional_context, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(50);

  // Fetch humor flavors
  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("id, slug, description")
    .order("slug", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Humor Flavor Testing</h1>
        <p className="text-muted-foreground">
          Select an existing image from the database and a humor flavor to test the caption generation pipeline.
        </p>
      </div>

      <TestingForm 
        flavors={flavors || []} 
        images={images || []}
      />
    </div>
  );
}