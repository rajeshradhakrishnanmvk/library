import { Timestamp } from 'firebase/firestore';

export interface Book {
    id?: string;
    title: string;
    author: string;
    isbn?: string;
    year?: string;
    genre?: string;
    description?: string;
    coverImageUrl?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface BookFormData {
    title: string;
    author: string;
    isbn?: string;
    year?: string;
    genre?: string;
    description?: string;
    coverImageUrl?: string;
}