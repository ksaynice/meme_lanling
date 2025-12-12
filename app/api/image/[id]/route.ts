import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { filename } = body;

        if (!id || !filename) {
            return NextResponse.json({ error: 'Missing id or filename' }, { status: 400 });
        }

        // Update Postgres
        // We only update the 'filename' column. The 'text_content' (OCR) remains unchanged.
        // This effectively splits the "Search Scope" as requested:
        // - Filename: Editable, correctable by user
        // - Text Content: Original OCR data

        await sql`
            UPDATE images 
            SET filename = ${filename}
            WHERE id = ${id}
        `;

        return NextResponse.json({ success: true, id, filename });

    } catch (error) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: 'Update failed', details: String(error) }, { status: 500 });
    }
}
