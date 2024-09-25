import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const getAbbreviatedAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export async function GET(request: Request) {
    try {
        if (!kv) {
            throw new Error('KV is not properly initialized')
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '25', 10)
        const dateRange = searchParams.get('dateRange') || 'all'

        // Fetch all user data from KV
        const usersData = await kv.get('users')

        if (!usersData) {
            return NextResponse.json({ leaderboard: [] })
        }

        const now = new Date()
        const getDateLimit = () => {
            switch (dateRange) {
                case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000)
                case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                default: return new Date(0) // 'all' time
            }
        }
        const dateLimit = getDateLimit()

        // Sort users by stream count in descending order
        const sortedUsers = Object.entries(usersData)
            .map(([spotifyUserId, data]: [string, any]) => {
                const filteredStreams = data.stream_records.filter((timestamp: string) =>
                    new Date(timestamp) > dateLimit
                )
                return {
                    spotifyUserId,
                    ...data,
                    filteredStreamCount: filteredStreams.length
                }
            })
            .sort((a, b) => b.filteredStreamCount - a.filteredStreamCount)
            .slice(0, limit)

        // Format the leaderboard data
        const leaderboard = sortedUsers.map((data, index) => ({
            rank: index + 1,
            streamCount: data.filteredStreamCount,
            solanaWalletAddress: getAbbreviatedAddress(data.solana_wallet_address)
        }))

        return NextResponse.json({ leaderboard })
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return NextResponse.json({ message: 'Error fetching leaderboard' }, { status: 500 })
    }
}
