'use client';

import React, { useState } from 'react';

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

    // Initial load: Fetch all images
    React.useEffect(() => {
        const fetchAll = async () => {
            setSearching(true);
            try {
                const response = await fetch('/api/search');
                if (response.ok) {
                    setResults(await response.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setSearching(false);
            }
        };
        fetchAll();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        // Allow empty query to reset search (show all)

        setSearching(true);
        try {
            // Use internal API API (relative path)
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.details || errData.error || 'Search failed');
            }
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Search Images</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for text in images (supports Chinese)..."
                    style={{ color: 'black' }} // Hack: Tailwind text color not applying correctly in some templates? explicitly setting for now just in case
                    className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                />
                <button
                    type="submit"
                    disabled={searching}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {searching ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((result) => (
                    <div key={result.id} className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                        <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative h-48">
                            <img
                                src={result.url}
                                alt={result.filename}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="p-4">
                            <p className="text-sm font-medium text-slate-900 truncate" title={result.filename}>{result.filename}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(result.upload_time).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
            {results.length === 0 && !searching && (
                <p className="text-center text-slate-500 py-8">
                    {query ? 'No matching images found.' : 'No images uploaded yet.'}
                </p>
            )}
        </div>
    );
};

export default SearchGallery;
