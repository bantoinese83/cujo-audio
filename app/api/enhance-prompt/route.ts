import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

export async function POST(request: Request) {
  try {
    const { prompt, style } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    // Define system instructions based on enhancement style
    let systemInstruction = ""
    switch (style) {
      case "creative":
        systemInstruction = `You are a creative music prompt enhancer. Your task is to transform basic music prompts into rich, evocative descriptions that will inspire unique music generation. Focus on mood, atmosphere, and emotional qualities. Keep the enhanced prompt concise (under 50 words) but vivid and imaginative.`
        break
      case "detailed":
        systemInstruction = `You are a detailed music production expert. Your task is to enhance music prompts by adding specific production elements, instruments, and sonic characteristics. Include details about arrangement, mixing techniques, and sound design. Keep the enhanced prompt concise (under 50 words) but technically rich.`
        break
      case "technical":
        systemInstruction = `You are a technical music theory expert. Your task is to enhance music prompts with proper music theory terminology, audio engineering concepts, and professional production language. Include details about scales, chord progressions, and audio processing where relevant. Keep the enhanced prompt concise (under 50 words) but technically precise.`
        break
      default:
        systemInstruction = `You are a music prompt enhancer. Your task is to improve basic music prompts to create better music generation results. Keep the enhanced prompt concise (under 50 words) but descriptive.`
    }

    // Use the latest Gemini model if available
    const model = "gemini-2.0-flash"

    // Call the Gemini API using the new SDK pattern
    const response = await ai.models.generateContent({
      model,
      contents: `Enhance this music prompt: "${prompt}"`,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    })

    // The SDK returns .text for the main output
    const enhancedPrompt = response.text?.trim() || ""

    return NextResponse.json({ enhancedPrompt })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
