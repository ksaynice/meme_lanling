import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { Segment, useDefault } from 'segmentit';

const segmentit = useDefault(new Segment());

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const offset = (page - 1) * limit;

    try {
        let rows;
        // Fetch limit + 1 to detect if there are more items
        const fetchLimit = limit + 1;

        if (!query) {
            // No query: Return all images with pagination
            const result = await sql`
                SELECT id, filename, url, upload_time 
                FROM images 
                ORDER BY upload_time DESC
                LIMIT ${fetchLimit} OFFSET ${offset}
            `;
            rows = result.rows;
        } else {
            // Search query with pagination
            const pattern = `%${query}%`;
            const result = await sql`
                SELECT id, filename, url, upload_time 
                FROM images 
                WHERE (text_content ILIKE ${pattern} OR filename ILIKE ${pattern})
                ORDER BY upload_time DESC
                LIMIT ${fetchLimit} OFFSET ${offset}
            `;
            rows = result.rows;
        }

        // Check for hasMore
        const hasMore = rows.length > limit;
        const data = hasMore ? rows.slice(0, limit) : rows;

        const results = data.map(row => ({
            id: row.id,
            filename: row.filename,
            url: row.url,
            path: row.url,
            upload_time: row.upload_time
        }));

        return NextResponse.json({
            results,
            hasMore,
            page
        });

    } catch (error) {
        console.error('Search Error:', error);
        return NextResponse.json({ error: 'Search failed', details: String(error) }, { status: 500 });
    }
}
