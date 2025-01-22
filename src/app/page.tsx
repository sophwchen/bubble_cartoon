"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState(null);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateStoryAndImages = async () => {
    setIsLoading(true);
    try {
      // First, generate the story
      const storyResponse = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const storyData = await storyResponse.json();

      if (!storyResponse.ok) {
        throw new Error(storyData.error || "Failed to generate story");
      }

      setStory(storyData);

      // Then, generate images for each panel
      const imagePromises = storyData.comics.map(async (panel: any) => {
        const imageResponse = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: panel.prompt }),
        });
        const imageData = await imageResponse.json();

        if (!imageResponse.ok) {
          throw new Error(imageData.error || "Failed to generate image");
        }

        return imageData.imageUrl;
      });

      const generatedImages = await Promise.all(imagePromises);
      setImages(generatedImages);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-8">
      <main className="max-w-2xl mx-auto flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-purple-800 dark:text-purple-200 mt-12 text-center">
          Bubble&apos;s Adventure
        </h1>

        <div className="w-full space-y-4">
          <textarea
            className="w-full p-4 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white resize-none h-32"
            placeholder="Describe your comic story... (e.g., 'in outer space')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={generateStoryAndImages}
            disabled={isLoading || !prompt}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate Story"}
          </button>
        </div>

        {isLoading && (
          <div className="text-purple-600 dark:text-purple-300">
            Creating your story and images...
          </div>
        )}

        {story && (
          <div className="mt-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {story.comics.map((panel: any, index: number) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
                >
                  <h3 className="font-bold text-lg mb-3">Panel {index + 1}</h3>
                  {images[index] && (
                    <div className="relative w-full aspect-square mb-3">
                      <Image
                        src={images[index]}
                        alt={`Panel ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <p className="text-gray-800 dark:text-gray-200 text-base font-medium">
                    {panel.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Original Image Generation Code
export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateComic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      console.log("response: ", data);
      console.log("Response received, URL length:", data.imageUrl?.length);

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error("No image URL received");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-8">
      <main className="max-w-2xl mx-auto flex flex-col items-center gap-8">
        {generatedImage && (
          <div className="mt-8 rounded-lg overflow-hidden shadow-xl">
            <img
              src={generatedImage}
              alt="Generated comic panel"
              className="w-full h-auto"
              onError={(e) => {
                console.error("Image failed to load:", e);
                alert("Failed to load the generated image");
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
*/
