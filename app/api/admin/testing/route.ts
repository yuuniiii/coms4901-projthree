import { checkAdmin } from "@/lib/admin-check";

export async function POST(req: Request) {
  try {
    const { supabase } = await checkAdmin();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return new Response(JSON.stringify({ error: "Unauthorized: No session found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { imageId, humorFlavorId } = body;

    if (!imageId || !humorFlavorId) {
      return new Response(JSON.stringify({ error: "Missing imageId or humorFlavorId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authHeader = `Bearer ${session.access_token}`;

    // GENERATE CAPTIONS
    // Since the image already exists in the DB, we skip Steps 1, 2, and 3 
    // and go straight to the generation pipeline using the existing imageId.
    console.log("TRIGGERING PIPELINE for existing image:", imageId);
    console.log("Humor Flavor ID:", humorFlavorId);

    const generateResponse = await fetch("https://api.almostcrackd.ai/pipeline/generate-captions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        imageId,
        humorFlavorId: Number(humorFlavorId),
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error("Generation error:", errorText);
      throw new Error(`Failed to generate captions: ${errorText}`);
    }

    const data = await generateResponse.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No captions returned from pipeline");
    }

    // Extract caption text robustly
    const captions = data
      .map((item: any) =>
        typeof item === "string" ? item : item?.content ?? item?.caption ?? null
      )
      .filter(Boolean);

    if (captions.length === 0) {
      console.error("Unexpected pipeline response shape:", data);
      throw new Error("No caption text found in pipeline response");
    }

    return new Response(JSON.stringify({ captions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Pipeline failure:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
