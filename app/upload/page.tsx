import React from 'react';
import Upload from '@/components/Upload';
import Link from 'next/link';

export default function UploadPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-pink-600">
                        🚀 Upload New Memes
                    </h1>
                    <Link href="/" className="px-4 py-2 text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-full transition-colors">
                        ← Back to Gallery
                    </Link>
                </div>
                <Upload />
            </div>
        </div>
    );
}
