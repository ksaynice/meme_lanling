import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { Segment, useDefault } from 'segmentit';

// Initialize Segmentit for Chinese segmentation
const segmentit = useDefault(new Segment());

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const extractedText = formData.get('text') as string || ''; // Get text from client

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 1. Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        // 2. Segment text for Search (Server-side segmentation is fine, it's fast)
        // We segment both the filename and the OCR text provided by the client
        const segmentedText = segmentit.doSegment(extractedText, { simple: true }).join(' ');
        const segmentedFilename = segmentit.doSegment(file.name, { simple: true }).join(' ');

        // Combine for full text search context
        const fullSearchText = `${segmentedFilename} ${segmentedText}`;

        // 3. Save to Vercel Postgres
        // Ensure table exists (naive approach for MVP)
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
