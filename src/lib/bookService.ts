import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    query,
    orderBy,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Book, BookFormData } from '@/types/book';

const BOOKS_COLLECTION = 'books';

// Helper to remove undefined fields from an object
function sanitizeData<T extends object>(data: T): T {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach((key) => {
        if (sanitized[key as keyof T] === undefined) {
            delete sanitized[key as keyof T];
        }
    });
    return sanitized;
}

// Create a new book
export async function createBook(bookData: BookFormData): Promise<string> {
    const now = Timestamp.now();
    const dataToSave = sanitizeData({
        ...bookData,
        createdAt: now,
        updatedAt: now,
    });
    const docRef = await addDoc(collection(db, BOOKS_COLLECTION), dataToSave);
    return docRef.id;
}

// Get all books
export async function getAllBooks(): Promise<Book[]> {
    const q = query(collection(db, BOOKS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    } as Book));
}

// Get a single book by ID
export async function getBookById(id: string): Promise<Book | null> {
    const docRef = doc(db, BOOKS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return {
            id: docSnap.id,
            ...docSnap.data(),
        } as Book;
    }
    return null;
}

// Update a book
export async function updateBook(id: string, bookData: Partial<BookFormData>): Promise<void> {
    const docRef = doc(db, BOOKS_COLLECTION, id);
    const dataToSave = sanitizeData({
        ...bookData,
        updatedAt: Timestamp.now(),
    });
    await updateDoc(docRef, dataToSave);
}

// Delete a book and its associated files
export async function deleteBook(id: string): Promise<void> {
    const book = await getBookById(id);
    if (book) {
        // Helper to delete a file from storage given its URL
        const deleteFile = async (url?: string) => {
            if (!url) return;
            try {
                // Create a reference from the HTTPS URL
                const fileRef = ref(storage, url);
                await deleteObject(fileRef);
            } catch (error) {
                console.warn(`Failed to delete file at ${url}:`, error);
                // Continue deletion of other assets/doc even if one fails
            }
        };

        await Promise.all([
            deleteFile(book.coverImageUrl),
            deleteFile(book.aiCoverImageUrl),
            deleteFile(book.voiceUrl)
        ]);
    }

    const docRef = doc(db, BOOKS_COLLECTION, id);
    await deleteDoc(docRef);
}
