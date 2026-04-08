import { checkAdmin } from "@/lib/admin-check";
import { TestingForm } from "./testing-form";

export default async function TestingPage() {
  const { supabase } = await checkAdmin();

  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("id, slug, description")
    .order("slug", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Humor Flavor Testing</h1>
        <p className="text-muted-foreground">
          Upload an image and select a humor flavor to test the caption generation pipeline.
        </p>
      </div>

      <TestingForm flavors={flavors || []} />
    </div>
  );
}