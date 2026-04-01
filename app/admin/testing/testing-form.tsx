"use client";

import { useState } from "react";
import { generateCaption } from "./actions";

interface Image {
  id: string;
  url: string | null;
  additional_context: string | null;
}

interface Flavor {
  id: number;
  slug: string;
  description: string | null;
}

export function TestingForm({ images, flavors }: { images: Image[]; flavors: Flavor[] }) {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setResult(null);

    try {
      const output = await generateCaption(selectedImage, selectedFlavor);
      setResult(output);
    } catch (error) {
      setResult("Error generating caption. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-lg border dark:border-gray-800 shadow">
        <div>
          <label className="block text-sm font-medium mb-2">Select Test Image</label>
          <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImage(img.id)}
                className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                  selectedImage === img.id ? "border-blue-600 ring-2 ring-blue-600" : "border-transparent"
                }`}
              >
                <img src={img.url || ""} alt="Test image" className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Humor Flavor</label>
          <select
            value={selectedFlavor}
            onChange={(e) => setSelectedFlavor(e.target.value)}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800"
            required
          >
            <option value="">-- Select a Flavor --</option>
            {flavors.map((f) => (
              <option key={f.id} value={f.slug}>
                {f.slug} - {f.description}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedImage || !selectedFlavor || isGenerating}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? "Generating..." : "Generate Caption"}
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Generated Output</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg min-h-[200px] border dark:border-gray-700 flex items-center justify-center italic text-center">
          {result ? (
            <p className="text-lg whitespace-pre-wrap">{result}</p>
          ) : (
            <p className="text-gray-500">Output will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
}
