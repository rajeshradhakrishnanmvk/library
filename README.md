# Book Collection App

A Next.js application for managing your book collection using Firebase Firestore.

## Features

- ✨ Add, view, edit, and delete books
- 🔥 Firebase Firestore integration (not Realtime Database)
- 📱 Responsive design with Tailwind CSS
- 🎨 Clean and modern UI
- 🚀 Built with Next.js 14 App Router
- 📝 TypeScript for type safety

## Book Schema

Each book in the collection contains:
- **title** (string, required)
- **author** (string, required)
- **isbn** (string, optional)
- **year** (string, optional)
- **genre** (string, optional)
- **description** (string, optional)
- **createdAt** (timestamp)
- **updatedAt** (timestamp)

## Prerequisites

- Node.js 18+ installed
- A Firebase project with Firestore enabled

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Firestore Database** (not Realtime Database):
   - Click on "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location and click "Enable"
4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click on the web icon (</>) to create a web app
   - Copy the firebaseConfig object

## Installation

1. Clone or extract the project files

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
books-app/
├── app/
│   ├── books/
│   │   ├── [id]/
│   │   │   ├── edit/
│   │   │   │   └── page.tsx       # Edit book page
│   │   │   └── page.tsx           # View book detail page
│   │   └── new/
│   │       └── page.tsx           # Add new book page
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page (list all books)
│   └── globals.css                # Global styles
├── components/
│   ├── BookForm.tsx               # Form component for add/edit
│   └── BookList.tsx               # Component to display book list
├── lib/
│   ├── firebase.ts                # Firebase initialization
│   └── bookService.ts             # Firestore CRUD operations
├── types/
│   └── book.ts                    # TypeScript types
├── .env.local.example             # Environment variables template
├── package.json                   # Dependencies
└── README.md                      # This file
```

## Available Pages

- **Home** (`/`) - View all books in a grid layout
- **Add Book** (`/books/new`) - Add a new book to the collection
- **View Book** (`/books/[id]`) - View details of a specific book
- **Edit Book** (`/books/[id]/edit`) - Edit an existing book

## Firestore Security Rules

For production, update your Firestore security rules. In the Firebase Console:

1. Go to Firestore Database → Rules
2. Update the rules (example for authenticated users):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /books/{bookId} {
      allow read: if true;  // Anyone can read
      allow write: if request.auth != null;  // Only authenticated users can write
    }
  }
}
```

For development/testing, you can use:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** Open access rules should only be used for development!

## Building for Production

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **Firebase Firestore** - NoSQL cloud database
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React** - UI library

## Troubleshooting

### Books not loading?
- Check your Firebase configuration in `.env.local`
- Ensure Firestore is enabled (not Realtime Database)
- Check browser console for errors
- Verify your Firestore security rules allow read access

### Cannot add books?
- Check Firestore security rules allow write access
- Verify all required fields (title and author) are filled

## License

MIT