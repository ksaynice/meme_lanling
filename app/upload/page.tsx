import React from 'react';
import Upload from '@/components/Upload';
import Link from 'next/link';

export default function UploadPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900">Upload New Image</h1>
                    <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Gallery</Link>
                </div>
                <Upload />
            </div>
        </div>
    );
}
