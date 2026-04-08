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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const humorFlavorId = formData.get("humorFlavorId");

    if (!file || !humorFlavorId) {
      return new Response(JSON.stringify({ error: "Missing file or humorFlavorId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authHeader = `Bearer ${session.access_token}`;

    // STEP 1: Generate presigned URL
    console.log("STEP 1: Generating presigned URL...");
    const presignedResponse = await fetch("https://api.almostcrackd.ai/pipeline/generate-presigned-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ contentType: file.type }),
    });

    if (!presignedResponse.ok) {
      const errorText = await presignedResponse.text();
      console.error("Presigned URL error:", errorText);
      throw new Error(`Failed to generate presigned URL: ${errorText}`);
    }

    const { presignedUrl, cdnUrl } = await presignedResponse.json();
    console.log("Presigned URL generated:", { cdnUrl });

    // STEP 2: Upload file to presignedUrl
    console.log("STEP 2: Uploading file to presigned URL...");
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Upload error:", errorText);
      throw new Error(`Failed to upload file to presigned URL: ${errorText}`);
    }
    console.log("Upload success");

    // STEP 3: Register image
    console.log("STEP 3: Registering image...");
    const registerResponse = await fetch("https://api.almostcrackd.ai/pipeline/upload-image-from-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        imageUrl: cdnUrl,
        isCommonUse: false,
      }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error("Register error:", errorText);
      throw new Error(`Failed to register image: ${errorText}`);
    }

    const { imageId } = await registerResponse.json();
    console.log("Image registered with ID:", imageId);

    // STEP 4: Generate captions
    console.log("STEP 4: Generating captions...");
    console.log("STEP 4 payload", {
  imageId,
  humorFlavorId,
});
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