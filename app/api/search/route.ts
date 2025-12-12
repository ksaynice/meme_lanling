import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { Segment, useDefault } from 'segmentit';

const segmentit = useDefault(new Segment());

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    try {
        let result;

        if (!query) {
            // No query: Return all images
            result = await sql`
                SELECT id, filename, url, upload_time 
                FROM images 
                ORDER BY upload_time DESC
            `;
        } else {
            // Segment query
            const segmentedQuery = segmentit.doSegment(query, { simple: true }).join(' ');

            // Perform Search
            // Using ILIKE with %keyword% for simple MVP matching.
            // For robust production search, we would use Postgres tsvector/tsquery.
            // But since we pre-segmented the text in DB, simple token matching might work "okay" with ILIKE for MVP.
            // Actually, let's search for the raw query OR segmented interactions.
            // Better yet: Since we stored "segmented" text in DB, we should match against segmented query parts?
            // Let's stick to simple ILIKE %query% against the segmented text for now.

            // Note: Vercel Postgres `sql` template literal safely parameterizes input.
            // We construct the pattern %query% manually.
            const pattern = `%${query}%`;

            // Also try to match individual segments logic if needed, but keeping it simple first.

            result = await sql`
                SELECT id, filename, url, upload_time 
                FROM images 
                WHERE (text_content ILIKE ${pattern} OR filename ILIKE ${pattern})
                ORDER BY upload_time DESC
            `;
        }

        // Map to frontend expected format
        const startPath = '/'; // Vercel Blob returns absolute URLs usually, so we don't need relative path prefix logic like local

        const response = result.rows.map(row => ({
            id: row.id,
            filename: row.filename,
            url: row.url, // Blob URLs are absolute https://...
            path: row.url,
            upload_time: row.upload_time
        }));

        return NextResponse.json(response);

    } catch (error) {
        console.error('Search Error:', error);
        return NextResponse.json({ error: 'Search failed', details: String(error) }, { status: 500 });
    }
}
