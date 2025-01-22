import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
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

    const systemPrompt = `
    Create a 3-panel comic story about a dog's adventure. For each panel, provide:
    1. An image generation prompt that includes 'Bubble white dog' and ends with 'warm colors'
    2. A caption that refers to the dog as 'Bubble'

    Format the output as JSON with this structure:
    {
        "comics": [
            {
                "prompt": "Image generation prompt here",
                "caption": "Caption text here"
            }
        ]
    }
    `;

    console.log("Getting prompt from OpenAI");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }
    const story_json = JSON.parse(content);
    return NextResponse.json(story_json);
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate story";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
