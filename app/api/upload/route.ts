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

        // Determine Filename from OCR text (Priority: OCR Text > Original Filename)
        // Take first 30 chars, remove special chars to keep it clean
        let finalFilename = file.name;
        if (extractedText && extractedText.trim().length > 0) {
            // Remove line breaks and excessive whitespace
            const cleanText = extractedText.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
            if (cleanText.length > 0) {
                finalFilename = cleanText.substring(0, 30);
            }
        }

        const segmentedFilename = segmentit.doSegment(finalFilename, { simple: true }).join(' ');

        // Combine for full text search context
        // NOTE: In the new dual-column search strategy, we might strictly separate them,
        // but keeping them combined in 'text_content' as a fallback or for "OCR Context" is fine.
        // However, the user asked to split them conceptuallly.
        // Let's store the RAW OCR text in 'text_content' primarily.
        // But for backwards compatibility and "Search All" logic, putting everything in text_content is safest for now
        // UNLESS we update the schema to strictly separate them.
        // The Plan says: "Search: Dual-column search (Filename + Text Content)".
        // So we will insert `finalFilename` into `filename` column.
        // And `segmentedText` into `text_content`.

        const fullSearchText = segmentedText; // Just the OCR text in text_content column now? 
        // User said: "text content只包含ocr的识别中文的内容 并且tokenize。 filename的 延用文件名的"
        // Wait, User said: "filename的 延用文件名的" works for the SEARCH logic (filename content).
        // BUT also said: "1. 上传后 用ocr识别的文字当成新文件名存储"
        // So `filename` column should store the OCR-derived name.
        // And `text_content` stores the TOKENIZED OCR text.

        const textContentToStore = segmentedText;

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
      VALUES (${finalFilename}, ${blob.url}, ${textContentToStore})
      RETURNING id;
    `;

        return NextResponse.json({
            id: result.rows[0].id,
            filename: finalFilename,
            url: blob.url
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
    }
}
