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