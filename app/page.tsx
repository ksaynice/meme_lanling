import React from 'react';
import SearchGallery from '@/components/SearchGallery';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              OCR Image Database
            </h1>
            <p className="mt-2 text-slate-600">
              Search and manage your image library.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Upload New Image
          </Link>
        </div>

        <SearchGallery />
      </div>
    </div>
  );
}
