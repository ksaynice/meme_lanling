'use client';

import React, { useState } from 'react';

const Upload = () => {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Use internal API API (relative path)
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setMessage(`Uploaded! ID: ${data.id}. OCR is processing in background.`);
        } catch (error) {
            setMessage('Error uploading image.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Upload Image</h2>
            <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-500">JPEG, PNG (MAX. 10MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>
            </div>
            {uploading && <p className="mt-4 text-blue-500 animate-pulse">Uploading...</p>}
            {message && <p className={`mt-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
        </div>
    );
};

export default Upload;
