import { NextResponse } from 'next/server'
import { migrateStreamRecords } from '@/app/utils/db'

export async function GET() {
    try {
        await migrateStreamRecords()
        return NextResponse.json({ message: 'Migration completed successfully' }, { status: 200 })
    } catch (error) {
        console.error('Migration failed:', error)
        return NextResponse.json({ message: 'Migration failed', error: String(error) }, { status: 500 })
    }
}
