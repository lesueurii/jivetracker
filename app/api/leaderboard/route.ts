import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/app/utils/db'
import { getAbbreviatedAddress } from '@/app/utils/common'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '25', 10)
        const dateRange = searchParams.get('dateRange') || 'all'

        const leaderboard = await getLeaderboard(limit, dateRange)

        const formattedLeaderboard = leaderboard.map(entry => ({
            ...entry,
            solanaWalletAddress: entry.solanaWalletAddress
        }))

        return NextResponse.json({ leaderboard: formattedLeaderboard })
    } catch (error) {
        console.error('Error in leaderboard:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
