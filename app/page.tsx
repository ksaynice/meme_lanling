import React from 'react';
import Upload from '@/components/Upload';
import SearchGallery from '@/components/SearchGallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            OCR Image Search (Next.js)
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Upload images to automatically extract text, then search through your library using keywords.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Upload />
        </div>

        <SearchGallery />
      </div>
    </div>
  );
}
