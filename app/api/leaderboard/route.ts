import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const getAbbreviatedAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export async function GET() {
    try {
        if (!kv) {
            throw new Error('KV is not properly initialized')
        }
        // Fetch all user data from KV
        const usersData = await kv.get('users')

        if (!usersData) {
            return NextResponse.json({ leaderboard: [] })
        }

        // Sort users by stream count in descending order
        const sortedUsers = Object.entries(usersData)
            .map(([spotifyUserId, data]) => ({ spotifyUserId, ...data }))
            .sort((a, b) => b.streams - a.streams)
            .slice(0, 25) // Get top 25 users

        // Format the leaderboard data
        const leaderboard = sortedUsers.map((data, index) => ({
            rank: index + 1,
            streamCount: data.streams,
            solanaWalletAddress: getAbbreviatedAddress(data.solana_wallet_address)
        }))

        return NextResponse.json({ leaderboard })
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return NextResponse.json({ message: 'Error fetching leaderboard' }, { status: 500 })
    }
}
