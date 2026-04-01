"use server";

import { createClient } from "@/lib/supabase/server";

export async function generateCaption(imageId: string, flavorSlug: string) {
  const supabase = await createClient();

  // Get the session to pass the access token if needed by the API
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch("https://api.almostcrackd.ai/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({
      image_id: imageId,
      flavor_slug: flavorSlug,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to generate caption");
  }

  const data = await response.json();
  return data.caption;
}
