'use client';

import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { processImage } from '@/utils/imageProcessor';

interface UploadItem {
    id: string; // Unique ID for list rendering
    file: File;
    status: 'pending' | 'ocr' | 'uploading' | 'success' | 'error';
    progress: number;
    message: string;
}

const Upload = () => {
    const [queue, setQueue] = useState<UploadItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const workerRef = useRef<Tesseract.Worker | null>(null);

    // Initial Tesseract Worker
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        }
    }, []);

    // Queue Processor
    useEffect(() => {
        const processNext = async () => {
            if (isProcessing) return;

            const nextIndex = queue.findIndex(item => item.status === 'pending');
            if (nextIndex === -1) return;

            setIsProcessing(true);
            const currentItem = queue[nextIndex];

            // Helper to update specific item in queue
            const updateItem = (status: UploadItem['status'], progress: number, message: string) => {
                setQueue(prev => prev.map((item, idx) =>
                    idx === nextIndex ? { ...item, status, progress, message } : item
                ));
            };

            try {
                updateItem('ocr', 0, 'Preprocessing Image...');

                // 1. Preprocess Image (Enhance Contrast for Memes)
                // We use dynamic import during runtime if needed, or just import at top.
                // Converting File -> Base64 Data URL optimized for OCR
                const optimizedImage = await processImage(currentItem.file);

                updateItem('ocr', 10, 'Initializing OCR Engine...');

                // 2. OCR (Client Side)
                const { data: { text } } = await Tesseract.recognize(
                    optimizedImage, // Pass the processed image URL
                    'chi_sim+eng',
                    {
                        logger: (m) => {
                            if (m.status === 'recognizing text') {
                                // Clamp progress between 0-90 during OCR
                                const p = Math.round(m.progress * 80) + 10;
                                updateItem('ocr', p, `Analyzing Text... ${Math.round(m.progress * 100)}%`);
                            } else {
                                updateItem('ocr', 10, m.status);
                            }
                        }
                    }
                );

                console.log(`[${currentItem.file.name}] Extracted:`, text.substring(0, 50) + '...');

                // 2. Upload
                updateItem('uploading', 90, 'Uploading to Database...');

                const formData = new FormData();
                formData.append('file', currentItem.file);
                formData.append('text', text);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.details || errData.error || 'Upload failed');
                }

                updateItem('success', 100, `Extracted: ${text}`);

            } catch (error) {
                console.error(error);
                updateItem('error', 0, error instanceof Error ? error.message : 'Failed');
            } finally {
                setIsProcessing(false);
            }
        };

        processNext();
    }, [queue, isProcessing]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newItems: UploadItem[] = Array.from(files).map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            status: 'pending',
            progress: 0,
            message: 'Waiting...'
        }));

        setQueue(prev => [...prev, ...newItems]);

        // Reset input so same files can be selected again if needed
        e.target.value = '';
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Batch Upload</h2>

            {/* Dropzone */}
            <div className="flex flex-col items-center justify-center w-full mb-6">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="mb-1 text-sm text-slate-500"><span className="font-semibold">Click to upload multiple images</span></p>
                        <p className="text-xs text-slate-500">JPG, PNG supported</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                </label>
            </div>

            {/* List */}
            <div className="space-y-3">
                {queue.map((item) => (
                    <div key={item.id} className="flex items-center p-3 bg-slate-50 rounded border border-slate-100">
                        <div className="flex-1 min-w-0 mr-4">
                            <p className="text-sm font-medium text-slate-900 truncate">{item.file.name}</p>
                            <p className={`text-xs ${item.status === 'error' ? 'text-red-500' :
                                item.status === 'success' ? 'text-green-600' : 'text-slate-500'
                                }`}>
                                {item.message}
                            </p>
                            {item.status === 'success' && (
                                <p className="text-xs text-slate-400 mt-1 italic break-words">
                                    OCR: {item.message.includes('Extracted') ? item.message.replace('Extracted: ', '') : '...'}
                                </p>
                            )}
                            {(item.status === 'ocr' || item.status === 'uploading') && (
                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                    <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                                </div>
                            )}
                        </div>
                        <div className="flex-shrink-0">
                            {item.status === 'pending' && <span className="text-slate-400 text-xs">Queue</span>}
                            {item.status === 'success' && <span className="text-green-500 text-lg">✓</span>}
                            {item.status === 'error' && <span className="text-red-500 text-lg">✕</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default Upload;
