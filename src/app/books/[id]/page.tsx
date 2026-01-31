'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Book } from '@/types/book';
import { getBookById, deleteBook } from '@/lib/bookService';

export default function BookDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bookId = params.id as string;
    const { user } = useAuth();

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBook();
    }, [bookId]);

    const loadBook = async () => {
        try {
            setLoading(true);
            const fetchedBook = await getBookById(bookId);
            setBook(fetchedBook);
        } catch (error) {
            console.error('Error loading book:', error);
            alert('Failed to load book');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${book?.title}"?`)) {
            try {
                await deleteBook(bookId);
                alert('Book deleted successfully');
                router.push('/');
            } catch (error) {
                console.error('Error deleting book:', error);
                alert('Failed to delete book');
            }
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-12">Loading...</div>
                </div>
            </main>
        );
    }

    if (!book) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">Book not found</p>
                        <Link href="/" className="text-blue-600 hover:text-blue-800">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                        ← Back to Books
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{book.title}</h1>
                    <p className="text-xl text-gray-600 mb-6">by {book.author}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {book.coverImageUrl ? (
                            <div className="rounded-lg overflow-hidden shadow-sm relative bg-gray-100 min-h-[300px] flex items-center justify-center border border-gray-200">
                                <img
                                    src={book.coverImageUrl}
                                    alt={`User cover of ${book.title}`}
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-gray-900/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest border border-white/20">User Uploaded</div>
                            </div>
                        ) : (
                            <div className="rounded-lg overflow-hidden relative bg-gray-50 min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 italic">
                                No User Photo
                                <div className="absolute top-4 left-4 bg-gray-400 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest">User Uploaded</div>
                            </div>
                        )}
                        {book.aiCoverImageUrl ? (
                            <div className="rounded-lg overflow-hidden shadow-2xl relative bg-purple-50 min-h-[300px] flex items-center justify-center border-2 border-purple-200 ring-4 ring-purple-50">
                                <img
                                    src={book.aiCoverImageUrl}
                                    alt={`AI Persona of ${book.title}`}
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-purple-600 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest border border-white/20 shadow-lg">AI Persona</div>
                            </div>
                        ) : (
                            <div className="rounded-lg overflow-hidden relative bg-purple-50/30 min-h-[300px] flex items-center justify-center border-2 border-dashed border-purple-100 text-purple-300 italic">
                                Persona not generated
                                <div className="absolute top-4 left-4 bg-purple-200 text-purple-400 text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest">AI Persona</div>
                            </div>
                        )}
                    </div>

                    {book.voiceUrl && (
                        <div className="mb-8">
                            <button
                                onClick={() => {
                                    const audio = new Audio(book.voiceUrl);
                                    audio.play();
                                }}
                                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                                <span className="font-semibold uppercase tracking-wide text-xs">Play AI Voice Persona</span>
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {book.genre && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">Genre</span>
                                <p className="text-gray-900">{book.genre}</p>
                            </div>
                        )}

                        {book.year && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">Year</span>
                                <p className="text-gray-900">{book.year}</p>
                            </div>
                        )}

                        {book.isbn && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">ISBN</span>
                                <p className="text-gray-900">{book.isbn}</p>
                            </div>
                        )}
                    </div>

                    {book.description && (
                        <div className="mb-6">
                            <span className="text-sm font-medium text-gray-500 block mb-2">Description</span>
                            <p className="text-gray-700 whitespace-pre-wrap">{book.description}</p>
                        </div>
                    )}

                    <div className="border-t pt-6 flex gap-3">
                        {user ? (
                            <Link
                                href={`/books/${book.id}/edit`}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Edit Book
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="px-4 py-2 bg-green-600 text-white rounded opacity-50 cursor-not-allowed"
                            >
                                Edit Book
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={!user}
                            className={`px-4 py-2 bg-red-600 text-white rounded ${user ? 'hover:bg-red-700' : 'opacity-50 cursor-not-allowed'
                                }`}
                        >
                            Delete Book
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}