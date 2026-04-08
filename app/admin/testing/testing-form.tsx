"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";

interface Flavor {
  id: number;
  slug: string;
  description: string | null;
}

export function TestingForm({ flavors }: { flavors: Flavor[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setResults([]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedFlavorId) return;

    setIsGenerating(true);
    setResults([]);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("humorFlavorId", selectedFlavorId);

    try {
      console.log("Submitting test generation request...");
      console.log("- File:", file.name, file.type, file.size);
      console.log("- Flavor ID:", selectedFlavorId);

      const response = await fetch("/api/admin/testing", {
        method: "POST",
        body: formData,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Upload Image
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors min-h-[160px] flex flex-col items-center justify-center gap-2"
          >
            {previewUrl ? (
              <div className="relative aspect-video w-full max-h-40">
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill 
                  className="object-contain rounded"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
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
                  className="h-8 w-8"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <span>Click or drag to upload image</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select Humor Flavor
          </label>
          <select
            value={selectedFlavorId}
            onChange={(e) => setSelectedFlavorId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          disabled={!file || !selectedFlavorId || isGenerating}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          {isGenerating ? "Uploading & Generating..." : "Generate Caption"}
        </button>

        {error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
            {error}
          </div>
        )}
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Generated Output</h2>
        <div className="bg-muted p-6 rounded-lg min-h-[240px] border flex flex-col items-center justify-center italic text-center gap-4 relative">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground animate-pulse">Running pipeline...</p>
            </div>
          ) : results.length > 0 ? (
  <div className="w-full space-y-3 not-italic text-left">
    {results.map((caption, i) => (
      <div
        key={i}
        className="rounded-md border bg-background p-4"
      >
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Caption {i + 1}
        </p>
        <p className="text-base leading-relaxed font-medium whitespace-pre-wrap">
          {caption}
        </p>
      </div>
    ))}
  </div>
) : (
            <p className="text-muted-foreground">Generated caption will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
}
