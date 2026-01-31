'use client';

import { Book } from '@/types/book';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface BookListProps {
    books: Book[];
    onDelete: (id: string) => Promise<void>;
}

export default function BookList({ books, onDelete }: BookListProps) {
    const { user } = useAuth();
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
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white overflow-hidden flex flex-col"
                >
                    <div className="flex gap-2 mb-4 h-48">
                        <div className="flex-1 relative overflow-hidden rounded-md bg-gray-100 flex items-center justify-center border border-gray-200 group">
                            {book.coverImageUrl ? (
                                <img
                                    src={book.coverImageUrl}
                                    alt={`User cover of ${book.title}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-[10px] text-center px-1">No User Image</span>
                            )}
                            <div className="absolute top-0 left-0 bg-gray-800/60 text-white text-[8px] px-1 py-0.5 rounded-br uppercase tracking-tighter font-bold">User</div>
                        </div>

                        <div className="flex-1 relative overflow-hidden rounded-md bg-purple-50 flex items-center justify-center border border-purple-200 group">
                            {book.aiCoverImageUrl ? (
                                <img
                                    src={book.aiCoverImageUrl}
                                    alt={`AI Persona of ${book.title}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-purple-300 text-[10px] text-center px-1">No AI Persona</span>
                            )}
                            <div className="absolute top-0 left-0 bg-purple-600/80 text-white text-[8px] px-1 py-0.5 rounded-br uppercase tracking-tighter font-bold">AI Persona</div>
                            {book.voiceUrl && (
                                <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
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
                        {user ? (
                            <Link
                                href={`/books/${book.id}/edit`}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                                Edit
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded opacity-50 cursor-not-allowed"
                            >
                                Edit
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(book.id!, book.title)}
                            disabled={!user}
                            className={`px-3 py-1 bg-red-600 text-white text-sm rounded ${user ? 'hover:bg-red-700' : 'opacity-50 cursor-not-allowed'
                                }`}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}