import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET() {
    try {
        // Fetch all user data from KV
        const users = await kv.hgetall('users') as Record<string, { streams: number }>

        // Sort users by stream count in descending order
        const sortedUsers = Object.entries(users)
            .sort(([, a], [, b]) => b.streams - a.streams)
            .slice(0, 25) // Get top 25 users

        // Format the leaderboard data
        const leaderboard = sortedUsers.map(([userId, data], index) => ({
            rank: index + 1,
            userId,
            streamCount: data.streams
        }))

        return NextResponse.json({ leaderboard })
    } catch (error) {
        // console.error('Error fetching leaderboard:', error)
        return NextResponse.json({ message: 'Error fetching leaderboard' }, { status: 500 })
    }
}
