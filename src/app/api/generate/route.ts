import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Starting image generation with prompt:", prompt);

    const output = (await replicate.run(
      "sundai-club/flux-bubbledog:8d89b1684eb74993c2680754707367f1472401722508d0a12df081364006c51f",
      {
        input: {
          prompt,
          num_inference_steps: 28,
          guidance_scale: 7.5,
          model: "dev",
          //   useFileOutput: false,
        },
      }
    )) as string[];

    console.log("Replicate API response:", output);
    console.log("Replicate API response:", output[0]);

    return NextResponse.json({ imageUrl: output[0] });
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
