'use client';

import { Book } from '@/types/book';
import Link from 'next/link';

interface BookListProps {
    books: Book[];
    onDelete: (id: string) => Promise<void>;
}

export default function BookList({ books, onDelete }: BookListProps) {
    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            await onDelete(id);
        }
    };

    if (books.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No books found. Add your first book!
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
                <div
                    key={book.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                    <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
                    <p className="text-gray-600 mb-2">by {book.author}</p>

                    {book.genre && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                            {book.genre}
                        </span>
                    )}

                    {book.year && (
                        <p className="text-sm text-gray-500 mb-2">Year: {book.year}</p>
                    )}

                    {book.isbn && (
                        <p className="text-sm text-gray-500 mb-2">ISBN: {book.isbn}</p>
                    )}

                    {book.description && (
                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                            {book.description}
                        </p>
                    )}

                    <div className="flex gap-2 mt-4">
                        <Link
                            href={`/books/${book.id}`}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                            View
                        </Link>
                        <Link
                            href={`/books/${book.id}/edit`}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => handleDelete(book.id!, book.title)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}