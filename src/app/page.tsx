'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book } from '@/types/book';
import { getAllBooks, deleteBook } from '@/lib/bookService';
import { useAuth } from '@/context/AuthContext';
import BookList from '@/components/BookList';
import FirebaseHealth from '@/components/AppHealth';

export default function Home() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedBooks = await getAllBooks();
      setBooks(fetchedBooks);
    } catch (err) {
      setError('Failed to load books. Please check your Firebase configuration.');
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBook(id);
      await loadBooks();
    } catch (err) {
      alert('Failed to delete book');
      console.error('Error deleting book:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Book Collection</h1>
          {user && (
            <Link
              href="/books/new"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Book
            </Link>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && <BookList books={books} onDelete={handleDelete} />}
      </div>
      <div>
        <FirebaseHealth />
      </div>
    </main>
  );
}
