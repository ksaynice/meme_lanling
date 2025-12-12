'use client';

import React, { useState, useEffect } from 'react';
import FilenameEditor from './FilenameEditor';

interface SearchResult {
    id: number;
    filename: string;
    path: string;
    upload_time: string;
    url: string;
}

const SearchGallery = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedImage, setSelectedImage] = useState<SearchResult | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Initial load
    useEffect(() => {
        // Only load on mount or when explicit search action happens, handled by fetchImages
        fetchImages(1, '', true);
    }, []);

    const fetchImages = async (pageNum: number, searchQuery: string, reset: boolean) => {
        if (reset) {
            setResults([]);
            setPage(1);
        }

        setSearching(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=12`);
            if (res.ok) {
                const data = await res.json();
                if (reset) {
                    setResults(data.results);
                } else {
                    setResults(prev => [...prev, ...data.results]);
                }
                setHasMore(data.hasMore);
                setPage(pageNum);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSearching(false);
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        fetchImages(1, query, true);
    };

    const handleLoadMore = () => {
        fetchImages(page + 1, query, false);
    };

    const downloadImage = (url: string, filename: string) => {
        // Vercel Blob URLs are CORS enabled usually. 
        // We can force download by fetch blob or just opening in new tab.
        // Opening in new tab is safest for basic images.
        window.open(url, '_blank');
    };

    const updateImage = (updated: SearchResult) => {
        setSelectedImage(updated);
        setResults(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    return (
        <div className="space-y-8">
            {/* Search Input */}
            <div className="search-container">
                <form onSubmit={handleSearch} className="relative group">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="🔍 Search for memes..."
                        className="search-input"
                    />
                    <button type="submit" className="btn-search" disabled={searching}>
                        {searching ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        )}
                    </button>
                </form>
            </div>

            {/* Results Grid */}
            <div className="gallery-grid">
                {results.map((result) => (
                    <div
                        key={result.id}
                        onClick={() => setSelectedImage(result)}
                        className="gallery-card group"
                    >
                        <div className="card-image-container">
                            <img
                                src={result.url}
                                alt={result.filename}
                                className="card-image"
                            />
                            <div className="card-overlay">
                                <p className="text-white text-sm font-medium truncate">{result.filename}</p>
                                <p className="text-white/80 text-xs">Click to view</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center py-8">
                    <button
                        onClick={handleLoadMore}
                        className="btn-primary"
                        disabled={searching}
                    >
                        {searching ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}

            {results.length === 0 && !searching && (
                <div className="text-center py-20">
                    <div className="inline-block p-6 rounded-full bg-white/50 backdrop-blur-sm mb-4">
                        <span className="text-4xl">🤔</span>
                    </div>
                    <p className="text-xl text-slate-600 font-medium">
                        {query ? 'No memes found matching that.' : 'No memes uploaded yet. Start the collection!'}
                    </p>
                </div>
            )}


            {/* Lightbox / Modal */}
            {selectedImage && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="lightbox-content relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button (Top-Right) */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-20"
                            title="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        {/* Image */}
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.filename}
                            className="lightbox-image"
                        />

                        {/* Controls & Title */}
                        <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-xl">
                            <FilenameEditor
                                image={selectedImage}
                                onUpdate={(newName) => updateImage({ ...selectedImage, filename: newName })}
                            />

                            <p className="text-white/60 text-sm text-center mb-4">
                                通过修改文件名增加搜索的人工修改文件名以适配搜索
                            </p>

                            <div className="lightbox-controls flex flex-row gap-4">
                                <button
                                    onClick={() => downloadImage(selectedImage.url, selectedImage.filename)}
                                    className="btn-primary"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Download
                                </button>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="btn-secondary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchGallery;
