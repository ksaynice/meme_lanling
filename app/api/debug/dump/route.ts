import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await sql`
      SELECT id, filename, text_content, upload_time, url 
      FROM images 
      ORDER BY id DESC 
      LIMIT 50;
    `;

        return NextResponse.json({
            count: result.rowCount,
            rows: result.rows
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
