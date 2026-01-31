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

export async function generateVoiceAudio(text: string) {
    try {
        const encodedText = encodeURIComponent(text.slice(0, 200));
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;

        const response = await fetch(ttsUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch TTS: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString('base64');

        return {
            success: true,
            audioData: `data:audio/mpeg;base64,${base64Audio}`,
        };
    } catch (error) {
        console.error("Voice Generation Error:", error);
        return {
            success: false,
            error: "Failed to generate voice audio.",
        };
    }
}
