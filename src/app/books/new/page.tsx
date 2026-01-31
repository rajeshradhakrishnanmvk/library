'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BookFormData } from '@/types/book';
import { createBook } from '@/lib/bookService';
import BookForm from '@/components/BookForm';
import Link from 'next/link';

export default function NewBookPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </main>
        );
    }

    const handleSubmit = async (data: BookFormData) => {
        try {
            await createBook(data);
            alert('Book added successfully!');
            router.push('/');
        } catch (error) {
            alert('Failed to add book');
            console.error('Error adding book:', error);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                        ← Back to Books
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Book</h1>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <BookForm
                        onSubmit={handleSubmit}
                        onCancel={() => router.push('/')}
                        submitLabel="Add Book"
                    />
                </div>
            </div>
        </main>
    );
}