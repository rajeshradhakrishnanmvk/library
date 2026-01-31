'use server';

import { ai } from '@/lib/genkit';

export async function generateBookMetadata(title: string, author: string) {
    try {
        const descriptionPrompt = `Write a compelling, intuitive, and short description (max 100 words) for the book "${title}" by ${author}. Focus on the themes and why a reader would love it.`;

        const { text: description } = await ai.generate(descriptionPrompt);

        const coverPromptPrompt = `Create a vivid, artistic English text prompt for an AI image generator to create a book cover for "${title}" by ${author}. The book is about: ${description}. Describe the visual elements, style, and mood. Keep it under 50 words.`;

        const { text: coverPrompt } = await ai.generate(coverPromptPrompt);

        return {
            success: true,
            description,
            coverPrompt,
        };
    } catch (error) {
        console.error("AI Generation Error:", error);
        return {
            success: false,
            error: "Failed to generate metadata. Ensure API keys are configured.",
        };
    }
}
