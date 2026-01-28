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
import { db } from './firebase';
import { Book, BookFormData } from '@/types/book';

const BOOKS_COLLECTION = 'books';

// Create a new book
export async function createBook(bookData: BookFormData): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, BOOKS_COLLECTION), {
        ...bookData,
        createdAt: now,
        updatedAt: now,
    });
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
    await updateDoc(docRef, {
        ...bookData,
        updatedAt: Timestamp.now(),
    });
}

// Delete a book
export async function deleteBook(id: string): Promise<void> {
    const docRef = doc(db, BOOKS_COLLECTION, id);
    await deleteDoc(docRef);
}
