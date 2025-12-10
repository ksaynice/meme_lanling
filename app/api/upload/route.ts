import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import { Segment, useDefault } from 'segmentit';

// Initialize Segmentit for Chinese segmentation
const segmentit = useDefault(new Segment());

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 1. Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        // 2. OCR using Tesseract.js
        // Note: Tesseract.js loads workers from CDN. In serverless, this might be slow on cold start.
        // 'chi_sim' is Chinese Simplified.
        const { data: { text } } = await Tesseract.recognize(
            blob.url,
            'chi_sim+eng',
            {
                logger: m => console.log(m)
            }
        );

        // 3. Segment text for Search
        const segmentedText = segmentit.doSegment(text, { simple: true }).join(' ');
        const segmentedFilename = segmentit.doSegment(file.name, { simple: true }).join(' ');

        // Combine for full text search context
        const fullSearchText = `${segmentedFilename} ${segmentedText}`;

        // 4. Save to Vercel Postgres
        // Ensure table exists (naive approach for MVP, better to do in migration script)
        await sql`CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      text_content TEXT,
      upload_time TIMESTAMP DEFAULT NOW()
    );`;

        const result = await sql`
      INSERT INTO images (filename, url, text_content)
      VALUES (${file.name}, ${blob.url}, ${fullSearchText})
      RETURNING id;
    `;

        return NextResponse.json({
            id: result.rows[0].id,
            filename: file.name,
            url: blob.url
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
    }
}
