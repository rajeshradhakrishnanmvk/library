'use client';

import { useState } from 'react';
import { BookFormData } from '@/types/book';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { generateBookMetadata } from '@/app/actions/book-ai';



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
  const [formData, setFormData] = useState<BookFormData>(
    initialData || {
      title: '',
      author: '',
      isbn: '',
      year: '',
      genre: '',
      description: '',
      coverImageUrl: '',
    }
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);


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

      if (coverImageFile) {
        const storageRef = ref(storage, `covers/${Date.now()}_${coverImageFile.name}`);
        const snapshot = await uploadBytes(storageRef, coverImageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await onSubmit({ ...formData, coverImageUrl: imageUrl });
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
        setFormData(prev => ({
          ...prev,
          description: result.description || prev.description,
          coverImageUrl: result.coverPrompt
            ? `https://image.pollinations.ai/prompt/${encodeURIComponent(result.coverPrompt)}?nologo=true`
            : prev.coverImageUrl
        }));
        // Reset file input if we generated a new image
        if (result.coverPrompt) {
          setCoverImageFile(null);
          // Also explicitly clear the file input element if possible, but state null is main tracker
          const fileInput = document.getElementById('coverImage') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
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

  const handleVoiceOver = () => {
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formData.coverImageUrl && !coverImageFile && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Current Cover:</p>
            <img
              src={formData.coverImageUrl}
              alt="Book Cover"
              className="w-32 h-48 object-cover rounded shadow-md border"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleEnhance}
          disabled={isEnhancing || !formData.title || !formData.author}
          className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center gap-2"
        >
          {isEnhancing ? '✨ Enhancing w/ Genkit...' : '✨ Enhance Profile with AI'}
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