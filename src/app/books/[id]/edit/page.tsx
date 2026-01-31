'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Book, BookFormData } from '@/types/book';
import { getBookById, updateBook } from '@/lib/bookService';
import BookForm from '@/components/BookForm';

export default function EditBookPage() {
    const router = useRouter();
    const params = useParams();
    const bookId = params.id as string;
    const { user, loading: authLoading } = useAuth();

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
            return;
        }
        loadBook();
    }, [bookId, user, authLoading, router]);

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

    const handleSubmit = async (data: BookFormData) => {
        try {
            await updateBook(bookId, data);
            alert('Book updated successfully!');
            router.push(`/books/${bookId}`);
        } catch (error) {
            alert('Failed to update book');
            console.error('Error updating book:', error);
        }
    };

    if (loading || authLoading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="text-center py-12">Loading...</div>
                </div>
            </main>
        );
    }

    if (!book) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 py-8">
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

    const initialData: BookFormData = {
        title: book.title,
        author: book.author,
        isbn: book.isbn || '',
        year: book.year || '',
        genre: book.genre || '',
        description: book.description || '',
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href={`/books/${bookId}`} className="text-blue-600 hover:text-blue-800">
                        ← Back to Book
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Book</h1>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <BookForm
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push(`/books/${bookId}`)}
                        submitLabel="Update Book"
                    />
                </div>
            </div>
        </main>
    );
}