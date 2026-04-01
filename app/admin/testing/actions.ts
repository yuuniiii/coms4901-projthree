"use server";

import { checkAdmin } from "@/lib/admin-check";

export async function generateCaption(imageId: string, flavorSlug: string) {
  const { user } = await checkAdmin();
  
  // Get the session to pass the access token if needed by the API
  // Note: checkAdmin already verified the user exists and is an admin.
  // We might need to get the session again or just use the user.
  
  // Fetching session for the token
  const { supabase } = await checkAdmin();
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
