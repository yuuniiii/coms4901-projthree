"use client";

import { useState } from "react";
import Image from "next/image";

interface Flavor {
  id: number;
  slug: string;
  description: string | null;
}

interface DBImage {
  id: string;
  url: string | null;
  image_description: string | null;
  additional_context: string | null;
  created_datetime_utc: string;
}

interface TestingFormProps {
  flavors: Flavor[];
  images: DBImage[];
}

export function TestingForm({ flavors, images }: TestingFormProps) {
  const [selectedImageId, setSelectedImageId] = useState<string>("");
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImageId || !selectedFlavorId) return;

    setIsGenerating(true);
    setResults([]);
    setError(null);

    try {
      console.log("Submitting test generation request...");
      console.log("- Image ID:", selectedImageId);
      console.log("- Flavor ID:", selectedFlavorId);

      const response = await fetch("/api/admin/testing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: selectedImageId,
          humorFlavorId: selectedFlavorId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate caption");
      }

      setResults(Array.isArray(data.captions) ? data.captions : []);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedImageUrl = images.find((img) => img.id === selectedImageId)?.url;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm h-fit">
        <div className="space-y-4">
          <label className="text-sm font-medium leading-none">
            Select Existing Image
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto p-1 border rounded-md">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => {
                  setSelectedImageId(img.id);
                  setResults([]);
                }}
                className={`relative aspect-square cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                  selectedImageId === img.id
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
              >
                {img.url ? (
                  <Image
                    src={img.url}
                    alt={img.image_description || "Database image"}
                    fill
                    sizes="(max-width: 768px) 33vw, 150px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                    No URL
                  </div>
                )}
                {selectedImageId === img.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground text-sm italic">
                No images found in database
              </div>
            )}
          </div>
        </div>

        {selectedImageId && (
          <div className="p-4 bg-muted rounded-md border space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Selected Image Info
            </p>
            <div className="flex gap-4 items-start">
              {selectedImageUrl && (
                <div className="relative w-20 aspect-square rounded-md overflow-hidden border">
                  <Image src={selectedImageUrl} alt="Selected" fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground break-all font-mono">
                  ID: {selectedImageId}
                </p>
                {images.find(i => i.id === selectedImageId)?.image_description && (
                  <p className="text-sm line-clamp-2">
                    {images.find(i => i.id === selectedImageId)?.image_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Select Humor Flavor
          </label>
          <select
            value={selectedFlavorId}
            onChange={(e) => setSelectedFlavorId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">-- Select a Flavor --</option>
            {flavors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.slug} - {f.description}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedImageId || !selectedFlavorId || isGenerating}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          {isGenerating ? "Generating..." : "Generate Caption"}
        </button>

        {error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
            {error}
          </div>
        )}
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Generated Output</h2>
        <div className="bg-muted p-6 rounded-lg min-h-[400px] border flex flex-col items-center justify-start italic text-center gap-4 relative">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 my-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground animate-pulse">Running pipeline...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="w-full space-y-4 not-italic text-left">
              {results.map((caption, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70 bg-primary/10 px-2 py-0.5 rounded">
                      Caption {i + 1}
                    </p>
                  </div>
                  <p className="text-base leading-relaxed font-medium whitespace-pre-wrap">
                    {caption}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="my-auto flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-background border flex items-center justify-center opacity-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <line x1="10" x2="8" y1="9" y2="9" />
                </svg>
              </div>
              <p className="text-muted-foreground">Select an image and flavor to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
