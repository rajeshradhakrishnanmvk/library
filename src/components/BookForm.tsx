'use client';

import { useState, useRef } from 'react';
import { BookFormData } from '@/types/book';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { generateBookMetadata, generateVoiceAudio, fetchImageAsBase64 } from '@/app/actions/book-ai';



interface BookFormProps {
  initialData?: BookFormData;
  onSubmit: (data: BookFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function BookForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Submit'
}: BookFormProps) {
  const [formData, setFormData] = useState<BookFormData>({
    title: initialData?.title || '',
    author: initialData?.author || '',
    isbn: initialData?.isbn || '',
    year: initialData?.year || '',
    genre: initialData?.genre || '',
    description: initialData?.description || '',
    coverImageUrl: initialData?.coverImageUrl || '',
    aiCoverImageUrl: initialData?.aiCoverImageUrl || '',
    voiceUrl: initialData?.voiceUrl || '',
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string>(formData.aiCoverImageUrl || '');
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string>(formData.voiceUrl || '');
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = formData.coverImageUrl;
      let aiImageUrl = formData.aiCoverImageUrl;

      if (coverImageFile) {
        const storageRef = ref(storage, `covers/${Date.now()}_${coverImageFile.name}`);
        const snapshot = await uploadBytes(storageRef, coverImageFile, { contentType: coverImageFile.type });
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // If we have an AI preview URL that is NOT a firebase URL, we should store it
      if (aiPreviewUrl && !aiPreviewUrl.includes('firebasestorage')) {
        try {
          // Use server action to fetch image to avoid CORS issues
          const result = await fetchImageAsBase64(aiPreviewUrl);

          if (result.success && result.base64) {
            const res = await fetch(result.base64);
            const blob = await res.blob();

            const aiStorageRef = ref(storage, `ai_covers/${Date.now()}_ai.png`);
            const aiSnapshot = await uploadBytes(aiStorageRef, blob, {
              contentType: result.contentType || 'image/png'
            });
            aiImageUrl = await getDownloadURL(aiSnapshot.ref);
          } else {
            console.warn("Storage failed, falling back to pollinations URL:", result.error);
            aiImageUrl = aiPreviewUrl;
          }
        } catch (e) {
          console.error("Failed to store AI image, falling back:", e);
          aiImageUrl = aiPreviewUrl;
        }
      } else if (aiPreviewUrl) {
        aiImageUrl = aiPreviewUrl;
      }

      await onSubmit({
        ...formData,
        coverImageUrl: imageUrl,
        aiCoverImageUrl: aiImageUrl,
        voiceUrl: voicePreviewUrl
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save book. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnhance = async () => {
    if (!formData.title || !formData.author) {
      alert("Please enter Title and Author to enhance the profile.");
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await generateBookMetadata(formData.title, formData.author);
      if (result.success && result.description) {
        const description = result.description || formData.description;
        setFormData(prev => ({
          ...prev,
          description: description,
        }));

        if (result.coverPrompt) {
          const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(result.coverPrompt)}?nologo=true&width=512&height=768`;
          setAiPreviewUrl(aiUrl);

          // Optionally auto-generate voice when enhancing? 
          // Let's just update the description for now.
        }
      } else {
        console.error("Enhancement failed:", result.error);
        alert("Failed to enhance book profile. " + (result.error || ""));
      }
    } catch (err) {
      console.error("Enhance error", err);
      alert("An error occurred during enhancement.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!formData.description) {
      alert("Description is required to generate voice.");
      return;
    }

    setIsGeneratingVoice(true);
    try {
      // Use server action to bypass CORS
      const result = await generateVoiceAudio(formData.description);

      if (!result.success || !result.audioData) {
        throw new Error(result.error || "Failed to generate audio");
      }

      // Convert data URL to blob
      const response = await fetch(result.audioData);
      const blob = await response.blob();

      const storageRef = ref(storage, `voices/${Date.now()}_voice.mp3`);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setVoicePreviewUrl(downloadUrl);
      setFormData(prev => ({ ...prev, voiceUrl: downloadUrl }));
      alert("Voice generated and stored successfully!");
    } catch (err) {
      console.error("Voice generation error:", err);
      alert("Failed to generate/store voice. Using browser fallback for playback.");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handleVoiceOver = () => {
    if (voicePreviewUrl) {
      if (isSpeaking && audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsSpeaking(false);
        return;
      }

      const audio = new Audio(voicePreviewUrl);
      audioRef.current = audio;
      setIsSpeaking(true);
      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      return;
    }

    if (!formData.description) return;

    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(formData.description);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium mb-1">
          Author <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="isbn" className="block text-sm font-medium mb-1">
          ISBN
        </label>
        <input
          type="text"
          id="isbn"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium mb-1">
          Year
        </label>
        <input
          type="text"
          id="year"
          name="year"
          value={formData.year}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium mb-1">
          Genre
        </label>
        <input
          type="text"
          id="genre"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium mb-1">
          Cover Image
        </label>
        <input
          type="file"
          id="coverImage"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">User Uploaded</p>
            <div className="aspect-[2/3] w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              {coverImageFile ? (
                <img
                  src={URL.createObjectURL(coverImageFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : formData.coverImageUrl ? (
                <img
                  src={formData.coverImageUrl}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm p-4 text-center">No user image uploaded</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wider">AI Generated Persona</p>
            <div className="aspect-[2/3] w-full bg-purple-50 rounded-lg border-2 border-dashed border-purple-200 flex items-center justify-center overflow-hidden relative">
              {aiPreviewUrl ? (
                <img
                  src={aiPreviewUrl}
                  alt="AI Persona"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-purple-300 text-sm p-4 text-center">
                  {isEnhancing ? (
                    <div className="animate-pulse">Generating persona...</div>
                  ) : (
                    "Click Enhance to generate"
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={handleGenerateVoice}
          disabled={isGeneratingVoice || !formData.description}
          className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 flex items-center gap-2"
        >
          {isGeneratingVoice ? '🎙 Storing Voice...' : '🎙 Generate & Store Voice'}
        </button>
        <button
          type="button"
          onClick={handleEnhance}
          disabled={isEnhancing || !formData.title || !formData.author}
          className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center gap-2"
        >
          {isEnhancing ? '✨ Enhancing...' : '✨ AI Enhance Persona'}
        </button>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1 flex justify-between items-center">
          <span>Description</span>
          {formData.description && (
            <button
              type="button"
              onClick={handleVoiceOver}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {isSpeaking ? '⏹ Stop Voice Over' : '🔊 Play Voice Over'}
            </button>
          )}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}