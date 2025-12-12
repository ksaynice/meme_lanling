import React from 'react';
import SearchGallery from '@/components/SearchGallery';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50">
          <div className="flex items-center gap-6">
            <a href="/" className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg transform hover:scale-110 transition-transform duration-300 cursor-pointer block" title="Back to Home / Refresh">
              <Image
                src="/logo.jpg"
                alt="Lanling Logo"
                fill
                className="object-cover"
              />
            </a>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600 tracking-tight drop-shadow-sm">
                偷蓝领图
              </h1>
              <p className="text-xl md:text-2xl font-bold text-slate-700 mt-1 italic font-serif">
                Hahahahahahaha
              </p>
            </div>
          </div>

          <Link
            href="/upload"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 to-indigo-600 font-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
          >
            <span className="mr-2 text-2xl">✨</span> Upload Meme
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40"></div>
          </Link>
        </div>

        <SearchGallery />
      </div>
    </div>
  );
}
