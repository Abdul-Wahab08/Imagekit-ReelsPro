import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    const req = await request.json()
    const prompt = `Give a single short description of about 8 to 12 words on ${req}`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    if (!response || !response.candidates || !response.candidates[0].content?.parts) {
        return NextResponse.json(
            {
                success: false,
                message: "Text Upload Fails"
            },
            {
                status: 429
            }
        )
    }

    return NextResponse.json(
        {
            success: true,
            Data: response.candidates[0].content.parts[0].text
        },
        {
            status: 200
        }
    )
}
